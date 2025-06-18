"use client"

import type React from "react"
import { useState, useEffect, useCallback, createContext } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User, Session, SupabaseClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

const ADMIN_DISCORD_IDS = process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS?.split(",") || [
  "907231041167716352",
  "1068270434702860358",
]

interface AuthContextType {
  supabase: SupabaseClient
  user: User | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signInWithDiscord: () => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const checkAdminStatus = useCallback(async (user: User) => {
    try {
      const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub
      if (!discordId) {
        setIsAdmin(false)
        return
      }
      const isAdminUser = ADMIN_DISCORD_IDS.includes(discordId)
      setIsAdmin(isAdminUser)
    } catch (error) {
      console.error("Error checking admin status:", error)
      setIsAdmin(false)
    }
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        checkAdminStatus(session.user)
      } else {
        setIsAdmin(false)
      }
      setIsLoading(false)

      if (event === "SIGNED_IN") {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase, checkAdminStatus])

  const signInWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const value: AuthContextType = {
    supabase,
    user,
    session,
    isLoading,
    isAdmin,
    signInWithDiscord,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

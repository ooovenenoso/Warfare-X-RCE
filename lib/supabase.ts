import { createBrowserClient } from "@supabase/ssr"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { secureDbOperation } from "./encryption"

// Encrypted environment variables
const getEncryptedEnvVar = (key: string): string => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}

export function createClient() {
  return createBrowserClient(
    getEncryptedEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEncryptedEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  )
}

export function createServerComponentClient() {
  const cookieStore = cookies()

  return createServerClient(
    getEncryptedEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEncryptedEnvVar("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )
}

export function createAdminClient() {
  return createSupabaseClient(
    getEncryptedEnvVar("NEXT_PUBLIC_SUPABASE_URL"),
    getEncryptedEnvVar("SUPABASE_SERVICE_ROLE_KEY"),
  )
}

// Export the secureDbOperation for use in other files
export { secureDbOperation }

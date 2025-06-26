"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, User, LogOut, Shield, Loader2, MessageCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"

export function Navbar() {
  const { user, signInWithDiscord, signOut, isLoading, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Store", href: "/store" },
    { name: "Discord", href: "https://discord.gg/playcnqr", external: true },
  ]

  const getUserDisplayName = () => {
    if (!user) return "User"
    return (
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.user_metadata?.global_name ||
      user.email?.split("@")[0] ||
      "User"
    )
  }

  const getUserAvatar = () => {
    if (!user) return "/placeholder.svg?height=40&width=40&text=U"
    return (
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      `/placeholder.svg?height=40&width=40&text=${getUserInitials()}`
    )
  }

  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.charAt(0).toUpperCase()
  }

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <nav className="border-b border-gray-800 bg-black bg-opacity-50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                CNQR
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-600" />
              <div className="hidden sm:block text-sm text-gray-400 font-medium">Credits Store</div>
            </Link>
            <div className="w-32 h-10 bg-gray-800 animate-pulse rounded" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b border-gray-800 bg-black bg-opacity-50 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10 rounded-lg p-1.5">
              <Image src="/warfare-logo.png" alt="Warfare Logo" fill className="object-contain" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                WARFARE
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-600" />
              <div className="hidden sm:block text-sm text-gray-400 font-medium">Credits Store</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="text-gray-300 hover:text-primary transition-colors duration-200 font-medium flex items-center gap-2"
              >
                {item.name === "Discord" && <MessageCircle className="w-4 h-4" />}
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                      <AvatarImage src={getUserAvatar() || "/placeholder.svg"} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-black border-gray-800" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm text-white">{getUserDisplayName()}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      {isAdmin && <p className="text-xs text-primary font-semibold">Admin</p>}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  {user && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/transactions" className="flex items-center cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          <span>Transaction History</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-800" />
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-800" />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <a
                      href="https://discord.gg/playcnqr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center cursor-pointer"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      <span>Discord Server</span>
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-800" />
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-400 focus:text-red-400">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={signInWithDiscord} className="sigma-button" disabled={isLoading}>
                <User className="mr-2 h-4 w-4" />
                SIGN IN WITH DISCORD
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black border-gray-800">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="text-gray-300 hover:text-primary transition-colors duration-200 font-medium text-lg flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name === "Discord" && <MessageCircle className="w-4 h-4" />}
                      {item.name}
                    </Link>
                  ))}

                  {user && (
                    <>
                      <div className="border-t border-gray-800 pt-4">
                        <p className="text-white font-medium">{getUserDisplayName()}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                      <Link
                        href="/transactions"
                        className="text-gray-300 hover:text-primary transition-colors duration-200 font-medium text-lg flex items-center gap-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        Transaction History
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="text-gray-300 hover:text-primary transition-colors duration-200 font-medium text-lg flex items-center gap-2"
                          onClick={() => setIsOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <Button
                        onClick={() => {
                          signOut()
                          setIsOpen(false)
                        }}
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

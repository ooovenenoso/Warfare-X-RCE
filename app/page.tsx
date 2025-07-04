"use client"
import { AuthProvider } from "@/components/auth-provider"
import { HeroSection } from "@/components/hero-section"
import { PackageShowcase } from "@/components/package-showcase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useEffect } from "react"

export default function HomePage() {
  // Track visitor on page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetch("/api/track-visitor", { method: "POST" }).catch(() => {
        // Silently fail on tracking error, not critical for user
      })
    }
  }, [])

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <div className="sigma-bg-effect" />
        <Navbar />
        <main className="flex-1">
          <HeroSection />
          <PackageShowcase />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

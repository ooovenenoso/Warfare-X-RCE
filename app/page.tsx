"use client"

import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { PackageShowcase } from "@/components/package-showcase"

export default function HomePage() {
  useEffect(() => {
    // Track visitor when page loads
    const trackVisitor = async () => {
      try {
        await fetch("/api/track-visitor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
      } catch (error) {
        // Silent error handling for security
      }
    }

    trackVisitor()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sigma-bg-effect" />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PackageShowcase />
      </main>
      <Footer />
    </div>
  )
}

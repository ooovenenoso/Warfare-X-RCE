"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { PackageShowcase } from "@/components/package-showcase"
import { Footer } from "@/components/footer"

async function trackVisitor() {
  try {
    const response = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(5000),
    })
    const location = await response.json()

    await fetch("/api/track-visitor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ip: location.ip,
        userAgent: navigator.userAgent,
        location: {
          country: location.country_name,
          city: location.city,
        },
      }),
      signal: AbortSignal.timeout(5000),
    })
  } catch (error) {
    // Silent error handling
  }
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    trackVisitor()
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20 pointer-events-none" />
      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <PackageShowcase />
        <Footer />
      </div>
    </div>
  )
}

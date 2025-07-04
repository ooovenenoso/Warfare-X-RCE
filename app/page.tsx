"use client"
import { AuthProvider } from "@/components/auth-provider"
import { HeroSection } from "@/components/hero-section"
import { PackageShowcase } from "@/components/package-showcase"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function HomePage() {
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

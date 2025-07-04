import { HeroSection } from "@/components/hero-section"
import { PackageShowcase } from "@/components/package-showcase"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <main>
        <HeroSection />
        <PackageShowcase />
      </main>
      <Footer />
    </div>
  )
}

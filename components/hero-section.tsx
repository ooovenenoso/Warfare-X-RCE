"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Star } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="absolute inset-0 noise-texture"></div>

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-primary rounded-full animate-ping"></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-primary rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 right-10 w-1 h-1 bg-primary rounded-full animate-ping delay-500"></div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Logo */}
          <div className="mb-8 float-animation">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent glow-text">
              CNQR
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-4" />
          </div>

          {/* Main Heading */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">Your Game, Levelled Up</h2>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Purchase premium credits and unlock exclusive features, items, and perks across all CNQR gaming servers
          </p>

          {/* Feature Icons - Más grandes y visibles */}
          <div className="flex justify-center space-x-8 md:space-x-16 mb-12">
            <div className="text-center group">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 glow-border shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Zap className="w-10 h-10 md:w-12 md:h-12 text-white animate-pulse" />
              </div>
              <p className="text-base md:text-lg font-bold text-primary">Instant</p>
              <p className="text-sm text-gray-400">Lightning fast delivery</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 glow-border shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Shield className="w-10 h-10 md:w-12 md:h-12 text-white animate-pulse" />
              </div>
              <p className="text-base md:text-lg font-bold text-green-400">Secure</p>
              <p className="text-sm text-gray-400">Bank-level security</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 glow-border shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Star className="w-10 h-10 md:w-12 md:h-12 text-white animate-pulse" />
              </div>
              <p className="text-base md:text-lg font-bold text-yellow-400">Premium</p>
              <p className="text-sm text-gray-400">Exclusive content</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="px-8 py-6 text-lg glow-hover">
              <Link href="/store">
                Browse Store
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg border-primary text-primary hover:bg-primary hover:text-black"
            >
              <Link href="#packages">View Packages</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">1,250+</div>
              <div className="text-sm text-gray-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-sm text-gray-400">Game Servers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-gray-400">Support</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-gray-400">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

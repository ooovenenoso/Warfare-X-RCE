"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Zap, Shield, Crown, ExternalLink, Sparkles } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

interface Package {
  id: string
  name: string
  description: string
  price: number
  credits: number
  popular?: boolean
  items: string[]
}

interface PriceMode {
  id: string
  name: string
  multiplier: number
  description: string
  color: string
}

export default function StorePage() {
  const { user } = useAuth()
  const [packages, setPackages] = useState<Package[]>([])
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [priceMode, setPriceMode] = useState<PriceMode | null>(null)
  const [activeTab, setActiveTab] = useState("buy")

  useEffect(() => {
    fetchPackages()
    fetchPriceMode()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages")
      if (response.ok) {
        const data = await response.json()
        setPackages(data)
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPriceMode = async () => {
    try {
      const response = await fetch("/api/price-mode")
      if (response.ok) {
        const data = await response.json()
        setPriceMode(data)
      }
    } catch (error) {
      console.error("Error fetching price mode:", error)
    }
  }

  const handlePurchase = async (pkg: Package) => {
    if (!user) {
      toast.error("Please sign in to make a purchase")
      return
    }

    setPurchasing(true)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: pkg.id,
          userId: user.id,
        }),
      })

      if (response.ok) {
        const { url } = await response.json()
        window.location.href = url
      } else {
        toast.error("Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error creating checkout:", error)
      toast.error("An error occurred during checkout")
    } finally {
      setPurchasing(false)
    }
  }

  const getAdjustedPrice = (basePrice: number) => {
    if (!priceMode) return basePrice
    return Math.round(basePrice * priceMode.multiplier)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Sigma Background Effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Navbar />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            WARFARE STORE
          </h1>
          <p className="text-xl text-gray-300 mb-8">Get your premium kits and dominate the battlefield</p>

          {/* Feature Icons */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              <span className="text-sm">Instant Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-green-500" />
              <span className="text-sm">Secure Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-purple-500" />
              <span className="text-sm">Premium Quality</span>
            </div>
          </div>
        </div>

        {/* Price Mode Banner */}
        {priceMode && priceMode.multiplier !== 1 && (
          <div className={`mb-8 p-4 rounded-lg border-2 ${priceMode.color} text-center`}>
            <h3 className="text-xl font-bold mb-2">{priceMode.name}</h3>
            <p className="text-sm opacity-90">{priceMode.description}</p>
            <Badge variant="secondary" className="mt-2">
              {priceMode.multiplier}x Pricing
            </Badge>
          </div>
        )}

        {/* Store Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="buy">Buy Credits</TabsTrigger>
            <TabsTrigger value="spend">Spend Credits</TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={`bg-gray-900 border-gray-700 hover:border-red-500 transition-all duration-300 cursor-pointer ${
                    pkg.popular ? "ring-2 ring-red-500" : ""
                  }`}
                  onClick={() => setSelectedPackage(pkg)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{pkg.name}</CardTitle>
                        <CardDescription className="text-gray-400">{pkg.description}</CardDescription>
                      </div>
                      {pkg.popular && (
                        <Badge className="bg-red-500 text-white">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">${getAdjustedPrice(pkg.price)}</div>
                        <div className="text-sm text-gray-400">{pkg.credits} Credits</div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-white">Includes:</h4>
                        <ul className="space-y-1">
                          {pkg.items.map((item, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-center">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        className="w-full bg-red-600 hover:bg-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePurchase(pkg)
                        }}
                        disabled={purchasing}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {purchasing ? "Processing..." : "Purchase Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="spend" className="space-y-8">
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold mb-4">Coming Soon</h3>
              <p className="text-gray-400">Credit spending features will be available soon. Stay tuned!</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Order Summary Sidebar */}
        {selectedPackage && (
          <div className="fixed right-4 top-1/2 transform -translate-y-1/2 w-80 bg-gray-900 border border-gray-700 rounded-lg p-6 z-50">
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">{selectedPackage.name}</h4>
                <p className="text-sm text-gray-400">{selectedPackage.description}</p>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-bold">${getAdjustedPrice(selectedPackage.price)}</span>
              </div>

              <div className="flex justify-between">
                <span>Credits:</span>
                <span className="font-bold">{selectedPackage.credits}</span>
              </div>

              <Separator />

              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => handlePurchase(selectedPackage)}
                disabled={purchasing}
              >
                {purchasing ? "Processing..." : "Proceed to Checkout"}
              </Button>

              <Button variant="outline" className="w-full bg-transparent" onClick={() => setSelectedPackage(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Discord Integration */}
        <div className="mt-16 text-center">
          <Card className="bg-gray-900 border-gray-700 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white">Join Our Discord</CardTitle>
              <CardDescription className="text-gray-400">
                Get support, updates, and connect with the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                onClick={() => window.open("https://discord.gg/your-server", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Join Discord Server
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}

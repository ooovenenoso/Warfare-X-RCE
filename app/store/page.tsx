"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Zap, Shield, Crown, ExternalLink, Gamepad2, Hammer } from "lucide-react"

interface Package {
  id: string
  name: string
  credits: number
  price: number
  description: string
  features: string[]
  popular?: boolean
  category: "welcome" | "credits"
}

interface Server {
  id: string
  name: string
  description: string
  discord_link: string
}

const fallbackPackages: Package[] = [
  {
    id: "fullpvp-kit",
    name: "FullPvPKit",
    credits: 50000,
    price: 19.99,
    description: "Complete PvP starter package for new warriors",
    features: [
      "Full PvP gear set",
      "Starter weapons collection",
      "Combat consumables",
      "PvP tutorial access",
      "Warrior rank boost",
    ],
    popular: true,
    category: "welcome",
  },
  {
    id: "fullbuilder-kit",
    name: "FullBuilderKit",
    credits: 35000,
    price: 14.99,
    description: "Complete building starter package for creators",
    features: [
      "Building materials pack",
      "Creative tools set",
      "Blueprint collection",
      "Builder tutorial access",
      "Creator rank boost",
    ],
    category: "welcome",
  },
]

const fallbackServers: Server[] = [
  {
    id: "main-server",
    name: "CNQR Main Server",
    description: "Join our main community server",
    discord_link: "https://discord.gg/cnqr",
  },
]

export default function StorePage() {
  const [packages, setPackages] = useState<Package[]>(fallbackPackages)
  const [servers, setServers] = useState<Server[]>(fallbackServers)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [selectedServer, setSelectedServer] = useState<string>("")
  const [priceMode, setPriceMode] = useState<"normal" | "sale" | "premium">("normal")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [packagesResponse, serversResponse, priceModeResponse] = await Promise.allSettled([
        fetch("/api/packages", { signal: AbortSignal.timeout(5000) }),
        fetch("/api/servers", { signal: AbortSignal.timeout(5000) }),
        fetch("/api/price-mode", { signal: AbortSignal.timeout(5000) }),
      ])

      if (packagesResponse.status === "fulfilled" && packagesResponse.value.ok) {
        const packagesData = await packagesResponse.value.json()
        if (Array.isArray(packagesData) && packagesData.length > 0) {
          setPackages(packagesData)
        }
      }

      if (serversResponse.status === "fulfilled" && serversResponse.value.ok) {
        const serversData = await serversResponse.value.json()
        if (Array.isArray(serversData) && serversData.length > 0) {
          setServers(serversData)
        }
      }

      if (priceModeResponse.status === "fulfilled" && priceModeResponse.value.ok) {
        const priceModeData = await priceModeResponse.value.json()
        if (priceModeData.mode) {
          setPriceMode(priceModeData.mode)
        }
      }
    } catch (error) {
      // Silent error handling - use fallback data
    }
  }

  const getPriceMultiplier = () => {
    switch (priceMode) {
      case "sale":
        return 0.8
      case "premium":
        return 1.2
      default:
        return 1
    }
  }

  const getPriceModeLabel = () => {
    switch (priceMode) {
      case "sale":
        return { text: "20% OFF SALE!", color: "bg-green-500" }
      case "premium":
        return { text: "PREMIUM PRICING", color: "bg-purple-500" }
      default:
        return null
    }
  }

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedServer) return

    setLoading(true)
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          serverId: selectedServer,
          priceMultiplier: getPriceMultiplier(),
        }),
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        const { url } = await response.json()
        if (url) {
          window.location.href = url
        }
      }
    } catch (error) {
      // Silent error handling
    } finally {
      setLoading(false)
    }
  }

  // Ensure we always have arrays to map over
  const safePackages = Array.isArray(packages) ? packages : fallbackPackages
  const safeServers = Array.isArray(servers) ? servers : fallbackServers
  const welcomeKits = safePackages.filter((pkg) => pkg.category === "welcome")

  const priceModeLabel = getPriceModeLabel()

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-green-900/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              WARFARE STORE
            </h1>
            <p className="text-xl text-gray-300 mb-6">Welcome to the battlefield. Choose your starter kit.</p>

            {/* Price mode banner */}
            {priceModeLabel && (
              <div className={`inline-block px-4 py-2 rounded-full text-white font-bold mb-6 ${priceModeLabel.color}`}>
                {priceModeLabel.text}
              </div>
            )}

            {/* Feature icons */}
            <div className="flex justify-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-sm">Instant</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                <span className="text-sm">Premium</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="welcome-kits" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700">
                  <TabsTrigger value="welcome-kits" className="data-[state=active]:bg-purple-600">
                    Welcome Kits
                  </TabsTrigger>
                  <TabsTrigger value="spend-credits" className="data-[state=active]:bg-purple-600">
                    Spend Credits
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="welcome-kits" className="mt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {welcomeKits.map((pkg) => (
                      <Card
                        key={pkg.id}
                        className={`bg-gray-900 border-gray-700 hover:border-purple-500 transition-all cursor-pointer ${
                          selectedPackage?.id === pkg.id ? "border-purple-500 ring-2 ring-purple-500/50" : ""
                        } ${pkg.popular ? "ring-2 ring-yellow-500/50" : ""}`}
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              {pkg.id === "fullpvp-kit" ? (
                                <Gamepad2 className="w-5 h-5 text-red-400" />
                              ) : (
                                <Hammer className="w-5 h-5 text-blue-400" />
                              )}
                              {pkg.name}
                            </CardTitle>
                            {pkg.popular && <Badge className="bg-yellow-500 text-black">Popular</Badge>}
                          </div>
                          <CardDescription className="text-gray-400">{pkg.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <div className="text-3xl font-bold text-white">
                              ${(pkg.price * getPriceMultiplier()).toFixed(2)}
                              {priceMode === "sale" && (
                                <span className="text-lg text-gray-400 line-through ml-2">${pkg.price.toFixed(2)}</span>
                              )}
                            </div>
                            <div className="text-sm text-purple-400">
                              {pkg.credits.toLocaleString()} Credits Included
                            </div>
                          </div>

                          <ul className="space-y-2 mb-4">
                            {pkg.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                                {feature}
                              </li>
                            ))}
                          </ul>

                          <Button
                            className={`w-full ${
                              selectedPackage?.id === pkg.id
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-gray-700 hover:bg-gray-600"
                            }`}
                            onClick={() => setSelectedPackage(pkg)}
                          >
                            {selectedPackage?.id === pkg.id ? "Selected" : "Select Kit"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="spend-credits" className="mt-6">
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-8 text-center">
                      <ShoppingCart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
                      <p className="text-gray-400">
                        Credit spending features will be available after you join the server with your welcome kit.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Order summary sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900 border-gray-700 sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedPackage ? (
                    <>
                      <div>
                        <h4 className="font-semibold">{selectedPackage.name}</h4>
                        <p className="text-sm text-gray-400">{selectedPackage.description}</p>
                      </div>

                      <Separator className="bg-gray-700" />

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Package Price:</span>
                          <span>${(selectedPackage.price * getPriceMultiplier()).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Credits:</span>
                          <span className="text-purple-400">{selectedPackage.credits.toLocaleString()}</span>
                        </div>
                        {priceMode === "sale" && (
                          <div className="flex justify-between text-green-400">
                            <span>Discount:</span>
                            <span>-${(selectedPackage.price * 0.2).toFixed(2)}</span>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-gray-700" />

                      <div>
                        <label className="block text-sm font-medium mb-2">Select Server:</label>
                        <select
                          className="w-full p-2 bg-gray-800 border border-gray-600 rounded"
                          value={selectedServer}
                          onChange={(e) => setSelectedServer(e.target.value)}
                        >
                          <option value="">Choose server...</option>
                          {safeServers.map((server) => (
                            <option key={server.id} value={server.id}>
                              {server.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={handlePurchase}
                        disabled={!selectedServer || loading}
                      >
                        {loading
                          ? "Processing..."
                          : `Purchase for $${(selectedPackage.price * getPriceMultiplier()).toFixed(2)}`}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Select a welcome kit to continue</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Discord section */}
              <Card className="bg-gray-900 border-gray-700 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Join Our Community
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {safeServers.map((server) => (
                    <div key={server.id}>
                      <h4 className="font-semibold">{server.name}</h4>
                      <p className="text-sm text-gray-400 mb-2">{server.description}</p>
                      <Button
                        variant="outline"
                        className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
                        onClick={() => window.open(server.discord_link, "_blank")}
                      >
                        Join Discord
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}

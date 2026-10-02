"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Zap,
  Shield,
  Star,
  AlertTriangle,
  Crown,
  Percent,
  CheckCircle,
  Clock,
  Award,
  Sparkles,
  CreditCard,
  Package,
  Gamepad2,
  MessageCircle,
  ExternalLink,
  Sword,
  Hammer,
  Wrench,
  Home,
  Timer,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/components/ui/use-toast"
import { Loader } from "@/components/loader"

interface CreditPackage {
  id: string
  name: string
  description: string
  credits: number
  price: number
  originalPrice?: number
  basePrice: number
  image_url: string
  active: boolean
  popular?: boolean
  bestValue?: boolean
  discount?: number
  priceIncrease?: number
  priceMode: string
}

interface Server {
  id: string
  name: string
  description: string
  active: boolean
}

interface LinkStatus {
  isLinked: boolean
  username: string | null
}

interface ShopItem {
  id: string
  name: string
  cost: number
  vip?: boolean
  vipDays?: number
  description: string
  items?: string[]
  category: "pvp" | "builder" | "vip" | "attachments" | "beds" | "components" | "shield"
  duration?: string
}

const shopItems: ShopItem[] = [
  // PvP Kits
  {
    id: "pvpkit1",
    name: "PvP Kit 1",
    cost: 1060,
    vip: true,
    vipDays: 14,
    description: "A fast and aggressive loadout for close-range combat.",
    items: [
      "SMG Thompson ×1 (Belt)",
      "Hazmat Suit ×1 (Wear)",
      "Pistol Ammo ×128 (Main)",
      "Medical Syringe ×6 (Main)",
      "Holosight ×1 (Main)",
    ],
    category: "pvp",
  },
  {
    id: "pvpkit2",
    name: "PvP Kit 2",
    cost: 870,
    vip: false,
    description: "Balanced gear for mid-range skirmishes and survivability.",
    items: [
      "MP5 ×1 (Belt)",
      "Coffee Can Helmet ×1 (Wear)",
      "Road Sign Jacket ×1 (Wear)",
      "Road Sign Kilt ×1 (Wear)",
      "Pistol Ammo ×128 (Main)",
      "Medical Syringe ×6 (Main)",
      "Boots ×1 (Wear)",
      "Pants ×1 (Wear)",
      "Hoodie ×1 (Wear)",
      "Tactical Gloves ×1 (Wear)",
      "Holosight ×1 (Main)",
    ],
    category: "pvp",
  },
  {
    id: "pvpkit3",
    name: "PvP Kit 3",
    cost: 1090,
    vip: false,
    description: "High-power loadout with strong protection and firepower.",
    items: [
      "AK Rifle ×1 (Belt)",
      "Rifle Ammo ×128 (Main)",
      "Metal Facemask ×1 (Wear)",
      "Metal Chest Plate ×1 (Wear)",
      "Pants ×1 (Wear)",
      "Boots ×1 (Wear)",
      "Hoodie ×1 (Wear)",
      "Tactical Gloves ×1 (Wear)",
      "Holosight ×1 (Main)",
      "Medical Syringe ×6 (Main)",
    ],
    category: "pvp",
  },
  // Builder Kits
  {
    id: "builderkit1",
    name: "Builder Kit 1",
    cost: 765,
    vip: true,
    vipDays: 14,
    description: "Compact builder pack for quick base setups.",
    items: ["Wood ×7,500", "Stones ×5,000", "Metal Fragments ×3,000", "High Quality Metal ×100"],
    category: "builder",
  },
  {
    id: "builderkit2",
    name: "Builder Kit 2",
    cost: 435,
    vip: false,
    description: "Solid building materials for mid-sized bases.",
    items: ["Wood ×10,000", "Stones ×7,500", "Metal Fragments ×5,000", "High Quality Metal ×200"],
    category: "builder",
  },
  {
    id: "builderkit3",
    name: "Builder Kit 3",
    cost: 870,
    vip: false,
    description: "Large build package for base expansions or clans.",
    items: ["Wood ×20,000", "Stones ×15,000", "Metal Fragments ×10,000", "High Quality Metal ×400"],
    category: "builder",
  },
  // VIP Access
  {
    id: "vip14",
    name: "VIP 14 Days",
    cost: 500,
    description: "Grants VIP status, unlocks skip queue access.",
    duration: "14 days",
    category: "vip",
  },
  {
    id: "vip30",
    name: "VIP 30 Days",
    cost: 1000,
    description: "Grants VIP status, unlocks skip queue access.",
    duration: "30 days",
    category: "vip",
  },
  // Attachments
  {
    id: "holosight",
    name: "Holosight",
    cost: 60,
    description: "Weapon attachment for improved accuracy.",
    category: "attachments",
  },
  {
    id: "smallscope",
    name: "Small Scope",
    cost: 120,
    description: "Weapon attachment for medium-range targeting.",
    category: "attachments",
  },
  {
    id: "silencer",
    name: "Silencer",
    cost: 160,
    description: "Weapon attachment for stealth operations.",
    category: "attachments",
  },
  // Beds and Sleeping Bags
  {
    id: "bed",
    name: "Bed",
    cost: 80,
    description: "Comfortable sleeping arrangement for your base.",
    category: "beds",
  },
  {
    id: "sleepingbag",
    name: "Sleeping Bag",
    cost: 40,
    description: "Portable sleeping solution for field operations.",
    category: "beds",
  },
  // Components
  {
    id: "fuse",
    name: "Fuse",
    cost: 20,
    description: "Essential electrical component.",
    category: "components",
  },
  {
    id: "gears",
    name: "Gears (6x)",
    cost: 80,
    description: "Mechanical components for crafting.",
    category: "components",
  },
  {
    id: "lowgradefuel",
    name: "Low Grade Fuel (300x)",
    cost: 80,
    description: "Fuel for generators and vehicles.",
    category: "components",
  },
  {
    id: "metalpipe",
    name: "Metal Pipe",
    cost: 10,
    description: "Basic crafting material.",
    category: "components",
  },
  {
    id: "cloth",
    name: "Cloth (400x)",
    cost: 60,
    description: "Textile material for crafting.",
    category: "components",
  },
  {
    id: "leather",
    name: "Leather (50x)",
    cost: 20,
    description: "Animal hide for crafting.",
    category: "components",
  },
  {
    id: "metalblade",
    name: "Metal Blade (5x)",
    cost: 25,
    description: "Sharp metal components.",
    category: "components",
  },
  // Extra Offline Shield
  {
    id: "shield10hr",
    name: "10 Hour Offline Shield",
    cost: 1000,
    description: "Extended protection while offline.",
    duration: "10 hours",
    category: "shield",
  },
  {
    id: "shield3hr",
    name: "3 Hour Offline Shield",
    cost: 300,
    description: "Medium protection while offline.",
    duration: "3 hours",
    category: "shield",
  },
  {
    id: "shield1hr",
    name: "1 Hour Offline Shield",
    cost: 100,
    description: "Basic protection while offline.",
    duration: "1 hour",
    category: "shield",
  },
]

const categoryInfo = {
  pvp: {
    name: "PvP Kits",
    icon: Sword,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500/30",
  },
  builder: {
    name: "Builder Kits",
    icon: Hammer,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
  },
  vip: {
    name: "VIP Access",
    icon: Crown,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
  },
  attachments: {
    name: "Attachments",
    icon: Wrench,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30",
  },
  beds: {
    name: "Beds & Sleeping Bags",
    icon: Home,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
  },
  components: {
    name: "Components",
    icon: Package,
    color: "text-orange-400",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500/30",
  },
  shield: {
    name: "Offline Shield",
    icon: Shield,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    borderColor: "border-cyan-500/30",
  },
}

export default function StorePage() {
  const { user, signInWithDiscord } = useAuth()
  const { toast } = useToast()

  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [servers, setServers] = useState<Server[]>([])
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [selectedServer, setSelectedServer] = useState<string>("")
  const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingLink, setCheckingLink] = useState(false)
  const [currentMode, setCurrentMode] = useState<string>("normal")
  const [activeTab, setActiveTab] = useState("buy-credits")
  const [purchasing, setPurchasing] = useState(false)
  const [packageLoadError, setPackageLoadError] = useState<string | null>(null)
  const [serverLoadError, setServerLoadError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchPackages(), fetchServers(), fetchCurrentMode()])
      } catch (error) {
        // Silent fail
      }
      setLoading(false)
    }
    loadData()

    const interval = setInterval(() => {
      fetchPackages()
      fetchServers()
      fetchCurrentMode()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (user && selectedServer) {
      checkUserLink()
    } else {
      setLinkStatus(null)
    }
  }, [user, selectedServer])

  const fetchCurrentMode = async () => {
    try {
      const response = await fetch("/api/price-mode", { cache: "no-store", credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setCurrentMode(data.mode || "normal")
      }
    } catch (error) {
      // Silent fail
    }
  }

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages", { cache: "no-store", credentials: "include" });
      if (!response.ok) throw new Error("Packages unavailable");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid package response");
      setPackages(data);
      setPackageLoadError(data.length ? null : "No credit bundles are currently listed.");
      setSelectedPackage((current) => current ? data.find((pkg: CreditPackage) => pkg.id === current.id) ?? null : null);
    } catch {
      setPackages([]);
      setSelectedPackage(null);
      setPackageLoadError("Credit bundles could not be loaded. Please try again in a moment.");
    }
  }

  const fetchServers = async () => {
    try {
      const response = await fetch("/api/servers", { cache: "no-store", credentials: "include" });
      if (!response.ok) throw new Error("Servers unavailable");
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Invalid server response");
      setServers(data);
      setServerLoadError(data.length ? null : "No active servers are configured yet.");
      setSelectedServer((current) => data.some((server: Server) => server.id === current) ? current : "");
    } catch {
      setServers([]);
      setSelectedServer("");
      setServerLoadError("Server list could not be loaded. Please try again in a moment.");
    }
  }

  const checkUserLink = async () => {
    if (!user || !selectedServer) return
    setCheckingLink(true)
    try {
      const response = await fetch("/api/check-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ serverId: selectedServer }),
      })
      const data = await response.json()
      if (response.ok) {
        setLinkStatus(data)
      } else {
        setLinkStatus({ isLinked: false, username: null })
      }
    } catch (error) {
      setLinkStatus({ isLinked: false, username: null })
    } finally {
      setCheckingLink(false)
    }
  }

  const handlePurchase = async () => {
    if (!user) {
      void signInWithDiscord();
      return;
    }
    if (!selectedPackage || !selectedServer) {
      toast({ title: "Choose a bundle and server", description: "Select both before continuing to checkout.", variant: "destructive" });
      return;
    }
    if (!linkStatus?.isLinked) {
      toast({ title: "Link your game account", description: "Complete the server's account-link flow, then check your link again.", variant: "destructive" });
      return;
    }
    setPurchasing(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ packageId: selectedPackage.id, serverId: selectedServer }),
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        toast({ title: "Checkout could not start", description: data.error || "Please try again or contact the Warfare X team.", variant: "destructive" });
        return;
      }
      window.location.assign(data.url);
    } catch {
      toast({ title: "Connection error", description: "We couldn't reach checkout. Please try again.", variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  }

  const getPriceModeInfo = (mode: string) => {
    if (mode === "low_pop") return { text: "Community pricing · 50% below base", color: "text-primary", bgColor: "bg-primary", description: "Reduced rates are currently active on configured bundles." };
    if (mode === "high_season") return { text: "Peak-season pricing", color: "text-primary", bgColor: "bg-primary", description: "Peak-season rates are currently active on configured bundles." };
    return null;
  }

  const groupedShopItems = shopItems.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    },
    {} as Record<string, ShopItem[]>,
  )

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="sigma-bg-effect" />
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader size="lg" text="Loading the Warfare X store…" />
        </div>
        <Footer />
      </div>
    )
  }

  const currentModeInfo = getPriceModeInfo(currentMode)

  return (
    <div className="min-h-screen flex flex-col">
      <div className="sigma-bg-effect" />
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        {(packageLoadError || serverLoadError) && (
          <Alert className="mb-6 border-primary/25 bg-primary/[0.06] text-white">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <AlertDescription>{packageLoadError || serverLoadError}</AlertDescription>
          </Alert>
        )}
        <div className="text-center mb-8 md:mb-12 sigma-slide-in">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            Warfare X Store
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-6 md:mb-8 px-4">
            Choose a credit bundle, link your player name, and pay securely. Credits post after payment confirmation.
          </p>
          <div className="flex justify-center space-x-6 md:space-x-12 mb-8 md:mb-12 sigma-slide-in-delay">
            <div className="text-center group">
              <div className="sigma-feature instant mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 md:w-7 md:h-7 text-black" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-yellow-400 mb-1">CONFIRMED</h3>
              <p className="text-xs md:text-sm text-gray-400">After payment confirmation</p>
            </div>
            <div className="text-center group">
              <div className="sigma-feature secure mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 md:w-7 md:h-7 text-black" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-white mb-1">SECURE</h3>
              <p className="text-xs md:text-sm text-gray-400">Stripe checkout</p>
            </div>
            <div className="text-center group">
              <div className="sigma-feature premium mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6 md:w-7 md:h-7 text-yellow-400" />
              </div>
              <h3 className="text-sm md:text-lg font-bold text-yellow-400 mb-1">LINKED</h3>
              <p className="text-xs md:text-sm text-gray-400">Verified account</p>
            </div>
          </div>
          {currentModeInfo && (
            <div className="mb-6 md:mb-8">
              <div
                className={`inline-flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 rounded-full ${currentModeInfo.bgColor} bg-opacity-15 border border-current ${currentModeInfo.color} backdrop-blur-sm`}
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-bold text-sm md:text-lg">{currentModeInfo.text}</span>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mt-2">{currentModeInfo.description}</p>
            </div>
          )}
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8 bg-gray-900 border-gray-800 h-12 md:h-14">
            <TabsTrigger value="buy-credits" className="data-[state=active]:bg-gray-800 text-sm md:text-base font-bold">
              <CreditCard className="w-4 h-4 mr-2" />
              Buy credits
            </TabsTrigger>
            <TabsTrigger
              value="spend-credits"
              className="data-[state=active]:bg-gray-800 text-sm md:text-base font-bold"
            >
              <Package className="w-4 h-4 mr-2" />
              Discord catalog
            </TabsTrigger>
          </TabsList>
          <TabsContent value="buy-credits">
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
              <div className="lg:col-span-2 order-2 lg:order-1">
                <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-white">Choose a credit bundle</h2>
                <div className="sigma-grid">
                  {packages.length === 0 ? (
                    <Card className="sigma-card p-6 sm:col-span-2 lg:col-span-3"><CardHeader><CardTitle className="text-white">No bundles available</CardTitle><CardDescription className="text-muted-foreground">Bundles appear here when the Warfare X store is configured.</CardDescription></CardHeader></Card>
                  ) : packages.map((pkg, index) => (
                    <Card
                      key={pkg.id}
                      className={`cursor-pointer transition-all duration-300 relative overflow-hidden ${selectedPackage?.id === pkg.id ? "sigma-card selected" : "sigma-card"}`}
                      onClick={() => setSelectedPackage(pkg)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="absolute top-3 right-3 flex flex-col gap-1">
                        {pkg.popular && (
                          <Badge className="sigma-badge popular text-xs">
                            <Star className="w-2 h-2 mr-1" />
                            POPULAR
                          </Badge>
                        )}
                        {pkg.bestValue && (
                          <Badge className="sigma-badge best-value text-xs">
                            <Crown className="w-2 h-2 mr-1" />
                            BEST VALUE
                          </Badge>
                        )}
                        {pkg.discount && (
                          <Badge className="sigma-badge discount text-xs">
                            <Percent className="w-2 h-2 mr-1" />
                            {pkg.discount}% OFF
                          </Badge>
                        )}
                      </div>
                      <CardHeader className="pb-3 md:pb-4">
                        <CardTitle className="text-lg md:text-xl font-bold text-white mb-2 pr-16 md:pr-20">
                          {pkg.name}
                        </CardTitle>
                        <CardDescription className="text-gray-400 text-sm">{pkg.description}</CardDescription>
                        <div className="inline-flex items-center gap-2 mt-2">
                          <Badge
                            variant="secondary"
                            className="bg-gray-800 text-primary border border-primary/20 text-xs"
                          >
                            {pkg.credits.toLocaleString()} CREDITS
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between mb-3 md:mb-4">
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className="sigma-price text-xl md:text-2xl">${pkg.price.toFixed(2)}</span>
                            {pkg.originalPrice && (
                              <span className="text-base md:text-lg text-gray-500 line-through">
                                ${pkg.originalPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="text-xs md:text-sm text-gray-400">
                            ${((pkg.price / pkg.credits) * 1000).toFixed(2)} per 1K
                          </div>
                        </div>
                        {pkg.discount && (
                          <div className="text-sm text-yellow-400 font-semibold mb-3">
                            💰 SAVE ${(pkg.originalPrice! - pkg.price).toFixed(2)}!
                          </div>
                        )}
                        <div className="sigma-progress">
                          <div
                            className="sigma-progress-fill"
                            style={{ width: `${Math.min(100, (pkg.credits / 15000) * 100)}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-1 order-1 lg:order-2">
                <Card className="sigma-card lg:sticky lg:top-24 mb-6 lg:mb-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-white">
                      <ShoppingCart className="w-5 h-5" />
                      Order details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 md:space-y-6">
                    {selectedPackage ? (
                      <>
                        <div>
                          <h3 className="font-bold text-base md:text-lg text-white mb-3">{selectedPackage.name}</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-gray-300">
                              <span>Credits:</span>
                              <span className="text-primary font-semibold">
                                {selectedPackage.credits.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Price:</span>
                              <div className="flex items-center gap-2">
                                <span className="text-primary font-bold">${selectedPackage.price.toFixed(2)}</span>
                                {selectedPackage.originalPrice && (
                                  <span className="line-through text-gray-500 text-xs">
                                    ${selectedPackage.originalPrice.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                            {selectedPackage.discount && (
                              <div className="flex justify-between text-yellow-400">
                                <span>Discount:</span>
                                <span className="font-semibold">-{selectedPackage.discount}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Separator className="bg-gray-700" />
                        <div>
                          <label className="block text-sm font-semibold mb-3 text-white">Select a server</label>
                          <Select value={selectedServer} onValueChange={setSelectedServer}>
                            <SelectTrigger className="bg-gray-800 border-gray-700 h-12 w-full text-left hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-primary focus:border-primary">
                              <div className="flex-1 text-left">
                                <SelectValue placeholder={servers.length ? "Select a server" : "No active servers configured"} />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700 z-50 max-h-60 overflow-y-auto">
                              {servers.map((server) => (
                                <SelectItem
                                  key={server.id}
                                  value={server.id}
                                  className="text-gray-300 cursor-pointer hover:bg-gray-800 focus:bg-gray-800 focus:text-white py-3 px-4"
                                >
                                  <div className="flex flex-col w-full">
                                    <span className="font-medium text-white">{server.name}</span>
                                    <span className="text-xs text-gray-400">{server.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {user && selectedServer && (
                            <div className="mt-4">
                              {checkingLink ? (
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                  <Loader size="sm" />
                                  <span>Checking linked account…</span>
                                </div>
                              ) : linkStatus ? (
                                linkStatus.isLinked ? (
                                  <div className="sigma-status success">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Linked player: {linkStatus.username}</span>
                                  </div>
                                ) : (
                                  <div className="sigma-status warning">
                                    <AlertTriangle className="w-4 h-4" />
                                    <div className="flex flex-col">
                                      <span>Account link required</span>
                                      <span className="text-xs mt-1 opacity-75">Use this server's account-link instructions, then check again.</span>
                                      <Button type="button" size="sm" variant="outline" className="mt-2 w-fit" onClick={checkUserLink}>Check link</Button>
                                    </div>
                                  </div>
                                )
                              ) : null}
                            </div>
                          )}
                        </div>
                        <Separator className="bg-gray-700" />
                        <div className="space-y-3">
                          <div className="flex justify-between text-gray-300">
                            <span>Subtotal:</span>
                            <span>${selectedPackage.price.toFixed(2)}</span>
                          </div>
                          {selectedPackage.discount && (
                            <div className="flex justify-between text-yellow-400">
                              <span>You save:</span>
                              <span className="font-semibold">
                                ${(selectedPackage.originalPrice! - selectedPackage.price).toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-3">
                            <span className="text-white">Total:</span>
                            <span className="sigma-price">${selectedPackage.price.toFixed(2)}</span>
                          </div>
                        </div>
                        <Button
                          onClick={handlePurchase}
                          className="w-full sigma-button py-3 text-sm md:text-base"
                          disabled={!selectedServer || !user || (linkStatus && !linkStatus.isLinked) || purchasing}
                        >
                          {purchasing ? (
                            <>
                              <Loader size="sm" />
                              Opening checkout…
                            </>
                          ) : !user ? (
                            "Sign in to continue"
                          ) : !selectedServer ? (
                            "Select a server"
                          ) : linkStatus && !linkStatus.isLinked ? (
                            "Link your account first"
                          ) : (
                            "Continue to secure checkout"
                          )}
                        </Button>
                        <div className="grid grid-cols-3 gap-2 md:gap-4 pt-4 border-t border-gray-700">
                          <div className="text-center">
                            <div className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
                              <Shield className="w-3 h-3 md:w-4 md:h-4 text-white" />
                            </div>
                            <span className="text-xs text-white font-semibold">SECURE</span>
                          </div>
                          <div className="text-center">
                            <div className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 rounded-lg bg-yellow-500 bg-opacity-20 flex items-center justify-center">
                              <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                            </div>
                            <span className="text-xs text-yellow-400 font-semibold">AFTER PAYMENT</span>
                          </div>
                          <div className="text-center">
                            <div className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 rounded-lg bg-yellow-500 bg-opacity-20 flex items-center justify-center">
                              <Award className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                            </div>
                            <span className="text-xs text-yellow-400 font-semibold">ACCOUNT LINK</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400 py-8 md:py-12">
                        <ShoppingCart className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-30" />
                        <h3 className="text-base md:text-lg font-semibold mb-2">Select a bundle</h3>
                        <p className="text-sm">Choose a credit bundle and server to review your order.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="spend-credits">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-white">Community redemption catalog</h2>
                <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto px-4 mb-6">
                  Browse the catalog listed for the community. Redemptions are handled through the server's Discord shop integration.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <Gamepad2 className="w-4 h-4 text-yellow-400" />
                    <code className="text-yellow-400 font-mono text-sm">/shop</code>
                    <span className="text-gray-300 text-sm">- Browse items when the shop is enabled</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                    <CreditCard className="w-4 h-4 text-yellow-400" />
                    <code className="text-yellow-400 font-mono text-sm">/economy</code>
                    <span className="text-gray-300 text-sm">- Check balance when the economy bot is enabled</span>
                  </div>
                </div>
              </div>

              {/* Shop Categories */}
              <div className="space-y-8">
                {Object.entries(groupedShopItems).map(([category, items]) => {
                  const categoryData = categoryInfo[category as keyof typeof categoryInfo]
                  const IconComponent = categoryData.icon

                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${categoryData.bgColor} ${categoryData.borderColor} border`}>
                          <IconComponent className={`w-5 h-5 ${categoryData.color}`} />
                        </div>
                        <h3 className="text-xl font-bold text-white">{categoryData.name}</h3>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                          <Card key={item.id} className={`sigma-card ${categoryData.borderColor} border`}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <CardTitle className="text-lg font-bold text-white">{item.name}</CardTitle>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge className="bg-gray-800 text-primary border border-primary/20 text-xs">
                                    {item.cost.toLocaleString()} CREDITS
                                  </Badge>
                                  {item.vip && (
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                      <Crown className="w-2 h-2 mr-1" />
                                      VIP {item.vipDays}D
                                    </Badge>
                                  )}
                                  {item.duration && (
                                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                      <Timer className="w-2 h-2 mr-1" />
                                      {item.duration}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <CardDescription className="text-gray-400 text-sm">{item.description}</CardDescription>
                            </CardHeader>

                            {item.items && (
                              <CardContent className="pt-0">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Includes:</h4>
                                  <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {item.items.map((itemDetail, index) => (
                                      <div key={index} className="text-xs text-gray-400 flex items-center gap-1">
                                        <div className="w-1 h-1 bg-primary rounded-full flex-shrink-0" />
                                        {itemDetail}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Discord CTA */}
              <Card className="sigma-card mt-12">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-3 text-lg md:text-xl text-white">
                    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 text-[#5865F2]" />
                    Redeem through Discord
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    The website catalog is a reference; the server's Discord shop is the source of truth for availability.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-400 mb-6">
                    Join the community Discord and use{" "}
                    <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400">/shop</code> to browse and purchase
                    any of these items with your credits!
                  </p>
                  <Button asChild className="sigma-button">
                    <a
                      href="https://discord.gg/playcnqr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Open community Discord
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Activity, Percent, MessageCircle, Settings, TrendingDown, BarChart3, TrendingUp } from "lucide-react"
import { StatsCards } from "@/components/admin/stats-cards"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { PackagesClient } from "./packages-client"
import { TransactionsClient } from "./transactions-client"

const ADMIN_DISCORD_IDS = process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS?.split(",") || [
  "907231041167716352",
  "1068270434702860358",
]

const priceModes = {
  low_pop: {
    name: "Low Pop Mode",
    description: "50% discount on all packages",
    icon: TrendingDown,
    color: "text-green-400",
    bgColor: "bg-green-500",
    borderColor: "border-green-500",
  },
  normal: {
    name: "Normal Mode",
    description: "Standard pricing",
    icon: BarChart3,
    color: "text-blue-400",
    bgColor: "bg-blue-500",
    borderColor: "border-blue-500",
  },
  high_season: {
    name: "High Season Mode",
    description: "15% increase on all packages",
    icon: TrendingUp,
    color: "text-orange-400",
    bgColor: "bg-orange-500",
    borderColor: "border-orange-500",
  },
}

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const discordId = session?.user?.user_metadata?.provider_id || session?.user?.user_metadata?.sub
  const isAdmin = discordId ? ADMIN_DISCORD_IDS.includes(discordId) : false

  if (!isAdmin) {
    redirect("/")
  }

  // Fetch initial data for the page
  const { data: packagesData } = await supabase.from("credit_packages").select("*").order("sort_order")
  const { data: transactionsData, count: transactionCount } = await supabase
    .from("transaction_summary")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, 9)

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
          <p className="text-gray-400 text-sm sm:text-base">Manage credit packages and monitor sales performance</p>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
          <div className="lg:col-span-3">
            <RevenueChart />
          </div>
          <div className="lg:col-span-2">{/* Pricing component can go here */}</div>
        </div>

        <Tabs defaultValue="packages" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 sm:mb-8 bg-gray-900 border-gray-800">
            <TabsTrigger value="packages" className="text-xs sm:text-sm data-[state=active]:bg-gray-800">
              <Package className="w-4 h-4 mr-2" />
              Packages
            </TabsTrigger>
            <TabsTrigger value="transactions" className="text-xs sm:text-sm data-[state=active]:bg-gray-800">
              <Activity className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-xs sm:text-sm data-[state=active]:bg-gray-800">
              <Percent className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
            <TabsTrigger value="webhook" className="text-xs sm:text-sm data-[state=active]:bg-gray-800">
              <MessageCircle className="w-4 h-4 mr-2" />
              Webhook
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages">
            <PackagesClient initialPackages={packagesData || []} />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsClient
              initialTransactions={transactionsData || []}
              initialTransactionCount={transactionCount || 0}
            />
          </TabsContent>

          <TabsContent value="pricing">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
                  <Percent className="w-5 h-5" />
                  Price Control Center
                </CardTitle>
                <CardDescription className="text-sm text-gray-400">
                  Adjust pricing modes to optimize revenue based on server population and demand
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Pricing client component will go here */}
                <p className="text-gray-400">Pricing management UI coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
                  <MessageCircle className="w-5 h-5" />
                  Discord Webhook Testing
                </CardTitle>
                <CardDescription className="text-sm text-gray-400">
                  Test the Discord webhook integration to ensure purchase notifications are working
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Webhook client component will go here */}
                <p className="text-gray-400">Webhook testing UI coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

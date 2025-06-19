import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Activity, Percent, MessageCircle, Settings } from "lucide-react"
import { StatsCards } from "@/components/admin/stats-cards"
import { RevenueChart } from "@/components/admin/revenue-chart"
import { PackagesClient } from "./packages-client"
import { TransactionsClient } from "./transactions-client"
import { createClient } from "@supabase/supabase-js"

const ADMIN_DISCORD_IDS = process.env.NEXT_PUBLIC_ADMIN_DISCORD_IDS?.split(",") || [
  "907231041167716352",
  "1068270434702860358",
]

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const supabase = createServerComponentClient({ cookies })
  const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const discordId = session?.user?.user_metadata?.provider_id || session?.user?.user_metadata?.sub
  const isAdmin = discordId ? ADMIN_DISCORD_IDS.includes(discordId) : false

  if (!isAdmin) {
    redirect("/")
  }

  // Fetch initial data for the page using admin client
  const { data: packagesData } = await adminSupabase.from("credit_packages").select("*").order("sort_order")

  // Fetch real transactions from store_transactions table
  const { data: transactionsData, count: transactionCount } = await adminSupabase
    .from("store_transactions")
    .select(`
      *,
      credit_packages(name)
    `)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .range(0, 9)

  // Transform transaction data to match the expected format
  const transformedTransactions =
    transactionsData?.map((transaction) => ({
      transaction_number: `TXN-${transaction.id.slice(-8)}`,
      username: transaction.discord_id,
      package_name: transaction.credit_packages?.name || "Unknown Package",
      final_amount: transaction.final_amount,
      status: transaction.status,
      created_at: transaction.created_at,
    })) || []

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
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800 h-full">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-white mb-2">System Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stripe Integration:</span>
                      <span className={process.env.STRIPE_SECRET_KEY ? "text-green-400" : "text-yellow-400"}>
                        {process.env.STRIPE_SECRET_KEY ? "Active" : "Demo Mode"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Discord Webhook:</span>
                      <span className={process.env.DISCORD_WEBHOOK_URL ? "text-green-400" : "text-red-400"}>
                        {process.env.DISCORD_WEBHOOK_URL ? "Configured" : "Not Set"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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
              initialTransactions={transformedTransactions}
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

import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Boxes, CreditCard, Percent, Settings2 } from "lucide-react";
import { StatsCards } from "@/components/admin/stats-cards";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { PackagesClient } from "./packages-client";
import { TransactionsClient } from "./transactions-client";
import { PricingPanel } from "@/components/admin/pricing-panel";
import { createStoreAdminClient, getStoreAdmin, type PriceMode } from "@/lib/store-server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await getStoreAdmin();
  if (!admin) redirect("/");

  const db = createStoreAdminClient();
  const [packagesResult, transactionsResult, pricingResult] = await Promise.all([
    db.from("credit_packages").select("*").order("sort_order", { ascending: true }),
    db.from("transactions").select("id, transaction_number, user_id, final_amount, status, created_at, credit_packages(name), users(username, discord_id)", { count: "exact" }).order("created_at", { ascending: false }).range(0, 9),
    db.from("system_settings").select("value").eq("key", "current_price_mode").maybeSingle(),
  ]);
  if (packagesResult.error || transactionsResult.error) throw new Error("Unable to load store administration data");

  const transactions = (transactionsResult.data ?? []).map((transaction) => ({
    transaction_number: transaction.transaction_number || ("TXN-" + transaction.id.slice(-8)),
    username: transaction.users?.[0]?.username || transaction.users?.[0]?.discord_id || "Linked player",
    package_name: transaction.credit_packages?.[0]?.name || "Credit bundle",
    final_amount: transaction.final_amount,
    status: transaction.status,
    created_at: transaction.created_at,
  }));
  const rawMode = pricingResult.data?.value;
  const initialMode: PriceMode = rawMode === "low_pop" || rawMode === "high_season" ? rawMode : "normal";
  const stripeReady = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  const discordNoticeReady = Boolean(process.env.DISCORD_WEBHOOK_URL);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:py-12">
        <div className="mb-8 flex items-start gap-4">
          <div className="rounded-2xl border border-primary/25 bg-primary/10 p-3 text-primary"><Settings2 className="h-6 w-6" /></div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Warfare X · Operations</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Store dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">Manage live credit bundles, review orders, and adjust store pricing.</p>
          </div>
        </div>

        <StatsCards />
        <div className="my-7 grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <RevenueChart />
          <Card className="sigma-card h-full">
            <CardHeader>
              <CardTitle className="text-white">Store connections</CardTitle>
              <CardDescription className="text-muted-foreground">Configuration status only. Secret values are never shown here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3"><CreditCard className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium text-white">Stripe payments</p><p className="text-xs text-muted-foreground">Checkout + signed webhook</p></div></div>
                <span className={stripeReady ? "text-xs font-semibold text-emerald-400" : "text-xs font-semibold text-amber-400"}>{stripeReady ? "Configured" : "Needs setup"}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3"><Activity className="h-4 w-4 text-primary" /><div><p className="text-sm font-medium text-white">Discord purchase notice</p><p className="text-xs text-muted-foreground">Optional webhook notification</p></div></div>
                <span className={discordNoticeReady ? "text-xs font-semibold text-emerald-400" : "text-xs font-semibold text-muted-foreground"}>{discordNoticeReady ? "Configured" : "Optional"}</span>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">Credits are written to the linked server balance after Stripe confirms payment. The game-server integration must be configured separately.</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="packages" className="w-full">
          <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 border border-white/10 bg-white/[0.03] p-1 md:grid-cols-4">
            <TabsTrigger value="packages" className="gap-2"><Boxes className="h-4 w-4" />Bundles</TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2"><Activity className="h-4 w-4" />Orders</TabsTrigger>
            <TabsTrigger value="pricing" className="gap-2"><Percent className="h-4 w-4" />Pricing</TabsTrigger>
            <TabsTrigger value="operations" className="gap-2"><CreditCard className="h-4 w-4" />Setup</TabsTrigger>
          </TabsList>
          <TabsContent value="packages"><PackagesClient initialPackages={packagesResult.data ?? []} /></TabsContent>
          <TabsContent value="transactions"><TransactionsClient initialTransactions={transactions} initialTransactionCount={transactionsResult.count ?? 0} /></TabsContent>
          <TabsContent value="pricing"><PricingPanel initialMode={initialMode} /></TabsContent>
          <TabsContent value="operations">
            <Card className="sigma-card">
              <CardHeader><CardTitle className="text-white">Payment setup</CardTitle><CardDescription className="text-muted-foreground">Configure these values in Railway Variables. Do not paste secrets into chat or source code.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="text-sm font-semibold text-white">Stripe webhook endpoint</p><code className="mt-2 block break-all text-xs text-primary">/api/stripe/webhook</code><p className="mt-2 text-xs text-muted-foreground">Subscribe to checkout.session.completed.</p></div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="text-sm font-semibold text-white">Required Railway variables</p><p className="mt-2 text-xs leading-5 text-muted-foreground">STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, Supabase URL/keys, APP_URL, and ADMIN_DISCORD_IDS.</p></div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

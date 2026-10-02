"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Crown, PackageOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type StorePackage = {
  id: string;
  name: string;
  description: string | null;
  credits: number;
  price: number;
  popular?: boolean;
  bestValue?: boolean;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function PackageShowcase() {
  const [packages, setPackages] = useState<StorePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/packages", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("packages unavailable");
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("invalid package response");
        if (active) setPackages(data);
      })
      .catch(() => { if (active) setUnavailable(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section id="packages" className="px-4 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div id="how-it-works" className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">The store</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Credit bundles</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">Current bundles and pricing come from the store configuration. Sign in and link your server account before checkout.</p>
          </div>
          <Button asChild variant="outline" className="w-fit border-white/15 bg-white/[0.03] text-white hover:bg-white/[0.08]">
            <Link href="/store">Open store <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-label="Loading credit bundles">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />)}
          </div>
        ) : packages.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {packages.slice(0, 4).map((bundle) => (
              <Card key={bundle.id} className="sigma-card flex h-full flex-col">
                <CardHeader>
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-xl border border-primary/20 bg-primary/10 p-3 text-primary"><PackageOpen className="h-5 w-5" /></div>
                    {bundle.popular ? <Badge className="border border-primary/25 bg-primary/10 text-primary"><Star className="mr-1 h-3 w-3" /> Popular</Badge> : bundle.bestValue ? <Badge className="border border-white/15 bg-white/[0.05] text-white"><Crown className="mr-1 h-3 w-3" /> Best value</Badge> : null}
                  </div>
                  <CardTitle className="text-xl text-white">{bundle.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{bundle.description || "A credit bundle for your linked server account."}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <p className="text-3xl font-bold tracking-tight text-white">{money.format(Number(bundle.price))}</p>
                  <p className="mt-2 text-sm text-primary">{Number(bundle.credits).toLocaleString()} credits</p>
                  <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground"><BadgeCheck className="h-4 w-4 text-primary" /> Fulfilled after payment confirmation</div>
                </CardContent>
                <CardFooter><Button asChild className="w-full"><Link href="/store">Choose bundle <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-lg font-semibold text-white">{unavailable ? "Bundles are temporarily unavailable" : "No bundles are configured yet"}</p>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">The store only shows packages configured by the Warfare X team. Check back later or ask in Discord.</p>
          </div>
        )}
      </div>
    </section>
  );
}

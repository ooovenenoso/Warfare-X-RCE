"use client";

import { useState } from "react";
import { Check, Loader2, Percent } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type PriceMode = "normal" | "low_pop" | "high_season";
const options: { mode: PriceMode; title: string; detail: string }[] = [
  { mode: "normal", title: "Standard", detail: "Base bundle prices" },
  { mode: "low_pop", title: "Low-pop", detail: "50% below base price" },
  { mode: "high_season", title: "High season", detail: "15% above base price" },
];

export function PricingPanel({ initialMode }: { initialMode: PriceMode }) {
  const [mode, setMode] = useState(initialMode);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  async function save(nextMode: PriceMode) {
    if (nextMode === mode) return;
    setSaving(true);
    try {
      const response = await fetch("/api/price-mode", {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: nextMode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update pricing mode");
      setMode(nextMode);
      toast({ title: "Pricing updated", description: "The selected mode is now active for store bundles." });
    } catch (error) {
      toast({ title: "Pricing was not updated", description: error instanceof Error ? error.message : "Try again later.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="sigma-card">
      <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Percent className="h-5 w-5 text-primary" />Pricing mode</CardTitle><CardDescription className="text-muted-foreground">Displayed prices and checkout use the same selected mode.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {options.map((option) => <button key={option.mode} type="button" disabled={saving} onClick={() => save(option.mode)} className={mode === option.mode ? "rounded-xl border border-primary/50 bg-primary/10 p-4 text-left transition" : "rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20"}>
          <span className="flex items-center justify-between gap-3"><span className="font-semibold text-white">{option.title}</span>{mode === option.mode ? <Check className="h-4 w-4 text-primary" /> : null}</span>
          <span className="mt-2 block text-sm text-muted-foreground">{option.detail}</span>
        </button>)}
        {saving ? <div className="col-span-full flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" />Saving pricing mode…</div> : null}
      </CardContent>
    </Card>
  );
}

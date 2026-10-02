import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Link2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden px-4 py-20 sm:py-28 lg:py-32">
      <div className="hero-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div className="hero-glow hero-glow-left absolute -z-10" aria-hidden="true" />
      <div className="hero-glow hero-glow-right absolute -z-10" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-3xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Rust Console Edition · Community store
          </div>
          <h1 className="text-5xl font-black leading-[0.95] tracking-tight text-white sm:text-7xl">
            Gear up for
            <span className="mt-2 block text-primary">your next run.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            Choose a credit bundle, link your in-game account, and check out securely. Credits are posted after payment is confirmed.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-12 px-6 font-semibold">
              <Link href="/store">
                Browse credit bundles
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-white/15 bg-white/[0.03] px-6 text-white hover:bg-white/[0.08]">
              <Link href="#how-it-works">How it works</Link>
            </Button>
          </div>
          <div className="mt-12 grid max-w-2xl gap-4 sm:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="text-sm font-semibold text-white">Link your account</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Choose the server tied to your verified player name.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="text-sm font-semibold text-white">Secure checkout</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Payments are handled by Stripe.</p></div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="text-sm font-semibold text-white">Clear order status</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Your balance updates after payment confirmation.</p></div>
            </div>
          </div>
        </div>
        <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
          <div className="absolute inset-8 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative flex aspect-square w-full items-center justify-center rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.015] shadow-2xl shadow-black/40">
            <div className="absolute inset-4 rounded-[1.5rem] border border-primary/15" />
            <Image src="/warfare-logo.png" alt="Warfare X" width={300} height={300} priority className="relative h-48 w-48 object-contain drop-shadow-[0_15px_45px_rgba(198,90,46,0.22)] sm:h-64 sm:w-64" />
            <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/10 bg-background/80 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Built for</p>
              <p className="mt-1 font-semibold text-white">Warfare X · Rust Console Edition</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

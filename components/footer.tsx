"use client";

import Link from "next/link";
import { MessageCircle, ExternalLink } from "lucide-react";
import { useState } from "react";
import { PrivacyPolicy } from "@/components/legal/privacy-policy";
import { TermsOfService } from "@/components/legal/terms-of-service";

export function Footer() {
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  return (
    <>
      <footer className="mt-20 border-t border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.3fr_0.7fr_1fr]">
          <div>
            <Link href="/" className="text-lg font-black tracking-[0.16em] text-white">WARFARE <span className="text-primary">X</span></Link>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Community store for Rust Console Edition. Link the correct player account and server before checkout; credits are fulfilled after payment confirmation.</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Explore</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="transition hover:text-primary">Home</Link></li>
              <li><Link href="/store" className="transition hover:text-primary">Credit store</Link></li>
              <li><Link href="/transactions" className="transition hover:text-primary">Order history</Link></li>
              <li><a href="https://discord.gg/playcnqr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition hover:text-primary">Community Discord <ExternalLink size={13} /></a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-white">Before checkout</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>Sign in with Discord</li>
              <li>Verify your in-game account link</li>
              <li>Choose the matching server</li>
              <li>Payment is processed by Stripe</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Warfare X community store.</p>
            <div className="flex gap-5">
              <button onClick={() => setShowPrivacyPolicy(true)} className="transition hover:text-primary">Privacy</button>
              <button onClick={() => setShowTermsOfService(true)} className="transition hover:text-primary">Terms</button>
            </div>
          </div>
        </div>
      </footer>
      <PrivacyPolicy open={showPrivacyPolicy} onOpenChange={setShowPrivacyPolicy} />
      <TermsOfService open={showTermsOfService} onOpenChange={setShowTermsOfService} />
    </>
  );
}

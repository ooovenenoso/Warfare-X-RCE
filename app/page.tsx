"use client";

import { useEffect } from "react";
import { HeroSection } from "@/components/hero-section";
import { PackageShowcase } from "@/components/package-showcase";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function HomePage() {
  useEffect(() => {
    fetch("/api/track-visitor", { method: "POST" }).catch(() => undefined);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="sigma-bg-effect" aria-hidden="true" />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PackageShowcase />
      </main>
      <Footer />
    </div>
  );
}

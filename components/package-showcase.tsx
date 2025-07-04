"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Star, Zap, Crown, Gem } from "lucide-react"

const mockPackages = [
  {
    id: "1",
    name: "Starter Pack",
    price: 9.99,
    credits: 1000,
    description: "Perfect for new players",
    popular: false,
    icon: Zap,
    features: ["1,000 Credits", "Basic Support", "Instant Delivery"],
  },
  {
    id: "2",
    name: "Pro Pack",
    price: 19.99,
    credits: 2500,
    description: "Most popular choice",
    popular: true,
    icon: Star,
    features: ["2,500 Credits", "Priority Support", "Instant Delivery"],
  },
  {
    id: "3",
    name: "Elite Pack",
    price: 39.99,
    credits: 6000,
    description: "For serious gamers",
    popular: false,
    icon: Crown,
    features: ["6,000 Credits", "VIP Support", "Early Access"],
  },
  {
    id: "4",
    name: "Ultimate Pack",
    price: 79.99,
    credits: 15000,
    description: "Maximum value",
    popular: false,
    icon: Gem,
    features: ["15,000 Credits", "Premium Support", "All Perks"],
  },
]

export function PackageShowcase() {
  return (
    <section className="py-16 px-4 relative">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text">Credit Packages</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the perfect package to enhance your gaming experience. All purchases are instant and secure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockPackages.map((pkg) => {
            const IconComponent = pkg.icon
            return (
              <Card
                key={pkg.id}
                className={`bg-black bg-opacity-50 border-gray-800 card-highlight glow-hover relative ${
                  pkg.popular ? "border-primary shadow-lg shadow-primary/20" : ""
                }`}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-black font-bold">
                    MOST POPULAR
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10 border border-primary/20">
                      <IconComponent className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold text-primary">{pkg.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">${pkg.price}</div>
                  <p className="text-gray-400 text-sm">{pkg.description}</p>
                </CardHeader>

                <CardContent className="text-center pb-4">
                  <div className="text-2xl font-bold text-primary mb-4">{pkg.credits.toLocaleString()} Credits</div>

                  <ul className="space-y-2 text-sm text-gray-300">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center justify-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={pkg.popular ? "default" : "outline"}
                    className={`w-full ${pkg.popular ? "glow-hover" : "border-primary text-primary hover:bg-primary hover:text-black"}`}
                    asChild
                  >
                    <Link href="/store">Purchase Now</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Need a custom package?</p>
          <Button
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-black bg-transparent"
          >
            Contact Support
          </Button>
        </div>
      </div>
    </section>
  )
}

import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Variable global para el modo de precios
let currentPriceMode: "low_pop" | "normal" | "high_season" = "normal"

export function updatePriceMode(mode: "low_pop" | "normal" | "high_season") {
  currentPriceMode = mode
}

function calculatePrice(basePrice: number, mode: string) {
  switch (mode) {
    case "low_pop":
      return basePrice * 0.5 // 50% discount
    case "high_season":
      return basePrice * 1.15 // 15% increase
    default:
      return basePrice
  }
}

export async function GET() {
  try {
    const { data: packages, error } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching packages:", error)
      // Return fallback data
      const fallbackPackages = [
        {
          id: "1",
          name: "Starter Pack",
          description: "Perfect for new players getting started",
          credits: 1000,
          basePrice: 9.99,
          price: calculatePrice(9.99, currentPriceMode),
          originalPrice: currentPriceMode !== "normal" ? 9.99 : undefined,
          image_url: "/placeholder.svg?height=200&width=300",
          active: true,
          popular: false,
          bestValue: false,
          discount: currentPriceMode === "low_pop" ? 50 : 0,
          priceIncrease: currentPriceMode === "high_season" ? 15 : 0,
          priceMode: currentPriceMode,
        },
        {
          id: "2",
          name: "Pro Pack",
          description: "Most popular choice among players",
          credits: 2500,
          basePrice: 19.99,
          price: calculatePrice(19.99, currentPriceMode),
          originalPrice: currentPriceMode !== "normal" ? 19.99 : undefined,
          image_url: "/placeholder.svg?height=200&width=300",
          active: true,
          popular: true,
          bestValue: false,
          discount: currentPriceMode === "low_pop" ? 50 : 0,
          priceIncrease: currentPriceMode === "high_season" ? 15 : 0,
          priceMode: currentPriceMode,
        },
        {
          id: "3",
          name: "Elite Pack",
          description: "For serious gamers who want more",
          credits: 6000,
          basePrice: 39.99,
          price: calculatePrice(39.99, currentPriceMode),
          originalPrice: currentPriceMode !== "normal" ? 39.99 : undefined,
          image_url: "/placeholder.svg?height=200&width=300",
          active: true,
          popular: false,
          bestValue: false,
          discount: currentPriceMode === "low_pop" ? 50 : 0,
          priceIncrease: currentPriceMode === "high_season" ? 15 : 0,
          priceMode: currentPriceMode,
        },
        {
          id: "4",
          name: "Ultimate Pack",
          description: "Maximum value for hardcore players",
          credits: 15000,
          basePrice: 79.99,
          price: calculatePrice(79.99, currentPriceMode),
          originalPrice: currentPriceMode !== "normal" ? 79.99 : undefined,
          image_url: "/placeholder.svg?height=200&width=300",
          active: true,
          popular: false,
          bestValue: true,
          discount: currentPriceMode === "low_pop" ? 50 : 0,
          priceIncrease: currentPriceMode === "high_season" ? 15 : 0,
          priceMode: currentPriceMode,
        },
      ]
      return NextResponse.json(fallbackPackages)
    }

    // Transform packages with current pricing
    const transformedPackages = packages.map((pkg) => ({
      ...pkg,
      basePrice: pkg.base_price || pkg.current_price,
      price: calculatePrice(pkg.base_price || pkg.current_price, currentPriceMode),
      originalPrice: currentPriceMode !== "normal" ? pkg.base_price || pkg.current_price : undefined,
      popular: pkg.is_popular,
      bestValue: pkg.is_best_value,
      active: pkg.is_active,
      discount: currentPriceMode === "low_pop" ? 50 : 0,
      priceIncrease: currentPriceMode === "high_season" ? 15 : 0,
      priceMode: currentPriceMode,
    }))

    return NextResponse.json(transformedPackages)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from("credit_packages")
      .insert({
        name: body.name,
        description: body.description,
        credits: body.credits,
        base_price: body.price,
        current_price: body.price,
        image_url: body.image_url,
        is_active: body.active ?? true,
        is_popular: body.popular ?? false,
        is_best_value: body.bestValue ?? false,
        sort_order: body.sortOrder ?? 0,
      })
      .select()

    if (error) {
      console.error("Error creating package:", error)
      return NextResponse.json({ error: "Failed to create package" }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

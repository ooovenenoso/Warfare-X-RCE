import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { headers } from "next/headers"

function getUserIdentifier(request: Request) {
  const headersList = headers()
  const forwarded = headersList.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : headersList.get("x-real-ip") || "unknown"

  return `ip_${ip}`
}

export async function POST(request: Request) {
  try {
    const { x, y, choice, color } = await request.json()
    const userIdentifier = getUserIdentifier(request)
    const supabase = createAdminClient()

    // Check cooldown
    const { data: cooldownData } = await supabase
      .from("pixel_cooldowns")
      .select("last_placed_at")
      .eq("user_identifier", userIdentifier)
      .single()

    if (cooldownData) {
      const lastPlaced = new Date(cooldownData.last_placed_at)
      const now = new Date()
      const timeDiff = Math.floor((now.getTime() - lastPlaced.getTime()) / 1000)

      if (timeDiff < 30) {
        return NextResponse.json(
          {
            error: "Cooldown active",
            cooldown: 30 - timeDiff,
          },
          { status: 429 },
        )
      }
    }

    // Validate coordinates
    if (x < 0 || x >= 50 || y < 0 || y >= 50) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
    }

    // Validate choice
    if (!["welcome_kit", "builder_kit"].includes(choice)) {
      return NextResponse.json({ error: "Invalid choice" }, { status: 400 })
    }

    // Place pixel (upsert)
    const { error: pixelError } = await supabase.from("pixel_war").upsert(
      {
        x,
        y,
        color,
        choice,
        user_identifier: userIdentifier,
        placed_at: new Date().toISOString(),
      },
      {
        onConflict: "x,y",
      },
    )

    if (pixelError) {
      console.error("Failed to place pixel:", pixelError)
      return NextResponse.json({ error: "Failed to place pixel" }, { status: 500 })
    }

    // Update cooldown
    await supabase.from("pixel_cooldowns").upsert(
      {
        user_identifier: userIdentifier,
        last_placed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_identifier",
      },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to place pixel:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

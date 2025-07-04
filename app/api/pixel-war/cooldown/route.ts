import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"
import { headers } from "next/headers"

function getUserIdentifier(request: Request) {
  const headersList = headers()
  const forwarded = headersList.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : headersList.get("x-real-ip") || "unknown"

  // You could also use cookies here for additional tracking
  return `ip_${ip}`
}

export async function GET(request: Request) {
  try {
    const userIdentifier = getUserIdentifier(request)
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("pixel_cooldowns")
      .select("last_placed_at")
      .eq("user_identifier", userIdentifier)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to check cooldown" }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ cooldown: 0 })
    }

    const lastPlaced = new Date(data.last_placed_at)
    const now = new Date()
    const timeDiff = Math.floor((now.getTime() - lastPlaced.getTime()) / 1000)
    const cooldown = Math.max(0, 30 - timeDiff) // 30 second cooldown

    return NextResponse.json({ cooldown })
  } catch (error) {
    console.error("Failed to check cooldown:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { x, y, color, userId } = await request.json()

    // Validate input
    if (typeof x !== "number" || typeof y !== "number" || !color || !userId) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    // Validate coordinates
    if (x < 0 || x >= 100 || y < 0 || y >= 100) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
    }

    // Validate color format (hex color)
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json({ error: "Invalid color format" }, { status: 400 })
    }

    const supabase = createClient()

    // No cooldown check - place pixel immediately
    const { error: insertError } = await supabase.from("pixel_placements").insert({
      x,
      y,
      color,
      user_id: userId,
      placed_at: new Date().toISOString(),
    })

    if (insertError) {
      return NextResponse.json({ error: "Failed to place pixel" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Pixel placed successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

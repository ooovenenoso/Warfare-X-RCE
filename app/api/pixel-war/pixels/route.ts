import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("pixel_war")
      .select("x, y, color, choice")
      .order("placed_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch pixels" }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("Failed to fetch pixels:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

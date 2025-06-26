import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.from("pixel_war").select("choice")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }

    const stats = {
      welcome_kit: data?.filter((p) => p.choice === "welcome_kit").length || 0,
      builder_kit: data?.filter((p) => p.choice === "builder_kit").length || 0,
      total_pixels: data?.length || 0,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Failed to fetch stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's transactions
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select(`
        *,
        credit_packages (
          name,
          credits
        )
      `)
      .eq("discord_id", user.user_metadata?.provider_id || user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching transactions:", error)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({ transactions: transactions || [] })
  } catch (error) {
    console.error("Error in transactions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

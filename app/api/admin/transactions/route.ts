import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getServerSession } from "next-auth"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: Request) {
  try {
    const session = await getServerSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData } = await supabase.from("admins").select().eq("discord_id", session.user.id).single()

    if (!adminData) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // Get transactions with package details and user info
    const { data, error, count } = await supabase
      .from("store_transactions")
      .select(
        `
        *,
        credit_packages (name, credits),
        users (username, avatar)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching transactions:", error)
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
    }

    return NextResponse.json({
      transactions: data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

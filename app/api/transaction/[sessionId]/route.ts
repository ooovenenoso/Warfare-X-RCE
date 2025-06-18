import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const { data: transaction, error } = await supabase
      .from("store_transactions")
      .select(`
        *,
        credit_packages (
          name,
          description
        )
      `)
      .eq("stripe_session_id", params.sessionId)
      .single()

    if (error || !transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient, secureQuery } from "@/lib/supabase"

// Secure database operations endpoint
export async function POST(request: NextRequest) {
  try {
    const { operation, table, data, filters } = await request.json()

    // Validate operation type
    const allowedOperations = ["select", "insert", "update", "delete"]
    if (!allowedOperations.includes(operation)) {
      return NextResponse.json({ error: "Invalid operation" }, { status: 400 })
    }

    const supabase = createAdminClient()

    const result = await secureQuery(async () => {
      switch (operation) {
        case "select":
          return await supabase
            .from(table)
            .select(data)
            .match(filters || {})
        case "insert":
          return await supabase.from(table).insert(data)
        case "update":
          return await supabase.from(table).update(data).match(filters)
        case "delete":
          return await supabase.from(table).delete().match(filters)
        default:
          throw new Error("Unsupported operation")
      }
    })

    if (result.error) {
      return NextResponse.json({ error: "Operation failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { trackVisitor } from "@/lib/visitor-tracking"

export async function POST(request: Request) {
  try {
    await trackVisitor(request)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to track visitor:", error)
    return NextResponse.json({ error: "Failed to track visitor" }, { status: 500 })
  }
}

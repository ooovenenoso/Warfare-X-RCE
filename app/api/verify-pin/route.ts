import { NextResponse } from "next/server"

export async function GET() {
  // PIN system disabled - return 404 to indicate system is not available
  return NextResponse.json({ error: "PIN system disabled" }, { status: 404 })
}

export async function POST() {
  // PIN system disabled - return 404 to indicate system is not available
  return NextResponse.json({ error: "PIN system disabled" }, { status: 404 })
}

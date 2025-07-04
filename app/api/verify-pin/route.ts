import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json()

    const accessPin = process.env.ACCESS_PIN
    const adminPin = process.env.ADMIN_PIN

    if (!accessPin || !adminPin) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    if (pin === accessPin || pin === adminPin) {
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}

import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Always return 0 cooldown - cooldown system disabled
    return NextResponse.json({
      cooldown: 0,
      canPlace: true,
    })
  } catch (error) {
    return NextResponse.json({
      cooldown: 0,
      canPlace: true,
    })
  }
}

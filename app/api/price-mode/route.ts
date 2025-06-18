import { NextResponse } from "next/server"
import { updatePriceMode } from "../packages/route"

// Variable global para el modo de precios
let currentPriceMode: "low_pop" | "normal" | "high_season" = "normal"

// Función exportable para obtener el modo actual
export function getCurrentPriceMode(): "low_pop" | "normal" | "high_season" {
  return currentPriceMode
}

export async function GET() {
  try {
    return NextResponse.json({
      mode: currentPriceMode,
      success: true,
    })
  } catch (error) {
    console.error("Error getting price mode:", error)
    return NextResponse.json(
      {
        mode: "normal",
        success: false,
        error: "Failed to get price mode",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { mode } = await request.json()

    if (!["low_pop", "normal", "high_season"].includes(mode)) {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
    }

    currentPriceMode = mode
    updatePriceMode(mode) // Actualizar también en packages
    console.log(`Price mode updated to: ${mode}`)

    return NextResponse.json({
      mode: currentPriceMode,
      success: true,
      message: `Price mode updated to ${mode}`,
    })
  } catch (error) {
    console.error("Error updating price mode:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        success: false,
      },
      { status: 500 },
    )
  }
}

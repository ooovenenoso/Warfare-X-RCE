import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient, secureDbOperation } from "@/lib/supabase"
import { sanitizeForLogs } from "@/lib/encryption"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Payment system not configured" }, { status: 503 })
    }

    const { packageId, discordId, discordUsername } = await request.json()

    if (!packageId || !discordId || !discordUsername) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get package details with secure operation
    const packageData = await secureDbOperation(async () => {
      const { data, error } = await supabase.from("packages").select("*").eq("id", packageId).single()

      if (error) throw error
      return data
    }, "fetch_package")

    if (!packageData) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: packageData.name,
              description: packageData.description,
            },
            unit_amount: Math.round(packageData.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/`,
      metadata: {
        packageId: packageId.toString(),
        discordId,
        discordUsername,
      },
    })

    // Store transaction with secure operation
    await secureDbOperation(async () => {
      const { error } = await supabase.from("transactions").insert({
        stripe_session_id: session.id,
        package_id: packageId,
        discord_id: discordId,
        discord_username: discordUsername,
        amount: packageData.price,
        status: "pending",
      })

      if (error) throw error
    }, "create_transaction")

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    // Sanitized error logging
    const sanitizedError = sanitizeForLogs(error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/supabase"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: Request) {
  try {
    const { packageId, email, discordId } = await request.json()

    if (!packageId || !email || !discordId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // Get package details
    const { data: packageData, error: packageError } = await supabase
      .from("packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (packageError || !packageData) {
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
      success_url: `${request.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/store`,
      customer_email: email,
      metadata: {
        packageId: packageId.toString(),
        discordId,
        email,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    return NextResponse.json({ error: "Payment setup failed" }, { status: 500 })
  }
}

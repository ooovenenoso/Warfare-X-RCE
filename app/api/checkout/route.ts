import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { secureQuery, createAdminClient } from "@/lib/supabase"
import { sendErrorNotification } from "@/lib/discord-webhook"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const DEMO_MODE = process.env.DEMO_MODE === "true"

export async function POST(request: NextRequest) {
  try {
    const { packageId, serverId } = await request.json()

    if (!packageId || !serverId) {
      return NextResponse.json({ error: "Package ID and Server ID are required" }, { status: 400 })
    }

    // Get package details using secure query
    const { data: packageData, error: packageError } = await secureQuery(
      () => createAdminClient().from("packages").select("*").eq("id", packageId).single(),
      { hideErrors: true },
    )

    if (packageError || !packageData) {
      await sendErrorNotification(`Package not found: ${packageId}`, "checkout/route.ts - Package lookup", "medium")
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    // Get server details using secure query
    const { data: serverData, error: serverError } = await secureQuery(
      () => createAdminClient().from("servers").select("*").eq("id", serverId).single(),
      { hideErrors: true },
    )

    if (serverError || !serverData) {
      await sendErrorNotification(`Server not found: ${serverId}`, "checkout/route.ts - Server lookup", "medium")
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    if (DEMO_MODE) {
      // Demo mode: create a mock session
      const mockSessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create transaction record using secure query
      const { error: transactionError } = await secureQuery(
        () =>
          createAdminClient().from("transactions").insert({
            id: mockSessionId,
            package_id: packageId,
            server_id: serverId,
            amount: packageData.price,
            currency: "USD",
            status: "pending",
            stripe_session_id: mockSessionId,
            created_at: new Date().toISOString(),
          }),
        { hideErrors: true },
      )

      if (transactionError) {
        await sendErrorNotification(
          `Failed to create demo transaction: ${transactionError}`,
          "checkout/route.ts - Demo transaction creation",
          "high",
        )
      }

      return NextResponse.json({
        sessionId: mockSessionId,
        url: `/success?session_id=${mockSessionId}&demo=true`,
      })
    }

    // Production mode: create Stripe session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: packageData.name,
              description: `${packageData.description} - Server: ${serverData.name}`,
              images: packageData.image_url ? [packageData.image_url] : undefined,
            },
            unit_amount: Math.round(packageData.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/store`,
      metadata: {
        packageId: packageId.toString(),
        serverId: serverId.toString(),
        packageName: packageData.name,
        serverName: serverData.name,
      },
      customer_creation: "always",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "ES", "IT", "NL", "SE", "NO", "DK", "FI"],
      },
    })

    // Create transaction record using secure query
    const { error: transactionError } = await secureQuery(
      () =>
        createAdminClient().from("transactions").insert({
          id: session.id,
          package_id: packageId,
          server_id: serverId,
          amount: packageData.price,
          currency: "USD",
          status: "pending",
          stripe_session_id: session.id,
          created_at: new Date().toISOString(),
        }),
      { hideErrors: true },
    )

    if (transactionError) {
      await sendErrorNotification(
        `Failed to create transaction record: ${transactionError}`,
        "checkout/route.ts - Transaction creation",
        "high",
      )
      // Continue anyway, as the Stripe session was created successfully
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("Checkout error:", error)
    await sendErrorNotification(`Checkout error: ${error}`, "checkout/route.ts - General error", "high")
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

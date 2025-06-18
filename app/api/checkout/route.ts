import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(request: NextRequest) {
  try {
    const { packageId, serverId } = await request.json()

    const supabase = createRouteHandlerClient({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const discordId =
      user.user_metadata?.provider_id || user.user_metadata?.sub || user.id
    const userId = user.id

    if (!packageId || !serverId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.log("Stripe not configured - using demo mode")

      // Demo mode - simulate successful purchase
      const demoTransaction = {
        id: "demo-" + Date.now(),
        packageId,
        serverId,
        discordId: discordId || "907231041167716352",
        amount: 19.99,
        credits: 2500,
        status: "completed",
      }

      // Simulate webhook call for demo
      try {
        await fetch(`${request.nextUrl.origin}/api/verify-payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: "demo-session-" + Date.now() }),
        })
      } catch (error) {
        console.error("Demo webhook error:", error)
      }

      return NextResponse.json({
        demo: true,
        transaction: demoTransaction,
        message: "Demo purchase completed successfully!",
      })
    }

    // Real Stripe integration
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Fetch package details
    const { data: package_data, error: packageError } = await supabaseAdmin
      .from("credit_packages")
      .select("*")
      .eq("id", packageId)
      .single()

    if (packageError || !package_data) {
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
              name: package_data.name,
              description: `${package_data.credits.toLocaleString()} credits - ${package_data.description}`,
            },
            unit_amount: Math.round((package_data.current_price || package_data.base_price) * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/store`,
      metadata: {
        packageId,
        discordId,
        serverId: serverId || "default",
        credits: package_data.credits.toString(),
      },
    })

    // Create pending transaction record
    const { error: transactionError } = await supabaseAdmin
      .from("store_transactions")
      .insert({
        package_id: packageId,
        discord_id: discordId,
        user_id: userId,
        server_id: serverId || "default",
        stripe_session_id: session.id,
        base_amount: package_data.base_price || package_data.current_price,
        final_amount: package_data.current_price || package_data.base_price,
        credits_purchased: package_data.credits,
        status: "pending",
        payment_status: "pending",
      })

    if (transactionError) {
      console.error("Error creating transaction:", transactionError)
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

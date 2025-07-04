import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { secureQuery, createAdminClient } from "@/lib/supabase"
import { sendDiscordNotification, sendErrorNotification } from "@/lib/discord-webhook"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const DEMO_MODE = process.env.DEMO_MODE === "true"

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Handle demo mode
    if (DEMO_MODE || sessionId.startsWith("demo_")) {
      // Get transaction details using secure query
      const { data: transaction, error: transactionError } = await secureQuery(
        () =>
          createAdminClient()
            .from("transactions")
            .select(`
            *,
            packages (name, description, price),
            servers (name, ip)
          `)
            .eq("stripe_session_id", sessionId)
            .single(),
        { hideErrors: true },
      )

      if (transactionError || !transaction) {
        await sendErrorNotification(
          `Demo transaction not found: ${sessionId}`,
          "verify-payment/route.ts - Demo transaction lookup",
          "medium",
        )
        return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
      }

      // Update transaction status using secure query
      const { error: updateError } = await secureQuery(
        () =>
          createAdminClient()
            .from("transactions")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
            })
            .eq("stripe_session_id", sessionId),
        { hideErrors: true },
      )

      if (updateError) {
        await sendErrorNotification(
          `Failed to update demo transaction: ${updateError}`,
          "verify-payment/route.ts - Demo transaction update",
          "high",
        )
      }

      // Send Discord notification
      await sendDiscordNotification({
        packageName: transaction.packages.name,
        amount: transaction.amount,
        currency: transaction.currency,
        customerEmail: "demo@example.com",
        serverId: transaction.servers.name,
        transactionId: sessionId,
        timestamp: new Date().toISOString(),
      })

      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction.id,
          packageName: transaction.packages.name,
          serverName: transaction.servers.name,
          amount: transaction.amount,
          currency: transaction.currency,
          status: "completed",
        },
      })
    }

    // Production mode: verify with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"],
    })

    if (session.payment_status !== "paid") {
      await sendErrorNotification(
        `Payment not completed for session: ${sessionId}`,
        "verify-payment/route.ts - Payment status check",
        "medium",
      )
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Get transaction details using secure query
    const { data: transaction, error: transactionError } = await secureQuery(
      () =>
        createAdminClient()
          .from("transactions")
          .select(`
          *,
          packages (name, description, price),
          servers (name, ip)
        `)
          .eq("stripe_session_id", sessionId)
          .single(),
      { hideErrors: true },
    )

    if (transactionError || !transaction) {
      await sendErrorNotification(
        `Transaction not found for session: ${sessionId}`,
        "verify-payment/route.ts - Transaction lookup",
        "high",
      )
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update transaction status using secure query
    const { error: updateError } = await secureQuery(
      () =>
        createAdminClient()
          .from("transactions")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            stripe_payment_intent: session.payment_intent as string,
            customer_email: session.customer_details?.email,
            customer_name: session.customer_details?.name,
          })
          .eq("stripe_session_id", sessionId),
      { hideErrors: true },
    )

    if (updateError) {
      await sendErrorNotification(
        `Failed to update transaction: ${updateError}`,
        "verify-payment/route.ts - Transaction update",
        "high",
      )
    }

    // Send Discord notification
    await sendDiscordNotification({
      packageName: transaction.packages.name,
      amount: transaction.amount,
      currency: transaction.currency,
      customerEmail: session.customer_details?.email || "Unknown",
      serverId: transaction.servers.name,
      transactionId: sessionId,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        packageName: transaction.packages.name,
        serverName: transaction.servers.name,
        amount: transaction.amount,
        currency: transaction.currency,
        status: "completed",
        customerEmail: session.customer_details?.email,
        customerName: session.customer_details?.name,
      },
    })
  } catch (error) {
    console.error("Payment verification error:", error)
    await sendErrorNotification(
      `Payment verification error: ${error}`,
      "verify-payment/route.ts - General error",
      "high",
    )
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}

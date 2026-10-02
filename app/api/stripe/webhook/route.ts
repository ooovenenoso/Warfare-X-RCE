import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createStoreAdminClient } from "@/lib/store-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!stripeKey || !webhookSecret) return NextResponse.json({ error: "Stripe webhook is not configured" }, { status: 503 });
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });

  const stripe = new Stripe(stripeKey);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") return NextResponse.json({ received: true, pending: true });
  if (!session.metadata?.transaction_id || typeof session.amount_total !== "number" || session.currency !== "usd") {
    return NextResponse.json({ error: "Stripe session is missing expected store metadata" }, { status: 400 });
  }

  try {
    const db = createStoreAdminClient();
    const { data: transaction, error: lookupError } = await db.from("transactions")
      .select("id, stripe_session_id")
      .eq("id", session.metadata.transaction_id)
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!transaction) return NextResponse.json({ error: "Store transaction not found" }, { status: 404 });

    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
    const { error: fulfillmentError } = await db.rpc("fulfill_paid_store_transaction", {
      p_stripe_session_id: session.id,
      p_payment_intent_id: paymentIntentId,
      p_amount_cents: session.amount_total,
    });
    if (fulfillmentError) throw fulfillmentError;
    return NextResponse.json({ received: true });
  } catch {
    // A non-2xx response asks Stripe to retry delivery.
    return NextResponse.json({ error: "Payment fulfillment failed" }, { status: 500 });
  }
}

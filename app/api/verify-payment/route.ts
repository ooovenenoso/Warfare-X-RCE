import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createStoreAdminClient, getStoreIdentity } from "@/lib/store-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const identity = await getStoreIdentity();
    if (!identity) return NextResponse.json({ error: "Sign in with Discord to view this purchase" }, { status: 401 });
    let body: { sessionId?: unknown };
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
    if (!sessionId) return NextResponse.json({ error: "Payment session is required" }, { status: 400 });
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });

    const db = createStoreAdminClient();
    const { data: storeUser, error: userError } = await db.from("users").select("id").eq("discord_id", identity.discordId).maybeSingle();
    if (userError) throw userError;
    if (!storeUser) return NextResponse.json({ error: "Store account was not found" }, { status: 404 });

    const { data: transaction, error: transactionError } = await db.from("transactions")
      .select("id, user_id, stripe_session_id, server_id, credits_purchased, final_amount, status, delivery_status")
      .eq("stripe_session_id", sessionId)
      .eq("user_id", storeUser.id)
      .maybeSingle();
    if (transactionError) throw transactionError;
    if (!transaction) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

    const stripe = new Stripe(key);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.metadata?.transaction_id !== transaction.id) return NextResponse.json({ error: "Payment session does not match this order" }, { status: 403 });
    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false, pending: true, status: session.status ?? "open", error: "Payment is still processing" }, { status: 202 });
    }
    if (typeof session.amount_total !== "number" || session.currency !== "usd") return NextResponse.json({ error: "Unexpected payment amount or currency" }, { status: 400 });

    const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
    const { data: fulfillment, error: fulfillmentError } = await db.rpc("fulfill_paid_store_transaction", {
      p_stripe_session_id: session.id,
      p_payment_intent_id: paymentIntentId,
      p_amount_cents: session.amount_total,
    });
    if (fulfillmentError) throw fulfillmentError;
    return NextResponse.json({
      success: true,
      delivered: Boolean(fulfillment?.delivered),
      status: fulfillment?.status ?? transaction.delivery_status,
      credits: transaction.credits_purchased,
      server: transaction.server_id,
      amount: session.amount_total / 100,
    });
  } catch (error) {
    console.error("Payment verification failed", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Unable to verify payment right now" }, { status: 503 });
  }
}

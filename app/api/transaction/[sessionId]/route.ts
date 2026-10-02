import { type NextRequest, NextResponse } from "next/server";
import { createStoreAdminClient, getStoreIdentity } from "@/lib/store-server";

export async function GET(_request: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const identity = await getStoreIdentity();
    if (!identity) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { sessionId } = await context.params;
    if (!sessionId || sessionId.length > 255) return NextResponse.json({ error: "Invalid transaction reference" }, { status: 400 });

    const db = createStoreAdminClient();
    const { data: user, error: userError } = await db.from("users").select("id").eq("discord_id", identity.discordId).maybeSingle();
    if (userError) throw userError;
    if (!user) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const { data, error } = await db.from("transactions")
      .select("id, transaction_number, server_id, base_amount, final_amount, currency, credits_purchased, credits_delivered, status, payment_status, delivery_status, created_at, completed_at, credit_packages(name, description)")
      .eq("stripe_session_id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load transaction" }, { status: 503 });
  }
}

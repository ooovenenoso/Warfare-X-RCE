import { NextResponse } from "next/server";
import { createStoreAdminClient, getStoreIdentity } from "@/lib/store-server";

export async function GET() {
  try {
    const identity = await getStoreIdentity();
    if (!identity) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const db = createStoreAdminClient();
    const { data: storeUser, error: userError } = await db.from("users")
      .select("id").eq("discord_id", identity.discordId).maybeSingle();
    if (userError) throw userError;
    if (!storeUser) return NextResponse.json({ transactions: [] }, { headers: { "Cache-Control": "no-store" } });
    const { data, error } = await db.from("transactions")
      .select("id, transaction_number, package_id, server_id, final_amount, credits_purchased, status, payment_status, delivery_status, created_at, completed_at, credit_packages(name, credits)")
      .eq("user_id", storeUser.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ transactions: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load transaction history" }, { status: 503 });
  }
}

import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { calculateStorePrice, createStoreAdminClient, getPriceMode, getStoreIdentity } from "@/lib/store-server";

export const runtime = "nodejs";

function siteOrigin(request: NextRequest): string {
  const configured = process.env.APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  return new URL(configured || request.nextUrl.origin).origin;
}

export async function POST(request: NextRequest) {
  let transactionId: string | undefined;
  try {
    const identity = await getStoreIdentity();
    if (!identity) return NextResponse.json({ error: "Sign in with Discord before checkout" }, { status: 401 });

    let body: { packageId?: unknown; serverId?: unknown };
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const packageId = typeof body.packageId === "string" ? body.packageId.trim() : "";
    const serverId = typeof body.serverId === "string" ? body.serverId.trim() : "";
    if (!packageId || !serverId) return NextResponse.json({ error: "Package and server are required" }, { status: 400 });

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });

    const db = createStoreAdminClient();
    const [{ data: server, error: serverError }, { data: packageData, error: packageError }, { data: link, error: linkError }] = await Promise.all([
      db.from("servers").select("id").eq("id", serverId).eq("is_active", true).maybeSingle(),
      db.from("credit_packages").select("id, name, description, credits, base_price, is_active").eq("id", packageId).eq("is_active", true).maybeSingle(),
      db.from("username_links").select("username").eq("discord_id", identity.discordId).eq("server_id", serverId).eq("is_verified", true).maybeSingle(),
    ]);
    if (serverError || packageError || linkError) throw new Error("Store data lookup failed");
    if (!server) return NextResponse.json({ error: "That server is not available" }, { status: 404 });
    if (!packageData) return NextResponse.json({ error: "That package is not available" }, { status: 404 });
    if (!link) return NextResponse.json({ error: "Link and verify your Discord account with this server before buying" }, { status: 409 });

    const basePrice = Number(packageData.base_price);
    if (!Number.isFinite(basePrice) || basePrice <= 0 || !Number.isInteger(packageData.credits) || packageData.credits <= 0) {
      return NextResponse.json({ error: "The selected package is not configured correctly" }, { status: 409 });
    }
    const mode = await getPriceMode(db);
    const price = calculateStorePrice(basePrice, mode);
    const amountCents = Math.round(price * 100);
    if (amountCents < 50) return NextResponse.json({ error: "Package price is below Stripe's minimum" }, { status: 409 });

    const metadata = identity.user.user_metadata ?? {};
    const username = String(metadata.global_name ?? metadata.name ?? identity.user.email?.split("@")[0] ?? ("player-" + identity.discordId.slice(-4))).slice(0, 64);
    const { data: storeUser, error: userError } = await db.from("users").upsert({
      discord_id: identity.discordId,
      username,
      email: identity.user.email ?? null,
      avatar: metadata.avatar_url ?? metadata.picture ?? null,
      last_login: new Date().toISOString(),
    }, { onConflict: "discord_id" }).select("id").single();
    if (userError || !storeUser) throw new Error("Could not create store user");

    const { data: transaction, error: transactionError } = await db.from("transactions").insert({
      user_id: storeUser.id,
      package_id: packageData.id,
      server_id: serverId,
      base_amount: basePrice,
      final_amount: price,
      credits_purchased: packageData.credits,
      credits_delivered: 0,
      status: "pending",
      payment_status: "pending",
      delivery_status: "pending",
      payment_method: "stripe",
    }).select("id").single();
    if (transactionError || !transaction) throw new Error("Could not create pending transaction");
    transactionId = transaction.id;

    const stripe = new Stripe(stripeKey);
    const origin = siteOrigin(request);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: packageData.name,
            description: (Number(packageData.credits).toLocaleString() + " credits — " + (packageData.description ?? "Game server credits")).slice(0, 500),
          },
        },
      }],
      success_url: origin + "/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/store",
      customer_email: identity.user.email ?? undefined,
      metadata: { transaction_id: transaction.id, discord_id: identity.discordId, server_id: serverId, package_id: packageData.id },
    });

    const { error: saveSessionError } = await db.from("transactions")
      .update({ stripe_session_id: session.id })
      .eq("id", transaction.id);
    if (saveSessionError) {
      await stripe.checkout.sessions.expire(session.id).catch(() => undefined);
      throw new Error("Could not save Stripe session");
    }
    return NextResponse.json({ url: session.url, transactionId: transaction.id });
  } catch (error) {
    if (transactionId) {
      try { await createStoreAdminClient().from("transactions").update({ status: "failed", payment_status: "failed" }).eq("id", transactionId).eq("status", "pending"); } catch { /* preserve original error */ }
    }
    console.error("Checkout could not be started", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Unable to start checkout. Please try again or contact support." }, { status: 503 });
  }
}

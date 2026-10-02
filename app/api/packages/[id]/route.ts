import { type NextRequest, NextResponse } from "next/server";
import { createStoreAdminClient, getStoreAdmin, getStoreIdentity } from "@/lib/store-server";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const db = createStoreAdminClient();
    const identity = await getStoreIdentity();
    const admin = identity ? await getStoreAdmin() : null;
    let query = db.from("credit_packages").select("*").eq("id", id);
    if (!admin) query = query.eq("is_active", true);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load package" }, { status: 503 });
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const admin = await getStoreAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    let body: Record<string, unknown>;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const updates: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim().slice(0, 100);
    if (typeof body.description === "string") updates.description = body.description.slice(0, 1000);
    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "Price must be positive" }, { status: 400 });
      updates.base_price = price; updates.current_price = price;
    }
    if (body.credits !== undefined) {
      const credits = Number(body.credits);
      if (!Number.isSafeInteger(credits) || credits <= 0) return NextResponse.json({ error: "Credits must be a positive whole number" }, { status: 400 });
      updates.credits = credits;
    }
    if (typeof body.image_url === "string" || body.image_url === null) updates.image_url = body.image_url;
    if (typeof body.active === "boolean") updates.is_active = body.active;
    if (typeof body.popular === "boolean") updates.is_popular = body.popular;
    if (typeof body.bestValue === "boolean") updates.is_best_value = body.bestValue;
    if (!Object.keys(updates).length) return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });

    const { data, error } = await createStoreAdminClient().from("credit_packages").update(updates).eq("id", id).select("*").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unable to update package" }, { status: 503 });
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  try {
    const admin = await getStoreAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { id } = await context.params;
    const { data, error } = await createStoreAdminClient().from("credit_packages")
      .update({ is_active: false }).eq("id", id).select("id").maybeSingle();
    if (error) throw error;
    if (!data) return NextResponse.json({ error: "Package not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unable to remove package" }, { status: 503 });
  }
}

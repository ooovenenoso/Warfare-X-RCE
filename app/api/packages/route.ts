import { NextResponse } from "next/server";
import { calculateStorePrice, createStoreAdminClient, getPriceMode, getStoreAdmin } from "@/lib/store-server";

export async function GET() {
  try {
    const db = createStoreAdminClient();
    const [{ data: packages, error }, mode] = await Promise.all([
      db.from("credit_packages").select("id, name, description, credits, base_price, current_price, image_url, is_popular, is_best_value, is_featured, is_active, sort_order")
        .eq("is_active", true).order("sort_order", { ascending: true }),
      getPriceMode(db),
    ]);
    if (error) throw error;
    const result = (packages ?? []).map((pkg) => {
      const basePrice = Number(pkg.base_price ?? pkg.current_price);
      const price = calculateStorePrice(basePrice, mode);
      return { ...pkg, basePrice, price, originalPrice: mode === "normal" ? undefined : basePrice,
        popular: pkg.is_popular, bestValue: pkg.is_best_value, active: pkg.is_active,
        discount: mode === "low_pop" ? 50 : 0, priceIncrease: mode === "high_season" ? 15 : 0, priceMode: mode };
    });
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Store packages are unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getStoreAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    let body: Record<string, unknown>;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const credits = Number(body.credits);
    const price = Number(body.price);
    if (!name || name.length > 100 || !Number.isSafeInteger(credits) || credits <= 0 || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "A name, positive whole-credit amount, and positive price are required" }, { status: 400 });
    }
    const db = createStoreAdminClient();
    const { data, error } = await db.from("credit_packages").insert({
      name, description: typeof body.description === "string" ? body.description.slice(0, 1000) : "",
      credits, base_price: price, current_price: price,
      image_url: typeof body.image_url === "string" ? body.image_url : null,
      is_active: body.active !== false, is_popular: body.popular === true,
      is_best_value: body.bestValue === true, sort_order: Number.isSafeInteger(body.sortOrder) ? Number(body.sortOrder) : 0,
    }).select("*").single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unable to create package" }, { status: 503 });
  }
}

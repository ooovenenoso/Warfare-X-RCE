import { NextResponse } from "next/server";
import { createStoreAdminClient, getPriceMode, getStoreAdmin, type PriceMode } from "@/lib/store-server";

const allowedModes: PriceMode[] = ["normal", "low_pop", "high_season"];

export async function GET() {
  try {
    return NextResponse.json({ mode: await getPriceMode(), success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load pricing mode", success: false }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getStoreAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    let body: { mode?: unknown };
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    if (typeof body.mode !== "string" || !allowedModes.includes(body.mode as PriceMode)) {
      return NextResponse.json({ error: "Invalid pricing mode" }, { status: 400 });
    }
    const db = createStoreAdminClient();
    const { error } = await db.from("system_settings").upsert({
      key: "current_price_mode", value: body.mode, value_type: "string",
      description: "Current active store pricing mode", category: "pricing",
    }, { onConflict: "key" });
    if (error) throw error;
    return NextResponse.json({ mode: body.mode, success: true });
  } catch {
    return NextResponse.json({ error: "Unable to save pricing mode", success: false }, { status: 503 });
  }
}

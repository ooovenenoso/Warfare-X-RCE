import { NextResponse } from "next/server";
import { createStoreAdminClient, getStoreAdmin } from "@/lib/store-server";

export async function GET(request: Request) {
  try {
    const admin = await getStoreAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { searchParams } = new URL(request.url);
    const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const rawLimit = Number.parseInt(searchParams.get("limit") ?? "10", 10);
    const page = Number.isSafeInteger(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit = Number.isSafeInteger(rawLimit) ? Math.min(100, Math.max(1, rawLimit)) : 10;
    const offset = (page - 1) * limit;
    const { data, error, count } = await createStoreAdminClient().from("transactions")
      .select("*, credit_packages(name, credits), users(username, avatar, discord_id)", { count: "exact" })
      .order("created_at", { ascending: false }).range(offset, offset + limit - 1);
    if (error) throw error;
    const transactions = (data ?? []).map((row) => ({ ...row, discord_id: row.users?.discord_id ?? null }));
    return NextResponse.json({ transactions, total: count ?? 0, page, limit, totalPages: Math.ceil((count ?? 0) / limit) },
      { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load transactions" }, { status: 503 });
  }
}

import { NextResponse } from "next/server";
import { createStoreAdminClient, getStoreAdmin } from "@/lib/store-server";

export async function GET() {
  try {
    const admin = await getStoreAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const db = createStoreAdminClient();
    const cutoff = new Date(); cutoff.setUTCMonth(cutoff.getUTCMonth() - 5, 1); cutoff.setUTCHours(0, 0, 0, 0);
    const [completed, completedCount, attempts, monthly] = await Promise.all([
      db.from("transactions").select("final_amount, user_id").eq("status", "completed"),
      db.from("transactions").select("id", { count: "exact", head: true }).eq("status", "completed"),
      db.from("transactions").select("id", { count: "exact", head: true }),
      db.from("transactions").select("final_amount, created_at").eq("status", "completed").gte("created_at", cutoff.toISOString()),
    ]);
    if (completed.error || completedCount.error || attempts.error || monthly.error) throw new Error("Stats query failed");
    const totalRevenue = (completed.data ?? []).reduce((sum, row) => sum + Number(row.final_amount ?? 0), 0);
    const activeUsers = new Set((completed.data ?? []).map((row) => row.user_id).filter(Boolean)).size;
    const total = attempts.count ?? 0;
    const count = completedCount.count ?? 0;
    const buckets = new Map<string, number>();
    for (const row of monthly.data ?? []) {
      const date = new Date(row.created_at);
      const key = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
      buckets.set(key, (buckets.get(key) ?? 0) + Number(row.final_amount ?? 0));
    }
    const chartData = [...buckets.entries()].map(([month, revenue]) => ({ month, revenue: Math.round(revenue) }));
    return NextResponse.json({ totalRevenue: Math.round(totalRevenue * 100) / 100, totalTransactions: count,
      activeUsers, conversionRate: total ? Math.round((count / total) * 1000) / 10 : 0, chartData },
      { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to load store statistics" }, { status: 503 });
  }
}

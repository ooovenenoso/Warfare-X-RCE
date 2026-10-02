import { NextResponse } from "next/server";
import { createStoreAdminClient } from "@/lib/store-server";

export async function GET() {
  try {
    const { data, error } = await createStoreAdminClient()
      .from("servers")
      .select("id, name, description")
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return NextResponse.json((data ?? []).map((server) => ({ ...server, active: true })));
  } catch {
    return NextResponse.json({ error: "Unable to load servers" }, { status: 503 });
  }
}

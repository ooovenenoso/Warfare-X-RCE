import { NextResponse } from "next/server";
import { createStoreAdminClient, getStoreIdentity } from "@/lib/store-server";

export async function POST(request: Request) {
  try {
    const identity = await getStoreIdentity();
    if (!identity) return NextResponse.json({ error: "Sign in with Discord first" }, { status: 401 });
    let body: { serverId?: unknown };
    try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body" }, { status: 400 }); }
    const serverId = typeof body.serverId === "string" ? body.serverId.trim() : "";
    if (!serverId) return NextResponse.json({ error: "Server ID is required" }, { status: 400 });

    const db = createStoreAdminClient();
    const { data, error } = await db.from("username_links")
      .select("username, is_verified")
      .eq("discord_id", identity.discordId)
      .eq("server_id", serverId)
      .eq("is_verified", true)
      .maybeSingle();
    if (error) throw error;
    return NextResponse.json({ isLinked: Boolean(data), username: data?.username ?? null });
  } catch {
    return NextResponse.json({ error: "Unable to check the linked game account" }, { status: 503 });
  }
}

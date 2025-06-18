import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service role client so we can read links regardless of RLS settings
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  try {
    // Fetch unique server IDs from UsernameLinks so players only see
    // servers that have linked accounts
    const { data: servers, error } = await supabase
      .from("UsernameLinks")
      .select("server_id")
      .order("server_id");

    if (error) {
      console.error("Error fetching servers:", error);
      return NextResponse.json(
        { error: "Failed to fetch servers" },
        { status: 500 },
      );
    }

    const uniqueServers = [...new Set(servers.map((s) => s.server_id))];
    const serverList = uniqueServers.map((serverId) => ({
      id: serverId,
      name: `Server ${serverId}`,
      description: `CNQR Server ${serverId}`,
      active: true,
    }));

    return NextResponse.json(serverList);
  } catch (error) {
    console.error("Error in servers API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

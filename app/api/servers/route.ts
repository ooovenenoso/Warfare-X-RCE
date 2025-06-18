import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  try {
    // Retrieve active servers from the servers table
    const { data: servers, error } = await supabase
      .from("servers")
      .select("id, name, description, is_active")
      .eq("is_active", true)
      .order("id");

    if (error) {
      console.error("Error fetching servers:", error);
      return NextResponse.json(
        { error: "Failed to fetch servers" },
        { status: 500 },
      );
    }

    return NextResponse.json(servers);
  } catch (error) {
    console.error("Error in servers API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

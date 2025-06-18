import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { serverId } = await request.json()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!serverId) {
    return NextResponse.json({ error: "Server ID is required" }, { status: 400 })
  }

  const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub

  if (!discordId) {
    return NextResponse.json({ error: "Could not determine Discord ID" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("username_links")
      .select("username")
      .eq("discord_id", discordId)
      .eq("server_id", serverId)
      .single()

    if (error || !data) {
      console.warn(`No link found for discordId: ${discordId} on server: ${serverId}`, error)
      return NextResponse.json({ isLinked: false, username: null })
    }

    return NextResponse.json({ isLinked: true, username: data.username })
  } catch (error) {
    console.error("Error checking link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

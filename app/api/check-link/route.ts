import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const supabaseSession = createRouteHandlerClient({ cookies })
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const { serverId, discordId: bodyDiscordId } = await request.json()

  const {
    data: { user },
  } = await supabaseSession.auth.getUser()

  const sessionDiscordId = user?.user_metadata?.provider_id || user?.user_metadata?.sub
  const discordId = bodyDiscordId || sessionDiscordId

  if (!discordId) {
    return NextResponse.json({ error: "Could not determine Discord ID" }, { status: 400 })
  }

  if (!serverId) {
    return NextResponse.json({ error: "Server ID is required" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("UsernameLinks")
      .select("username")
      .eq("discord_id", discordId)
      .eq("server_id", serverId)
      .single()

    if (error || !data) {
      // Don't log potentially sensitive info
      return NextResponse.json({ isLinked: false, username: null })
    }

    return NextResponse.json({ isLinked: true, username: data.username })
  } catch (error) {
    // Don't log error to console
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

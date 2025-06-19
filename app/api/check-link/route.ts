import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  const supabaseSession = createRouteHandlerClient({ cookies })
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { serverId, discordId: bodyDiscordId } = await request.json()

  const {
    data: { user: sessionUser },
  } = await supabaseSession.auth.getUser()

  const sessionDiscordId =
    sessionUser?.user_metadata?.provider_id ||
    sessionUser?.user_metadata?.sub ||
    sessionUser?.id
  const discordId = bodyDiscordId || sessionDiscordId

  if (!discordId) {
    return NextResponse.json(
      { error: "Could not determine Discord ID" },
      { status: 400 }
    )
  }

  if (!serverId) {
    return NextResponse.json({ error: "Server ID is required" }, { status: 400 })
  }

  try {
    // Attempt lookup in PascalCase table first
    let { data, error } = await supabase
      .from("UsernameLinks")
      .select("username")
      .eq("discord_id", discordId)
      .eq("server_id", serverId)
      .single()

    if (error || !data) {
      // Fallback to lowercase table name if not found
      const { data: lowerData } = await supabase
        .from("username_links")
        .select("username")
        .eq("discord_id", discordId)
        .eq("server_id", serverId)
        .single()

      data = lowerData as any
    }

    if (!data) {
      console.warn(`No link found for discordId: ${discordId} on server: ${serverId}`)
      return NextResponse.json({ isLinked: false, username: null })
    }

    return NextResponse.json({ isLinked: true, username: data.username })
  } catch (error) {
    console.error("Error checking link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

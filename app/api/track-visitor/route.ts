import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient, secureDbOperation } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { ip, userAgent, location } = await request.json()

    const supabase = createAdminClient()

    const result = await secureDbOperation(async () => {
      return await supabase.from("visitor_logs").insert({
        ip_address: ip,
        user_agent: userAgent,
        visited_at: new Date().toISOString(),
      })
    }, "log_visitor")

    // Send Discord notification silently
    if (process.env.VISITOR_WEBHOOK_URL && location) {
      try {
        const embed = {
          title: "🌍 New Visitor",
          color: 0x00ff00,
          fields: [
            {
              name: "Location",
              value: `${location.city || "Unknown"}, ${location.country || "Unknown"}`,
              inline: true,
            },
            {
              name: "Time",
              value: new Date().toLocaleString(),
              inline: true,
            },
          ],
        }

        await fetch(process.env.VISITOR_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "CNQR Visitor Tracker",
            embeds: [embed],
          }),
        })
      } catch (webhookError) {
        // Silent webhook error handling
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

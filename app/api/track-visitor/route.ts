import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient, secureDbOperation } from "@/lib/supabase"
import { sanitizeForLogs } from "@/lib/encryption"

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get("user-agent") || "Unknown"
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "Unknown"

    // Get location data
    let locationData = null
    try {
      if (ip !== "Unknown" && !ip.includes("127.0.0.1") && !ip.includes("localhost")) {
        const response = await fetch(`http://ip-api.com/json/${ip}`)
        locationData = await response.json()
      }
    } catch (error) {
      // Silent location lookup failure
    }

    const supabase = createAdminClient()

    // Store visitor data with secure operation
    await secureDbOperation(async () => {
      const { error } = await supabase.from("visitor_logs").insert({
        ip_address: ip,
        user_agent: userAgent,
        country: locationData?.country || "Unknown",
        region: locationData?.regionName || "Unknown",
        city: locationData?.city || "Unknown",
        isp: locationData?.isp || "Unknown",
        visited_at: new Date().toISOString(),
      })

      if (error) throw error
    }, "log_visitor")

    // Send Discord webhook if configured
    if (process.env.VISITOR_WEBHOOK_URL) {
      try {
        await fetch(process.env.VISITOR_WEBHOOK_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            embeds: [
              {
                title: "🌍 New Visitor",
                color: 0x00ff00,
                fields: [
                  {
                    name: "Location",
                    value: `${locationData?.city || "Unknown"}, ${locationData?.regionName || "Unknown"}, ${locationData?.country || "Unknown"}`,
                    inline: true,
                  },
                  {
                    name: "ISP",
                    value: locationData?.isp || "Unknown",
                    inline: true,
                  },
                  {
                    name: "Device",
                    value: userAgent.includes("Mobile") ? "📱 Mobile" : "💻 Desktop",
                    inline: true,
                  },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        })
      } catch (error) {
        // Silent webhook failure
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Sanitized error logging
    const sanitizedError = sanitizeForLogs(error)
    return NextResponse.json({ error: "Visitor tracking failed" }, { status: 500 })
  }
}

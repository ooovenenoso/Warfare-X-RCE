interface VisitorData {
  ip_address: string
  user_agent: string
  country?: string
  city?: string
  device_type?: string
  browser?: string
  os?: string
  referrer?: string
  timestamp: string
  url: string
}

export async function trackVisitor(request?: Request) {
  if (!process.env.VISITOR_WEBHOOK_URL) {
    return
  }

  try {
    // Extract visitor information
    const headers = request ? request.headers : {}
    const forwarded = headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : headers.get("x-real-ip") || "unknown"
    const userAgent = request
      ? headers.get("user-agent") || "unknown"
      : typeof window !== "undefined"
        ? window.navigator.userAgent
        : "Unknown"
    const referrer = request ? headers.get("referer") || "direct" : "Unknown"
    const url = request ? request.url : typeof window !== "undefined" ? window.location.href : "Unknown"

    // Parse user agent for device/browser info
    const deviceInfo = parseUserAgent(userAgent)

    // Get geolocation (you might want to use a service like ipapi.co)
    let geoData = null
    try {
      const geoResponse = await fetch(`http://ip-api.com/json/${ip}`)
      if (geoResponse.ok) {
        geoData = await geoResponse.json()
      }
    } catch (error) {
      console.log("Geo lookup failed:", error)
    }

    const visitorData: VisitorData = {
      ip_address: ip,
      user_agent: userAgent,
      country: geoData?.country || "Unknown",
      city: geoData?.city || "Unknown",
      device_type: deviceInfo.device,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      referrer: referrer,
      timestamp: new Date().toISOString(),
      url: url,
    }

    // Send to webhook
    await sendVisitorWebhook(visitorData)

    // Store in database
    await storeVisitorData(visitorData)
  } catch (error) {
    console.error("Failed to track visitor:", error)
  }
}

function parseUserAgent(userAgent: string) {
  const device = /Mobile|Android|iPhone|iPad/.test(userAgent) ? "Mobile" : "Desktop"

  let browser = "Unknown"
  if (userAgent.includes("Chrome")) browser = "Chrome"
  else if (userAgent.includes("Firefox")) browser = "Firefox"
  else if (userAgent.includes("Safari")) browser = "Safari"
  else if (userAgent.includes("Edge")) browser = "Edge"

  let os = "Unknown"
  if (userAgent.includes("Windows")) os = "Windows"
  else if (userAgent.includes("Mac")) os = "macOS"
  else if (userAgent.includes("Linux")) os = "Linux"
  else if (userAgent.includes("Android")) os = "Android"
  else if (userAgent.includes("iOS")) os = "iOS"

  return { device, browser, os }
}

async function sendVisitorWebhook(visitorData: VisitorData) {
  const webhookUrl = process.env.VISITOR_WEBHOOK_URL
  if (!webhookUrl) return

  const embed = {
    title: "🔍 New Visitor Detected",
    description: `Someone just visited your WARFARE store!`,
    color: 0x00ff00,
    fields: [
      {
        name: "🌍 Location",
        value: `${visitorData.city}, ${visitorData.country}`,
        inline: true,
      },
      {
        name: "📱 Device",
        value: visitorData.device_type || "Unknown",
        inline: true,
      },
      {
        name: "🌐 Browser",
        value: `${visitorData.browser} on ${visitorData.os}`,
        inline: true,
      },
      {
        name: "🔗 Referrer",
        value: visitorData.referrer === "direct" ? "Direct Visit" : visitorData.referrer,
        inline: false,
      },
      {
        name: "🔢 IP Address",
        value: `\`${visitorData.ip_address}\``,
        inline: true,
      },
      {
        name: "🕒 Time",
        value: visitorData.timestamp,
        inline: true,
      },
      {
        name: "🔗 Page",
        value: visitorData.url,
        inline: true,
      },
    ],
    footer: {
      text: "WARFARE Visitor Tracking",
    },
    timestamp: visitorData.timestamp,
  }

  const webhookData = {
    username: "WARFARE Analytics 📊",
    embeds: [embed],
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookData),
    })
  } catch (error) {
    console.error("Failed to send visitor webhook:", error)
  }
}

async function storeVisitorData(visitorData: VisitorData) {
  try {
    const { createAdminClient } = await import("@/lib/supabase")
    const supabase = createAdminClient()

    await supabase.from("visitor_logs").insert(visitorData)
  } catch (error) {
    console.error("Failed to store visitor data:", error)
  }
}

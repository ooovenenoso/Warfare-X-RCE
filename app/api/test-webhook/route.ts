import { NextResponse } from "next/server"

export async function POST() {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL

  if (!webhookUrl) {
    return NextResponse.json({ error: "Discord webhook URL not configured" }, { status: 400 })
  }

  console.log("Testing webhook with URL:", webhookUrl)

  const testWebhookData = {
    username: "CNQR Store Test 🧪",
    avatar_url: "https://cdn.discordapp.com/attachments/1234567890/cnqr-logo.png",
    content: "🧪 **WEBHOOK TEST** 🧪\n\nThis is a test message to verify the Discord webhook is working correctly!",
    embeds: [
      {
        title: "🧪 WEBHOOK TEST SUCCESSFUL",
        description: "If you can see this message, the Discord webhook is working perfectly!",
        color: 0x00ff00, // Green color
        fields: [
          {
            name: "🔧 Test Status",
            value: "**SUCCESS**",
            inline: true,
          },
          {
            name: "⏰ Test Time",
            value: new Date().toLocaleString(),
            inline: true,
          },
          {
            name: "🌐 Environment",
            value: "**CNQR Store Demo**",
            inline: true,
          },
        ],
        footer: {
          text: "CNQR Store Webhook Test • All systems operational",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  }

  try {
    console.log("Sending test webhook...")
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testWebhookData),
    })

    console.log("Webhook response status:", response.status)
    console.log("Webhook response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Webhook failed:", errorText)
      return NextResponse.json(
        {
          success: false,
          error: `Webhook failed with status ${response.status}`,
          details: errorText,
        },
        { status: 500 },
      )
    }

    const responseData = await response.text()
    console.log("Webhook success response:", responseData)

    return NextResponse.json({
      success: true,
      message: "Test webhook sent successfully!",
      status: response.status,
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send webhook",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

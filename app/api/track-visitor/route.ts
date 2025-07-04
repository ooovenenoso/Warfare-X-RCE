import { NextResponse } from "next/server"

export async function POST() {
  try {
    const webhookUrl = process.env.VISITOR_WEBHOOK_URL
    if (!webhookUrl) {
      return NextResponse.json({ success: true })
    }

    const visitorData = {
      timestamp: new Date().toISOString(),
      page: "Store Access",
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        embeds: [
          {
            title: "👁️ Store Visitor",
            color: 0x00ff00,
            fields: [
              {
                name: "Time",
                value: visitorData.timestamp,
                inline: true,
              },
              {
                name: "Action",
                value: "Accessed Store",
                inline: true,
              },
            ],
            timestamp: visitorData.timestamp,
          },
        ],
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    // Silent error handling
    return NextResponse.json({ success: true })
  }
}

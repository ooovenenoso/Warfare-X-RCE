interface PurchaseData {
  packageName: string
  amount: number
  currency: string
  customerEmail: string
  serverId: string
  transactionId: string
  timestamp: string
}

interface WebhookData {
  content?: string
  embeds?: Array<{
    title?: string
    description?: string
    color?: number
    fields?: Array<{
      name: string
      value: string
      inline?: boolean
    }>
    timestamp?: string
    footer?: {
      text: string
    }
    thumbnail?: {
      url: string
    }
  }>
  username?: string
  avatar_url?: string
}

export async function sendPurchaseNotification(data: PurchaseData): Promise<boolean> {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.warn("Discord webhook URL not configured")
      return false
    }

    const embed = {
      title: "💰 New Purchase Completed!",
      description: `A new purchase has been successfully completed on CNQR x LOTUS store!`,
      color: 0x00ff00, // Green color for success
      fields: [
        {
          name: "📦 Package",
          value: data.packageName,
          inline: true,
        },
        {
          name: "💵 Amount",
          value: `${data.amount} ${data.currency}`,
          inline: true,
        },
        {
          name: "👤 Customer",
          value: data.customerEmail,
          inline: true,
        },
        {
          name: "🖥️ Server",
          value: data.serverId,
          inline: true,
        },
        {
          name: "🆔 Transaction ID",
          value: `\`${data.transactionId}\``,
          inline: false,
        },
      ],
      timestamp: data.timestamp,
      footer: {
        text: "CNQR x LOTUS Store • Powered by Stripe",
      },
      thumbnail: {
        url: "https://cdn.discordapp.com/emojis/741243929834479616.png", // Money emoji
      },
    }

    const webhookData: WebhookData = {
      username: "CNQR Store Bot",
      avatar_url: "https://cdn.discordapp.com/attachments/123456789/store-logo.png",
      embeds: [embed],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    if (!response.ok) {
      console.error("Discord webhook failed:", response.status, response.statusText)
      return false
    }

    console.log("Discord notification sent successfully")
    return true
  } catch (error) {
    console.error("Error sending Discord notification:", error)
    return false
  }
}

export async function sendSpecialPromotionWebhook(title: string, message: string, color = 0xff6b35): Promise<boolean> {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.warn("Discord webhook URL not configured")
      return false
    }

    const embed = {
      title: `🎉 ${title}`,
      description: message,
      color: color,
      timestamp: new Date().toISOString(),
      footer: {
        text: "CNQR x LOTUS Store",
      },
    }

    const webhookData: WebhookData = {
      username: "CNQR Promotions",
      avatar_url: "https://cdn.discordapp.com/attachments/123456789/promo-logo.png",
      content: `🚨 **${title}** 🚨\n\n${message}`,
      embeds: [embed],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    if (!response.ok) {
      console.error("Discord promotion webhook failed:", response.status, response.statusText)
      return false
    }

    console.log("Discord promotion notification sent successfully")
    return true
  } catch (error) {
    console.error("Error sending special promotion webhook:", error)
    return false
  }
}

export async function sendErrorNotification(
  error: string,
  context: string,
  severity: "low" | "medium" | "high" = "medium",
): Promise<boolean> {
  try {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      return false
    }

    const colors = {
      low: 0xffff00, // Yellow
      medium: 0xff9900, // Orange
      high: 0xff0000, // Red
    }

    const embed = {
      title: `⚠️ System Error - ${severity.toUpperCase()}`,
      description: error,
      color: colors[severity],
      fields: [
        {
          name: "Context",
          value: context,
          inline: false,
        },
        {
          name: "Timestamp",
          value: new Date().toISOString(),
          inline: true,
        },
        {
          name: "Environment",
          value: process.env.NODE_ENV || "unknown",
          inline: true,
        },
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "CNQR x LOTUS Error Monitor",
      },
    }

    const webhookData: WebhookData = {
      username: "CNQR Error Bot",
      embeds: [embed],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    return response.ok
  } catch (error) {
    console.error("Error sending error notification:", error)
    return false
  }
}

// Alias for backward compatibility
export const sendDiscordNotification = sendPurchaseNotification

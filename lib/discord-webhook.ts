interface WebhookTransaction {
  id: string
  discord_id: string
  server_id: string
  amount: number
  credits: number
  status: string
}

interface WebhookPackage {
  name: string
  credits: number
}

export async function sendPurchaseNotification(
  transaction: WebhookTransaction,
  packageData: WebhookPackage,
  username: string,
) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.log("Discord webhook URL not configured")
    return
  }

  // Create motivational messages that encourage more purchases
  const motivationalMessages = [
    "🔥 **ANOTHER LEGEND JUST POWERED UP!** 🔥\n\n*Don't get left behind - join the winners and grab your credits today!*",
    "💎 **SMART MOVE!** Someone just invested in their success! 💎\n\n*Ready to dominate like them? Get your credits now!*",
    "⚡ **BOOM!** Another player just leveled up their game! ⚡\n\n*Your competition is getting stronger - are you ready?*",
    "🚀 **WINNER ALERT!** Someone just secured their advantage! 🚀\n\n*Don't miss out - grab your credits before it's too late!*",
    "👑 **ELITE MOVE!** A true champion just made their purchase! 👑\n\n*Join the elite ranks - get your credits today!*",
  ]

  const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)]

  // Create psychological triggers in the embed
  const embed = {
    title: "💰 NEW CREDIT PURCHASE! 💰",
    description: `**${username}** just boosted their game with **${packageData.credits.toLocaleString()} credits**! 🚀\n\n*Smart players invest in their success!*`,
    color: 0xffd700, // Gold color
    fields: [
      {
        name: "🎮 Smart Player",
        value: `\`${username}\``,
        inline: true,
      },
      {
        name: "📦 Winning Package",
        value: `**${packageData.name}**`,
        inline: true,
      },
      {
        name: "💎 Power Gained",
        value: `**${packageData.credits.toLocaleString()} Credits**`,
        inline: true,
      },
      {
        name: "💵 Investment",
        value: `**$${transaction.amount.toFixed(2)}**`,
        inline: true,
      },
      {
        name: "🎯 Battlefield",
        value: `**${transaction.server_id}**`,
        inline: true,
      },
      {
        name: "⚡ Status",
        value: "**INSTANTLY DELIVERED** ✅",
        inline: true,
      },
    ],
    footer: {
      text: "Ready to dominate? Get your credits now! • CNQR Store - Where Winners Shop",
      icon_url: "https://cdn.discordapp.com/emojis/1234567890.png",
    },
    timestamp: new Date().toISOString(),
    thumbnail: {
      url: "https://media.tenor.com/images/money_rain.gif", // Money/success themed GIF
    },
    image: {
      url: "https://i.imgur.com/your-promotional-banner.png", // Optional promotional banner
    },
  }

  const webhookData = {
    username: "CNQR Store 💎",
    avatar_url: "https://cdn.discordapp.com/attachments/1234567890/cnqr-logo.png",
    embeds: [embed],
    content: `${randomMessage}\n\n**💥 Ready to level up your game? Visit our store now! 💥**\n\n*Limited time offers available - don't miss out!*`,
  }

  try {
    const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookData),
    })

    if (!response.ok) {
      console.error("Failed to send Discord webhook:", response.statusText)
    } else {
      console.log("Discord webhook sent successfully")
    }
  } catch (error) {
    console.error("Error sending Discord webhook:", error)
  }
}

// Alternative webhook for special events/promotions
export async function sendSpecialPromotionWebhook(
  transaction: WebhookTransaction,
  packageData: WebhookPackage,
  username: string,
  promotionType: "flash_sale" | "high_value" | "first_purchase" = "high_value",
) {
  if (!process.env.DISCORD_WEBHOOK_URL) return

  const promotionMessages = {
    flash_sale: "🔥 **FLASH SALE VICTIM!** Someone couldn't resist the deal! 🔥",
    high_value: "💎 **BIG SPENDER ALERT!** A true champion just made a power move! 💎",
    first_purchase: "🎉 **WELCOME TO THE WINNERS CIRCLE!** First purchase completed! 🎉",
  }

  const embed = {
    title: promotionMessages[promotionType],
    description: `**${username}** just secured **${packageData.credits.toLocaleString()} credits** with the **${packageData.name}**!\n\n*This is how legends are made!* 🏆`,
    color: promotionType === "flash_sale" ? 0xff6b6b : promotionType === "high_value" ? 0x9b59b6 : 0x2ecc71,
    fields: [
      {
        name: "🏆 Champion",
        value: `**${username}**`,
        inline: true,
      },
      {
        name: "💰 Smart Investment",
        value: `**$${transaction.amount.toFixed(2)}**`,
        inline: true,
      },
      {
        name: "⚡ Instant Power",
        value: `**${packageData.credits.toLocaleString()} Credits**`,
        inline: true,
      },
    ],
    footer: {
      text: "Join the winners - Get your credits now! • CNQR Store",
    },
    timestamp: new Date().toISOString(),
  }

  const webhookData = {
    username: "CNQR Elite Store 👑",
    avatar_url: "https://cdn.discordapp.com/attachments/1234567890/cnqr-premium-logo.png",
    embeds: [embed],
    content: `🚨 **FOMO ALERT!** 🚨\n\n*While you're reading this, others are getting ahead!*\n\n**Don't be the one left behind - secure your advantage NOW!** 💪`,
  }

  try {
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookData),
    })
  } catch (error) {
    console.error("Error sending special promotion webhook:", error)
  }
}

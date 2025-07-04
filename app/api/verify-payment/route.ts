import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createAdminClient, secureDbOperation } from "@/lib/supabase"
import { sanitizeForLogs } from "@/lib/encryption"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

// Function to send Discord webhook notification
async function sendDiscordWebhook(transaction: any, packageData: any, username: string) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    return
  }

  const embed = {
    title: "💰 NEW CREDIT PURCHASE! 💰",
    description: `**${username}** just boosted their game with **${packageData.credits.toLocaleString()} credits**! 🚀`,
    color: 0xffd700,
    fields: [
      {
        name: "🎮 Player",
        value: `\`${username}\``,
        inline: true,
      },
      {
        name: "📦 Package",
        value: `**${packageData.name}**`,
        inline: true,
      },
      {
        name: "💎 Credits",
        value: `**${packageData.credits.toLocaleString()}**`,
        inline: true,
      },
      {
        name: "💵 Amount",
        value: `**$${transaction.final_amount.toFixed(2)}**`,
        inline: true,
      },
      {
        name: "🎯 Server",
        value: `**${transaction.server_id}**`,
        inline: true,
      },
      {
        name: "⚡ Status",
        value: "**DELIVERED**",
        inline: true,
      },
    ],
    footer: {
      text: "Ready to dominate? Get your credits now! • Lotus Dash Store",
      icon_url: "https://cdn.discordapp.com/attachments/1234567890/logo.png",
    },
    timestamp: new Date().toISOString(),
    thumbnail: {
      url: "https://cdn.discordapp.com/emojis/1234567890.gif",
    },
  }

  const webhookData = {
    username: "Lotus Dash Store 💎",
    avatar_url: "https://cdn.discordapp.com/attachments/1234567890/lotus-logo.png",
    embeds: [embed],
    content: `🔥 **ANOTHER LEGEND JUST POWERED UP!** 🔥\n\n*Don't get left behind - join the winners and grab your credits today!*\n\n**💥 Ready to level up your game? Visit our store now! 💥**`,
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
      // Silent error handling
    }
  } catch (error) {
    // Silent error handling
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === "paid") {
      const supabase = createAdminClient()

      // Update transaction status with secure operation
      await secureDbOperation(async () => {
        const { error } = await supabase
          .from("transactions")
          .update({
            status: "completed",
            stripe_payment_intent_id: session.payment_intent as string,
            completed_at: new Date().toISOString(),
          })
          .eq("stripe_session_id", sessionId)

        if (error) throw error
      }, "update_transaction_status")

      // Get the transaction from database
      const { data: transaction, error: transactionError } = await secureDbOperation(
        () => supabase.from("transactions").select("*").eq("stripe_session_id", sessionId).single(),
        "fetch_transaction",
      )

      if (transactionError || !transaction) {
        return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
      }

      // If the stored discord_id is missing, try to recover it from session metadata
      if (!transaction.discord_id || transaction.discord_id === "unknown") {
        const metaDiscord = (session.metadata as any)?.discordId
        if (metaDiscord) {
          transaction.discord_id = metaDiscord
          await secureDbOperation(
            () => supabase.from("transactions").update({ discord_id: metaDiscord }).eq("id", transaction.id),
            "update_discord_id",
          )
        }
      }

      // Get package details
      const { data: packageData } = await secureDbOperation(
        () => supabase.from("credit_packages").select("*").eq("id", transaction.package_id).single(),
        "fetch_package_data",
      )

      // Add credits to user's balance in the game database
      const { data: linkedAccount } = await secureDbOperation(
        () =>
          supabase
            .from("UsernameLinks")
            .select("username")
            .eq("discord_id", transaction.discord_id)
            .eq("server_id", transaction.server_id)
            .single(),
        "fetch_linked_account",
      )

      if (linkedAccount) {
        // Get current balance
        const { data: balanceData } = await secureDbOperation(
          () =>
            supabase
              .from("EconomyBalance")
              .select("*")
              .eq("server_id", transaction.server_id)
              .eq("player_name", linkedAccount.username)
              .single(),
          "fetch_balance",
        )

        if (balanceData) {
          // Update balance
          const newBalance = balanceData.balance + transaction.credits_purchased
          await secureDbOperation(
            () =>
              supabase
                .from("EconomyBalance")
                .update({
                  balance: newBalance,
                  total_earned: balanceData.total_earned + transaction.credits_purchased,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", balanceData.id),
            "update_balance",
          )
        } else {
          // Create new balance record
          await secureDbOperation(
            () =>
              supabase.from("EconomyBalance").insert({
                server_id: transaction.server_id,
                player_name: linkedAccount.username,
                balance: transaction.credits_purchased,
                total_earned: transaction.credits_purchased,
                total_spent: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }),
            "create_balance",
          )
        }

        // Log transaction in EconomyTransactions
        await secureDbOperation(
          () =>
            supabase.from("EconomyTransactions").insert({
              server_id: transaction.server_id,
              sender: "Store",
              receiver: linkedAccount.username,
              amount: transaction.credits_purchased,
              transaction_type: "store_purchase",
              description: `Credits purchased from store - Package: ${packageData?.name || "Unknown"}`,
              timestamp: new Date().toISOString(),
            }),
          "log_transaction",
        )

        // Send Discord webhook notification
        if (packageData) {
          await sendDiscordWebhook(transaction, packageData, linkedAccount.username)
        }
      }

      return NextResponse.json({
        success: true,
        paymentStatus: session.payment_status,
        credits: transaction.credits_purchased,
        server: transaction.server_id,
      })
    }

    return NextResponse.json({
      success: false,
      paymentStatus: session.payment_status,
    })
  } catch (error) {
    // Sanitized error logging
    const sanitizedError = sanitizeForLogs(error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}

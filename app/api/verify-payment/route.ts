import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Function to send Discord webhook notification
async function sendDiscordWebhook(transaction: any, packageData: any, username: string) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    return
  }

  const embed = {
    title: "💰 NEW CREDIT PURCHASE! 💰",
    description: `**${username}** just boosted their game with **${packageData.credits.toLocaleString()} credits**! 🚀`,
    color: 0xffd700, // Gold color
    fields: [
      { name: "🎮 Player", value: `\`${username}\``, inline: true },
      { name: "📦 Package", value: `**${packageData.name}**`, inline: true },
      { name: "💎 Credits", value: `**${packageData.credits.toLocaleString()}**`, inline: true },
      { name: "💵 Amount", value: `**$${transaction.final_amount.toFixed(2)}**`, inline: true },
      { name: "🎯 Server", value: `**${transaction.server_id}**`, inline: true },
      { name: "⚡ Status", value: "**DELIVERED**", inline: true },
    ],
    footer: {
      text: "Ready to dominate? Get your credits now! • CNQR Store",
      icon_url: "https://cdn.discordapp.com/attachments/1234567890/logo.png",
    },
    timestamp: new Date().toISOString(),
    thumbnail: { url: "https://cdn.discordapp.com/emojis/1234567890.gif" },
  }

  const webhookData = {
    username: "CNQR Store 💎",
    avatar_url: "https://cdn.discordapp.com/attachments/1234567890/cnqr-logo.png",
    embeds: [embed],
    content: `🔥 **ANOTHER LEGEND JUST POWERED UP!** 🔥\n\n*Don't get left behind - join the winners and grab your credits today!*\n\n**💥 Ready to level up your game? Visit our store now! 💥**`,
  }

  try {
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookData),
    })
  } catch (error) {
    // Silent fail
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    if (!process.env.STRIPE_SECRET_KEY) {
      // Demo mode
      const demoTransaction = {
        id: "demo-transaction-" + Date.now(),
        discord_id: "907231041167716352",
        server_id: "server1",
        final_amount: 19.99,
        credits: 2500,
        status: "completed",
      }
      const demoPackage = { name: "Pro Pack", credits: 2500 }
      await sendDiscordWebhook(demoTransaction, demoPackage, "ooovenenoso")
      return NextResponse.json({ success: true, credits: demoTransaction.credits, server: demoTransaction.server_id })
    }

    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const { data: existingTransaction } = await supabase
      .from("store_transactions")
      .select("id, credits_purchased, server_id")
      .eq("stripe_session_id", sessionId)
      .eq("status", "completed")
      .single()

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        credits: existingTransaction.credits_purchased,
        server: existingTransaction.server_id,
      })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 })
    }

    const { data: transaction, error: transactionError } = await supabase
      .from("store_transactions")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single()

    if (transactionError || !transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    if (!transaction.discord_id || transaction.discord_id === "unknown") {
      const metaDiscord = (session.metadata as any)?.discordId
      if (metaDiscord) {
        transaction.discord_id = metaDiscord
        await supabase.from("store_transactions").update({ discord_id: metaDiscord }).eq("id", transaction.id)
      }
    }

    const { data: packageData } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("id", transaction.package_id)
      .single()
    const newFinalAmount = (session.amount_total || 0) / 100
    await supabase
      .from("store_transactions")
      .update({ status: "completed", completed_at: new Date().toISOString(), final_amount: newFinalAmount })
      .eq("id", transaction.id)
    transaction.final_amount = newFinalAmount

    const { data: linkedAccount } = await supabase
      .from("UsernameLinks")
      .select("username")
      .eq("discord_id", transaction.discord_id)
      .eq("server_id", transaction.server_id)
      .single()

    if (linkedAccount) {
      const { data: balanceData } = await supabase
        .from("EconomyBalance")
        .select("*")
        .eq("server_id", transaction.server_id)
        .eq("player_name", linkedAccount.username)
        .single()
      if (balanceData) {
        const newBalance = balanceData.balance + transaction.credits_purchased
        await supabase
          .from("EconomyBalance")
          .update({
            balance: newBalance,
            total_earned: balanceData.total_earned + transaction.credits_purchased,
            updated_at: new Date().toISOString(),
          })
          .eq("id", balanceData.id)
      } else {
        await supabase.from("EconomyBalance").insert({
          server_id: transaction.server_id,
          player_name: linkedAccount.username,
          balance: transaction.credits_purchased,
          total_earned: transaction.credits_purchased,
          total_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
      await supabase.from("EconomyTransactions").insert({
        server_id: transaction.server_id,
        sender: "Store",
        receiver: linkedAccount.username,
        amount: transaction.credits_purchased,
        transaction_type: "store_purchase",
        description: `Credits purchased from store - Package: ${packageData?.name || "Unknown"}`,
        timestamp: new Date().toISOString(),
      })
      if (packageData) {
        await sendDiscordWebhook(transaction, packageData, linkedAccount.username)
      }
    }

    return NextResponse.json({
      success: true,
      credits: transaction.credits_purchased,
      server: transaction.server_id,
      amount: newFinalAmount,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to verify payment" }, { status: 500 })
  }
}

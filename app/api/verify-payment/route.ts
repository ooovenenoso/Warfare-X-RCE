import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Function to send Discord webhook notification
async function sendDiscordWebhook(transaction: any, packageData: any, username: string) {
  if (!process.env.DISCORD_WEBHOOK_URL) {
    console.log("Discord webhook URL not configured")
    return
  }

  const embed = {
    title: "💰 NEW CREDIT PURCHASE! 💰",
    description: `**${username}** just boosted their game with **${packageData.credits.toLocaleString()} credits**! 🚀`,
    color: 0xffd700, // Gold color
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
      text: "Ready to dominate? Get your credits now! • CNQR Store",
      icon_url: "https://cdn.discordapp.com/attachments/1234567890/logo.png",
    },
    timestamp: new Date().toISOString(),
    thumbnail: {
      url: "https://cdn.discordapp.com/emojis/1234567890.gif",
    },
  }

  const webhookData = {
    username: "CNQR Store 💎",
    avatar_url: "https://cdn.discordapp.com/attachments/1234567890/cnqr-logo.png",
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
      console.error("Failed to send Discord webhook:", response.statusText)
    } else {
      console.log("✅ Discord webhook sent successfully")
    }
  } catch (error) {
    console.error("❌ Error sending Discord webhook:", error)
  }
}

export async function POST(request: Request) {
  try {
    console.log("🔄 Starting payment verification...")

    const body = await request.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    console.log("🔍 Verifying session:", sessionId)

    // Create Supabase client for this request with service role key
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn("⚠️ Stripe not configured - using demo mode")

      // For demo mode, we'll simulate a successful purchase
      const demoTransaction = {
        id: "demo-transaction-" + Date.now(),
        discord_id: "907231041167716352", // Admin ID for demo
        server_id: "server1",
        amount: 19.99,
        credits: 2500,
        status: "completed",
      }

      const demoPackage = {
        name: "Pro Pack",
        credits: 2500,
      }

      // Send Discord webhook for demo
      await sendDiscordWebhook(demoTransaction, demoPackage, "ooovenenoso")

      return NextResponse.json({
        success: true,
        credits: demoTransaction.credits,
        server: demoTransaction.server_id,
      })
    }

    // Dynamically import Stripe only if the key is available
    const Stripe = (await import("stripe")).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Check if this session has already been processed
    const { data: existingTransaction } = await supabase
      .from("store_transactions")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .eq("status", "completed")
      .single()

    if (existingTransaction) {
      console.log("✅ Transaction already processed:", existingTransaction.id)
      return NextResponse.json({
        success: true,
        credits: existingTransaction.credits,
        server: existingTransaction.server_id,
      })
    }

    // Verify the session with Stripe
    console.log("🔍 Retrieving Stripe session...")
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    })

    console.log("💳 Stripe session status:", session.payment_status)
    console.log("💰 Session amount:", session.amount_total)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ success: false, error: "Payment not completed" }, { status: 400 })
    }

    // Get the transaction from our database
    const { data: transaction, error: transactionError } = await supabase
      .from("store_transactions")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single()

    if (transactionError || !transaction) {
      console.error("❌ Transaction not found:", transactionError)
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 })
    }

    console.log("📦 Found transaction:", transaction.id)

    // Get package details
    const { data: packageData } = await supabase
      .from("credit_packages")
      .select("*")
      .eq("id", transaction.package_id)
      .single()

    console.log("📦 Package data:", packageData)

    // Update transaction status to completed
    const newFinalAmount = (session.amount_total || 0) / 100
    const { error: updateError } = await supabase
      .from("store_transactions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        // Update final amount from Stripe session to ensure it's correct
        final_amount: newFinalAmount,
      })
      .eq("id", transaction.id)

    // reflect updated amount locally
    transaction.final_amount = newFinalAmount

    if (updateError) {
      console.error("❌ Error updating transaction:", updateError)
    } else {
      console.log("✅ Transaction updated to completed")
    }

    // Add credits to user's balance in the game database
    const { data: linkedAccount } = await supabase
      .from("UsernameLinks")
      .select("username")
      .eq("discord_id", transaction.discord_id)
      .eq("server_id", transaction.server_id)
      .single()

    if (linkedAccount) {
      console.log("👤 Found linked account:", linkedAccount.username)

      // Get current balance
      const { data: balanceData } = await supabase
        .from("EconomyBalance")
        .select("*")
        .eq("server_id", transaction.server_id)
        .eq("player_name", linkedAccount.username)
        .single()

      if (balanceData) {
        // Update balance
        const newBalance = balanceData.balance + transaction.credits_purchased
        await supabase
          .from("EconomyBalance")
          .update({
            balance: newBalance,
            total_earned: balanceData.total_earned + transaction.credits_purchased,
            updated_at: new Date().toISOString(),
          })
          .eq("id", balanceData.id)

        console.log(`💰 Updated balance: ${balanceData.balance} + ${transaction.credits_purchased} = ${newBalance}`)
      } else {
        // Create new balance record
        await supabase.from("EconomyBalance").insert({
          server_id: transaction.server_id,
          player_name: linkedAccount.username,
          balance: transaction.credits_purchased,
          total_earned: transaction.credits_purchased,
          total_spent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        console.log(`💰 Created new balance: ${transaction.credits_purchased}`)
      }

      // Log transaction in EconomyTransactions
      await supabase.from("EconomyTransactions").insert({
        server_id: transaction.server_id,
        sender: "Store",
        receiver: linkedAccount.username,
        amount: transaction.credits_purchased,
        transaction_type: "store_purchase",
        description: `Credits purchased from store - Package: ${packageData?.name || "Unknown"}`,
        timestamp: new Date().toISOString(),
      })

      // Send Discord webhook notification
      if (packageData) {
        console.log("📢 Sending Discord webhook...")
        await sendDiscordWebhook(transaction, packageData, linkedAccount.username)
      }
    } else {
      console.warn("⚠️ No linked account found for user:", transaction.discord_id)
    }

    console.log("✅ Payment verification completed successfully")

    return NextResponse.json({
      success: true,
      credits: transaction.credits_purchased,
      server: transaction.server_id,
      amount: newFinalAmount,
    })
  } catch (error) {
    console.error("💥 Payment verification error:", error)
    return NextResponse.json({ success: false, error: "Failed to verify payment" }, { status: 500 })
  }
}

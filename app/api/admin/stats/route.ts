import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    // Get total revenue from completed transactions
    const { data: revenueData } = await supabase
      .from("store_transactions")
      .select("final_amount")
      .eq("status", "completed")

    const totalRevenue = revenueData?.reduce((sum, transaction) => sum + Number(transaction.final_amount), 0) || 0

    // Get total transactions count
    const { count: totalTransactions } = await supabase
      .from("store_transactions")
      .select("*", { count: "exact" })
      .eq("status", "completed")

    // Get unique users count from transactions
    const { data: uniqueUsers } = await supabase
      .from("store_transactions")
      .select("discord_id")
      .eq("status", "completed")

    const activeUsers = new Set(uniqueUsers?.map((u) => u.discord_id)).size

    // Calculate conversion rate (completed vs total transactions)
    const { count: totalAttempts } = await supabase.from("store_transactions").select("*", { count: "exact" })

    const conversionRate = totalAttempts ? ((totalTransactions || 0) / totalAttempts) * 100 : 0

    // Get monthly revenue data for chart
    const { data: monthlyData } = await supabase
      .from("store_transactions")
      .select("final_amount, created_at")
      .eq("status", "completed")
      .gte("created_at", new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 6 months

    const monthlyRevenue =
      monthlyData?.reduce(
        (acc, transaction) => {
          const month = new Date(transaction.created_at).toLocaleString("default", { month: "short" })
          acc[month] = (acc[month] || 0) + Number(transaction.final_amount)
          return acc
        },
        {} as Record<string, number>,
      ) || {}

    const chartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue),
    }))

    return NextResponse.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalTransactions: totalTransactions || 0,
      activeUsers,
      conversionRate: Math.round(conversionRate * 10) / 10,
      chartData,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}

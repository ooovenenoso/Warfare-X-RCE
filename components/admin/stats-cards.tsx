"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, CreditCard, TrendingUp } from "lucide-react"

interface AdminStats {
  totalRevenue: number
  totalTransactions: number
  activeUsers: number
  conversionRate: number
}

export function StatsCards() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      // In a real app, this would be an API call to a secure endpoint
      // For now, we'll use mock data
      setStats({
        totalRevenue: 15420.5,
        totalTransactions: 342,
        activeUsers: 1250,
        conversionRate: 12.5,
      })
      setLoading(false)
    }
    fetchStats()
  }, [])

  const statItems = [
    {
      title: "Total Revenue",
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : "...",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500",
    },
    {
      title: "Transactions",
      value: stats ? stats.totalTransactions.toLocaleString() : "...",
      change: "+8.2%",
      icon: CreditCard,
      color: "text-blue-400",
      bgColor: "bg-blue-500",
    },
    {
      title: "Active Users",
      value: stats ? stats.activeUsers.toLocaleString() : "...",
      change: "+15.3%",
      icon: Users,
      color: "text-purple-400",
      bgColor: "bg-purple-500",
    },
    {
      title: "Conversion Rate",
      value: stats ? `${stats.conversionRate}%` : "...",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
      {statItems.map((item) => (
        <Card key={item.title} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-300">{item.title}</CardTitle>
            <div className={`w-8 h-8 ${item.bgColor} bg-opacity-20 rounded-lg flex items-center justify-center`}>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-white">{item.value}</div>
            <p className={`text-xs ${item.color} flex items-center gap-1`}>
              <TrendingUp className="w-3 h-3" />
              {item.change} from last month
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

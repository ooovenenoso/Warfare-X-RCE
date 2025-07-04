"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { Loader } from "@/components/loader"

interface ChartData {
  month: string
  revenue: number
}

export function RevenueChart() {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/stats")
        if (response.ok) {
          const stats = await response.json()
          setData(stats.chartData || [])
        }
      } catch (error) {
        console.error("Error fetching chart data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Suppress ResizeObserver errors
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.message.includes("ResizeObserver loop completed with undelivered notifications")) {
        e.stopImmediatePropagation()
      }
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  return (
    <Card className="bg-gray-900 border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="text-white">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader size="sm" text="Loading chart data..." />
          </div>
        ) : data.length > 0 ? (
          <div style={{ width: "100%", height: "300px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#ffffff" }}
                  itemStyle={{ color: "#ffffff" }}
                />
                <Legend wrapperStyle={{ fontSize: "14px", color: "#ffffff" }} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">No revenue data available yet</div>
        )}
      </CardContent>
    </Card>
  )
}

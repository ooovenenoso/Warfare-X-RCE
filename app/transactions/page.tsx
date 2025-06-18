"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  package_id: string
  amount: number
  credits: number
  server_id: string
  status: "pending" | "completed" | "failed" | "refunded"
  created_at: string
  completed_at?: string
  credit_packages?: {
    name: string
    credits: number
  }
}

export default function TransactionsPage() {
  const { user, loading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user) {
      fetchTransactions()
    }
  }, [user, authLoading])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/user/transactions")

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()
      const mapped = (data.transactions || []).map((t: any) => ({
        id: t.id,
        package_id: t.package_id,
        amount: t.final_amount,
        credits: t.credits_purchased,
        server_id: t.server_id,
        status: t.status,
        created_at: t.created_at,
        completed_at: t.completed_at,
        credit_packages: t.credit_packages,
      }))
      setTransactions(mapped)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setError("Failed to load transaction history")
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "refunded":
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600"
      case "pending":
        return "bg-yellow-600"
      case "failed":
        return "bg-red-600"
      case "refunded":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading transactions...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="max-w-md w-full bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardContent className="text-center p-8">
            <p className="text-white mb-4">Please sign in to view your transaction history</p>
            <Link href="/">
              <Button className="bg-purple-600 hover:bg-purple-700">Go to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
            <p className="text-gray-300">View all your credit purchases and transactions</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Button>
          </Link>
        </div>

        {error && (
          <Card className="mb-6 bg-red-900/20 border-red-500/30">
            <CardContent className="p-4">
              <p className="text-red-300">{error}</p>
              <Button onClick={fetchTransactions} className="mt-2 bg-red-600 hover:bg-red-700" size="sm">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {transactions.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="text-center p-8">
              <p className="text-gray-300 mb-4">No transactions found</p>
              <Link href="/">
                <Button className="bg-purple-600 hover:bg-purple-700">Make Your First Purchase</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(transaction.status)}
                      <div>
                        <h3 className="text-white font-semibold">
                          {transaction.credit_packages?.name || "Credit Package"}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {new Date(transaction.created_at).toLocaleDateString()} at{" "}
                          {new Date(transaction.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(transaction.status)} text-white`}>
                      {transaction.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Credits</p>
                      <p className="text-white font-semibold">{transaction.credits.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Amount</p>
                      <p className="text-white font-semibold">${transaction.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Server</p>
                      <p className="text-white font-semibold">{transaction.server_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Transaction ID</p>
                      <p className="text-white font-mono text-xs">{transaction.id.slice(0, 8)}...</p>
                    </div>
                  </div>

                  {transaction.completed_at && (
                    <div className="mt-4 pt-4 border-t border-slate-600">
                      <p className="text-green-400 text-sm">
                        ✅ Completed on {new Date(transaction.completed_at).toLocaleDateString()} at{" "}
                        {new Date(transaction.completed_at).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

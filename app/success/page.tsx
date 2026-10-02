"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Zap, ArrowRight, AlertCircle } from "lucide-react"
import Link from "next/link"

interface TransactionResult {
  success: boolean
  credits: number
  server: string
  amount: number
  delivered?: boolean
  pending?: boolean
  error?: string
}

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [result, setResult] = useState<TransactionResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      verifyPayment()
    } else {
      setLoading(false)
    }
  }, [sessionId])

  const verifyPayment = async () => {
    try {
      console.log("🔄 Verifying payment for session:", sessionId)

      const response = await fetch("/api/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()
      console.log("📊 Payment verification result:", data)

      setResult(data)
    } catch (error) {
      console.error("❌ Error verifying payment:", error)
      setResult({
        success: false,
        credits: 0,
        server: "",
        amount: 0,
        error: "Failed to verify payment",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full sigma-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-600">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-white text-2xl">Invalid Session</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">No payment session found.</p>
            <Link href="/store">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Return to Store
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!result?.success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full sigma-card">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-600">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-white text-2xl">{result?.pending ? "Payment Processing" : "Payment Failed"}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">{result?.pending ? "Stripe is still confirming your payment. Refresh this page in a moment." : result?.error || "Something went wrong with your payment."}</p>
            <div className="flex flex-col space-y-3">
              <Link href="/store">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Return to store
                </Button>
              </Link>
              <Button asChild variant="outline" className="w-full border-white/15 text-white hover:bg-white/10">
                <a href="https://discord.gg/playcnqr" target="_blank" rel="noopener noreferrer">Open community Discord</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full sigma-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-600">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-white text-2xl">Payment confirmed</CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-white font-semibold">Credits in this order</span>
            </div>
            <div className="text-3xl font-bold text-primary">{result.credits.toLocaleString()}</div>
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            <p>Session ID: {sessionId.slice(0, 20)}...</p>
            <p>Amount: ${result.amount.toFixed(2)}</p>
            <p>Server: {result.server}</p>
            <p>Status: {result.delivered ? "✅ Delivered" : "⏳ Payment confirmed; delivery pending"}</p>
          </div>

          <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-sm">
              {result.delivered ? "🎉 Your credits have been delivered to your account." : "Your payment is confirmed. The store is waiting for your verified game-account link before delivering credits."}
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Link href="/store">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Buy more credits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="outline" className="w-full border-white/15 text-white hover:bg-white/10">
                View Transaction History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

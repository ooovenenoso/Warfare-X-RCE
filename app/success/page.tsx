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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800/50 border-slate-700 backdrop-blur-sm">
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
            <Link href="/">
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-600">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-white text-2xl">Payment Failed</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-300">{result?.error || "Something went wrong with your payment."}</p>
            <div className="flex flex-col space-y-3">
              <Link href="/">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  Try Again
                </Button>
              </Link>
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-600">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-white text-2xl">Payment Successful!</CardTitle>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="h-5 w-5 text-purple-400" />
              <span className="text-white font-semibold">Credits Purchased</span>
            </div>
            <div className="text-3xl font-bold text-purple-400">{result.credits.toLocaleString()}</div>
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            <p>Session ID: {sessionId.slice(0, 20)}...</p>
            <p>Amount: ${result.amount.toFixed(2)}</p>
            <p>Server: {result.server}</p>
            <p>Status: ✅ Delivered</p>
          </div>

          <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-300 text-sm">
              🎉 Your credits have been instantly delivered to your account! You can start using them right away
              in-game.
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                Buy More Credits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/transactions">
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                View Transaction History
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

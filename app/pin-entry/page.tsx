"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Timer } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function PinEntryPage() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const router = useRouter()

  // Countdown to July 4th, 2025
  useEffect(() => {
    const targetDate = new Date("2025-07-04T00:00:00").getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verify-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pin }),
      })

      if (response.ok) {
        // Set cookie and redirect
        document.cookie = "pin_verified=true; path=/; max-age=86400" // 24 hours
        router.push("/")
      } else {
        setError("Invalid PIN. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 grid-pattern opacity-20"></div>
      <div className="absolute inset-0 noise-texture"></div>

      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      <div className="absolute top-40 right-20 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
      <div className="absolute bottom-40 left-20 w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 right-10 w-1 h-1 bg-yellow-400 rounded-full animate-ping delay-500"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/warfare-logo.png"
              alt="Warfare Logo"
              width={120}
              height={120}
              className="w-24 h-24 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            WARFARE
          </h1>
        </div>

        {/* Countdown */}
        <Card className="mb-6 bg-gray-800 border-yellow-400/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-yellow-400">
              <Timer className="w-5 h-5" />
              Launch Countdown
            </CardTitle>
            <CardDescription className="text-gray-300">Time until July 4th, 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{timeLeft.days}</div>
                <div className="text-xs text-gray-400">DAYS</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{timeLeft.hours}</div>
                <div className="text-xs text-gray-400">HOURS</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{timeLeft.minutes}</div>
                <div className="text-xs text-gray-400">MINS</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-400">{timeLeft.seconds}</div>
                <div className="text-xs text-gray-400">SECS</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIN Entry */}
        <Card className="bg-gray-800 border-yellow-400/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-white">
              <Lock className="w-5 h-5" />
              Access Required
            </CardTitle>
            <CardDescription className="text-gray-300">Enter your PIN to access the store</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-400"
                maxLength={10}
              />
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <Button
                type="submit"
                disabled={loading || !pin}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
              >
                {loading ? "Verifying..." : "Enter Store"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-400 text-sm mt-4">Don't have access? Contact an administrator.</p>
      </div>
    </div>
  )
}

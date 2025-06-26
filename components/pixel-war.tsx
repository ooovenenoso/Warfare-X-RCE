"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Timer, Users } from "lucide-react"

interface PixelData {
  x: number
  y: number
  color: string
  choice: string
}

interface GameStats {
  welcome_kit: number
  builder_kit: number
  total_pixels: number
}

const GRID_SIZE = 50 // 50x50 grid
const COOLDOWN_TIME = 30 // 30 seconds cooldown
const REFRESH_INTERVAL = 2000 // 2 seconds for live updates

export default function PixelWar() {
  const [pixels, setPixels] = useState<PixelData[]>([])
  const [selectedChoice, setSelectedChoice] = useState<"welcome_kit" | "builder_kit">("welcome_kit")
  const [cooldownTime, setCooldownTime] = useState(0)
  const [stats, setStats] = useState<GameStats>({ welcome_kit: 0, builder_kit: 0, total_pixels: 0 })
  const [loading, setLoading] = useState(false)

  const colors = {
    welcome_kit: "#3B82F6", // Blue
    builder_kit: "#EF4444", // Red
  }

  const choiceLabels = {
    welcome_kit: "FullPvPKit",
    builder_kit: "FullBuilderKit",
  }

  // Load initial pixel data
  useEffect(() => {
    loadPixels()
    loadStats()
    checkCooldown()
  }, [])

  // Live updates - refresh every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadPixels()
      loadStats()
    }, REFRESH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => setCooldownTime(cooldownTime - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownTime])

  const loadPixels = async () => {
    try {
      const response = await fetch("/api/pixel-war/pixels")
      if (response.ok) {
        const data = await response.json()
        setPixels(data)
      }
    } catch (error) {
      console.error("Failed to load pixels:", error)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch("/api/pixel-war/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const checkCooldown = async () => {
    try {
      const response = await fetch("/api/pixel-war/cooldown")
      if (response.ok) {
        const data = await response.json()
        if (data.cooldown > 0) {
          setCooldownTime(data.cooldown)
        }
      }
    } catch (error) {
      console.error("Failed to check cooldown:", error)
    }
  }

  const placePixel = async (x: number, y: number) => {
    if (cooldownTime > 0 || loading) return

    setLoading(true)
    try {
      const response = await fetch("/api/pixel-war/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          x,
          y,
          choice: selectedChoice,
          color: colors[selectedChoice],
        }),
      })

      if (response.ok) {
        // Immediate update after placing pixel
        await loadPixels()
        await loadStats()
        setCooldownTime(COOLDOWN_TIME)
      } else {
        const error = await response.json()
        console.error("Failed to place pixel:", error.message)
      }
    } catch (error) {
      console.error("Failed to place pixel:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPixelColor = (x: number, y: number) => {
    const pixel = pixels.find((p) => p.x === x && p.y === y)
    return pixel ? pixel.color : "#374151" // Default gray
  }

  const winningChoice =
    stats.welcome_kit > stats.builder_kit
      ? "welcome_kit"
      : stats.builder_kit > stats.welcome_kit
        ? "builder_kit"
        : "tie"

  return (
    <Card className="bg-gray-800 border-yellow-400/20 w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-yellow-400">
          <Palette className="w-5 h-5" />
          Choose Your Welcome Kit!
        </CardTitle>
        <p className="text-gray-300 text-sm">Vote for your preferred kit! Updates live every 2 seconds.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Choice Selection */}
        <div className="flex gap-2 justify-center mb-4">
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedChoice === "welcome_kit"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-blue-400 border border-blue-600 hover:bg-blue-600/10"
            }`}
            onClick={() => setSelectedChoice("welcome_kit")}
          >
            ⚔️ FullPvPKit
          </button>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedChoice === "builder_kit"
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-red-400 border border-red-600 hover:bg-red-600/10"
            }`}
            onClick={() => setSelectedChoice("builder_kit")}
          >
            🏗️ FullBuilderKit
          </button>
        </div>

        {/* Stats with live indicator */}
        <div className="flex justify-center gap-4 text-sm">
          <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
            <Users className="w-3 h-3 mr-1" />
            FullPvPKit: {stats.welcome_kit}
          </Badge>
          <Badge variant="secondary" className="bg-red-600/20 text-red-400">
            <Users className="w-3 h-3 mr-1" />
            FullBuilderKit: {stats.builder_kit}
          </Badge>
          <Badge variant="secondary" className="bg-green-600/20 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></div>
            LIVE
          </Badge>
        </div>

        {/* Winner Display */}
        {winningChoice !== "tie" && (
          <div className="text-center">
            <Badge
              variant="secondary"
              className={`${winningChoice === "welcome_kit" ? "bg-blue-600/20 text-blue-400" : "bg-red-600/20 text-red-400"}`}
            >
              🏆 {choiceLabels[winningChoice as keyof typeof choiceLabels]} is winning!
            </Badge>
          </div>
        )}

        {/* Cooldown Timer */}
        {cooldownTime > 0 && (
          <div className="text-center">
            <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
              <Timer className="w-3 h-3 mr-1" />
              Next pixel in: {cooldownTime}s
            </Badge>
          </div>
        )}

        {/* Pixel Grid */}
        <div className="flex justify-center">
          <div
            className="grid gap-0 border border-gray-600 rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: "400px",
              height: "400px",
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
              const x = i % GRID_SIZE
              const y = Math.floor(i / GRID_SIZE)
              const pixelColor = getPixelColor(x, y)

              return (
                <button
                  key={`${x}-${y}`}
                  className="w-2 h-2 border-0 hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: pixelColor }}
                  onClick={() => placePixel(x, y)}
                  disabled={cooldownTime > 0 || loading}
                  title={`Place ${choiceLabels[selectedChoice]} pixel at (${x}, ${y})`}
                />
              )
            })}
          </div>
        </div>

        <div className="text-center space-y-1">
          <p className="text-xs text-gray-400">
            The winning kit can be redeemed with an emote in-game when the countdown ends!
          </p>
          <p className="text-xs text-gray-500">
            Use <code className="bg-gray-700 px-1 rounded">/redeem</code> emote after July 4th, 2025
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

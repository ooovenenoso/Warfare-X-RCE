"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function PinGuard({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkPinVerification = () => {
      const verified = sessionStorage.getItem("pin_verified")
      if (verified === "true") {
        setIsVerified(true)
      } else {
        // Check if ACCESS_PIN is configured
        fetch("/api/verify-pin", { method: "GET" })
          .then((response) => {
            if (response.status === 404) {
              // PIN system not configured, allow access
              setIsVerified(true)
            } else {
              router.push("/pin-entry")
            }
          })
          .catch(() => {
            // Error checking, allow access
            setIsVerified(true)
          })
      }
      setIsLoading(false)
    }

    checkPinVerification()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isVerified) {
    return null
  }

  return <>{children}</>
}

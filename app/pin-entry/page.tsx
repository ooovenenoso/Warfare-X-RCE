"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PinEntryPage() {
  const router = useRouter()

  useEffect(() => {
    // Immediately redirect to home since PIN system is disabled
    router.replace("/")
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Redirecting to store...</div>
    </div>
  )
}

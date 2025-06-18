"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import type { Package } from "@/types/package"
import { PageLoader } from "@/components/loader"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const packageId = searchParams.get("package")
  const serverId = searchParams.get("server")

  const [packageDetails, setPackageDetails] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)

  const { toast } = useToast()
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!packageId || !serverId) {
      toast({
        title: "Invalid checkout",
        description: "Missing package or server information",
        variant: "destructive",
      })
      router.push("/store")
      return
    }

    async function loadPackageDetails() {
      try {
        const response = await fetch(`/api/packages/${packageId}`)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to load package details")
        }
        const data = await response.json()
        setPackageDetails(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load package details",
          variant: "destructive",
        })
        router.push("/store")
      } finally {
        setLoading(false)
      }
    }

    loadPackageDetails()
  }, [packageId, serverId, toast, router])

  const handleCheckout = async () => {
    if (!packageDetails || !user || !serverId) return

    setProcessingPayment(true)

    try {
      const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub || user.id
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId: packageDetails.id,
          serverId,
          discordId: discordId, // Pass the discordId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Checkout failed")
      }
      const data = await response.json()

      if (data.demo) {
        toast({
          title: "Demo Purchase Successful! 🎉",
          description: `${packageDetails.credits.toLocaleString()} credits added (demo)! Discord notification sent.`,
        })
        // Potentially redirect to a success page or update UI for demo
        router.push(
          `/success?demo=true&package_name=${encodeURIComponent(packageDetails.name)}&credits=${packageDetails.credits}`,
        )
        return // Stop further processing for demo
      }

      const { url } = data

      window.location.href = url
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: "There was a problem processing your payment",
        variant: "destructive",
      })
      setProcessingPayment(false)
    }
  }

  if (isLoading || loading) {
    return <PageLoader text="Loading checkout..." />
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4 glow-text">Authentication Required</h1>
            <p className="mb-6">Please sign in with Discord to complete your purchase.</p>
            <Button variant="default" className="glow-hover" asChild>
              <a href="/api/auth/signin">Sign In with Discord</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!packageDetails) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4 glow-text">Package Not Found</h1>
            <p className="mb-6">The selected package could not be found.</p>
            <Button variant="default" className="glow-hover" asChild>
              <a href="/store">Return to Store</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 glow-text">Checkout</h1>

          <div className="bg-black bg-opacity-50 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

            <div className="flex justify-between mb-2">
              <span>Package:</span>
              <span className="font-medium">{packageDetails.name}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Credits:</span>
              <span className="font-medium">{packageDetails.credits.toLocaleString()}</span>
            </div>

            <div className="flex justify-between mb-2">
              <span>Server:</span>
              <span className="font-medium">{serverId}</span>
            </div>

            <div className="border-t border-gray-700 my-4"></div>

            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">${packageDetails.price.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-black bg-opacity-50 border border-gray-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <p className="text-gray-400 mb-4">You will be redirected to Stripe to complete your payment securely.</p>
            <p className="text-gray-400 mb-4">
              After successful payment, credits will be automatically added to your account.
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/store")} disabled={processingPayment}>
              Back to Store
            </Button>

            <Button onClick={handleCheckout} disabled={processingPayment} className="glow-hover">
              {processingPayment ? (
                <>
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></span>
                  Processing...
                </>
              ) : (
                "Complete Purchase"
              )}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

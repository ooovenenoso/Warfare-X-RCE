import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"


export const metadata: Metadata = {
  title: "CNQR Store - Premium Gaming Credits",
  description: "Buy premium gaming credits for CNQR servers. Instant delivery, secure payments.",
  keywords: "gaming, credits, minecraft, server, premium, cnqr",
  authors: [{ name: "CNQR Team" }],
  openGraph: {
    title: "CNQR Store - Premium Gaming Credits",
    description: "Buy premium gaming credits for CNQR servers. Instant delivery, secure payments.",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-950" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}

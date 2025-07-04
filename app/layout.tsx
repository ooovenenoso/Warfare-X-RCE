import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Warfare Credits Store - Powered by Lotus Dash",
  description:
    "Buy credits for Warfare servers. Secure, instant, and reliable gaming currency powered by Lotus Dash platform.",
  keywords: "gaming, credits, warfare, minecraft, discord, store, lotus dash",
  authors: [{ name: "Lotus Dash" }],
  creator: "Lotus Dash",
  publisher: "Lotus Dash",
  robots: "index, follow",
  openGraph: {
    title: "Warfare Credits Store - Powered by Lotus Dash",
    description: "Buy credits for Warfare servers. Secure, instant, and reliable gaming currency.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Warfare Credits Store - Powered by Lotus Dash",
    description: "Buy credits for Warfare servers. Secure, instant, and reliable gaming currency.",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suppress ResizeObserver errors
              window.addEventListener('error', function(e) {
                if (e.message && e.message.includes('ResizeObserver loop')) {
                  e.stopImmediatePropagation();
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

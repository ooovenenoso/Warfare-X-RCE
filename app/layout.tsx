import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { ErrorHandler } from "@/components/error-handler"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CNQR Credits Store",
  description: "Buy credits for CNQR servers",
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
              // Suprimir errores de ResizeObserver ANTES de que React se monte
              (function() {
                const originalError = window.onerror;
                const originalUnhandledRejection = window.onunhandledrejection;
                
                window.onerror = function(message, source, lineno, colno, error) {
                  if (typeof message === 'string' && (
                    message.includes('ResizeObserver') ||
                    message.includes('loop completed') ||
                    message.includes('undelivered notifications')
                  )) {
                    return true; // Prevenir que se muestre el error
                  }
                  if (originalError) {
                    return originalError.apply(this, arguments);
                  }
                  return false;
                };
                
                window.onunhandledrejection = function(event) {
                  const message = String(event.reason);
                  if (message.includes('ResizeObserver') || 
                      message.includes('loop completed') || 
                      message.includes('undelivered notifications')) {
                    event.preventDefault();
                    return;
                  }
                  if (originalUnhandledRejection) {
                    return originalUnhandledRejection.apply(this, arguments);
                  }
                };
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorHandler />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

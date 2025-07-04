import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CNQR x LOTUS - Premium Gaming Credits",
  description: "Get premium gaming credits for your favorite servers. Fast, secure, and reliable service.",
  keywords: "gaming, credits, minecraft, premium, cnqr, lotus, store",
  authors: [{ name: "CNQR x LOTUS Team" }],
  openGraph: {
    title: "CNQR x LOTUS - Premium Gaming Credits",
    description: "Get premium gaming credits for your favorite servers. Fast, secure, and reliable service.",
    type: "website",
    siteName: "CNQR x LOTUS Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "CNQR x LOTUS - Premium Gaming Credits",
    description: "Get premium gaming credits for your favorite servers. Fast, secure, and reliable service.",
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
              // Ultra-aggressive ResizeObserver error suppression
              (function() {
                // Store originals
                const originalError = console.error;
                const originalWarn = console.warn;
                const originalResizeObserver = window.ResizeObserver;
                
                // Patch console methods immediately
                console.error = function(...args) {
                  const message = args[0]?.toString() || '';
                  if (message.includes('ResizeObserver loop completed with undelivered notifications')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args[0]?.toString() || '';
                  if (message.includes('ResizeObserver')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };
                
                // Patch ResizeObserver immediately
                if (typeof ResizeObserver !== 'undefined') {
                  window.ResizeObserver = class extends originalResizeObserver {
                    constructor(callback) {
                      const wrappedCallback = (entries, observer) => {
                        requestAnimationFrame(() => {
                          try {
                            callback(entries, observer);
                          } catch (error) {
                            if (!error?.toString().includes('ResizeObserver')) {
                              throw error;
                            }
                          }
                        });
                      };
                      super(wrappedCallback);
                    }
                  };
                }
                
                // Global error interceptors
                window.addEventListener('error', function(event) {
                  if (event.message?.includes('ResizeObserver loop completed with undelivered notifications')) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }
                }, { capture: true });
                
                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason?.toString() || '';
                  if (reason.includes('ResizeObserver')) {
                    event.preventDefault();
                    return false;
                  }
                }, { capture: true });
                
                // Patch Error constructor
                const OriginalError = Error;
                window.Error = function(...args) {
                  const message = args[0]?.toString() || '';
                  if (message.includes('ResizeObserver loop completed with undelivered notifications')) {
                    return new OriginalError('Suppressed ResizeObserver error');
                  }
                  return new OriginalError(...args);
                };
                window.Error.prototype = OriginalError.prototype;
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
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

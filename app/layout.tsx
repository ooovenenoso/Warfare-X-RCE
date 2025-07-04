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
  title: "CNQR x LOTUS - Warfare Store",
  description: "Buy credits, spend them on exclusive items, and dominate across all Warfare servers",
  keywords: ["gaming", "credits", "store", "warfare", "discord"],
  authors: [{ name: "CNQR x LOTUS" }],
  openGraph: {
    title: "CNQR x LOTUS - Warfare Store",
    description: "Buy credits, spend them on exclusive items, and dominate across all Warfare servers",
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Aggressive ResizeObserver error suppression - runs before React
              (function() {
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('ResizeObserver') || 
                      message.includes('resize observer') || 
                      message.includes('loop completed with undelivered notifications')) {
                    return;
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('ResizeObserver') || 
                      message.includes('resize observer')) {
                    return;
                  }
                  originalWarn.apply(console, args);
                };

                // Override ResizeObserver before any components load
                if (typeof ResizeObserver !== 'undefined') {
                  const OriginalResizeObserver = ResizeObserver;
                  ResizeObserver = class extends OriginalResizeObserver {
                    constructor(callback) {
                      const safeCallback = (entries, observer) => {
                        try {
                          requestAnimationFrame(() => {
                            try {
                              callback(entries, observer);
                            } catch (e) {
                              // Silent fail
                            }
                          });
                        } catch (e) {
                          // Silent fail
                        }
                      };
                      super(safeCallback);
                    }
                  };
                }

                // Global error suppression
                window.addEventListener('error', function(event) {
                  if (event.message && (
                    event.message.includes('ResizeObserver') ||
                    event.message.includes('resize observer') ||
                    event.message.includes('loop completed with undelivered notifications')
                  )) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return false;
                  }
                }, true);

                window.addEventListener('unhandledrejection', function(event) {
                  const reason = event.reason ? event.reason.toString() : '';
                  if (reason.includes('ResizeObserver') || reason.includes('resize observer')) {
                    event.preventDefault();
                    return false;
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorHandler />
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

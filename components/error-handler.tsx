"use client"

import { useEffect } from "react"

/**
 * A client component that handles and suppresses the "ResizeObserver loop" error
 * globally. It doesn't render any UI.
 */
export function ErrorHandler() {
  useEffect(() => {
    // Comprehensive error suppression for ResizeObserver
    const suppressResizeObserverErrors = () => {
      // Override console methods
      const originalError = console.error
      const originalWarn = console.warn

      console.error = (...args) => {
        const message = args.join(" ")
        if (
          message.includes("ResizeObserver") ||
          message.includes("resize observer") ||
          message.includes("loop completed with undelivered notifications") ||
          message.includes("loop limit exceeded")
        ) {
          return // Completely suppress
        }
        originalError.apply(console, args)
      }

      console.warn = (...args) => {
        const message = args.join(" ")
        if (message.includes("ResizeObserver") || message.includes("resize observer")) {
          return // Completely suppress
        }
        originalWarn.apply(console, args)
      }

      // Global error handlers
      const handleGlobalError = (event: ErrorEvent) => {
        if (
          event.message?.includes("ResizeObserver") ||
          event.message?.includes("resize observer") ||
          event.message?.includes("loop completed with undelivered notifications")
        ) {
          event.preventDefault()
          event.stopImmediatePropagation()
          return false
        }
      }

      const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
        const reason = event.reason?.toString() || ""
        if (reason.includes("ResizeObserver") || reason.includes("resize observer")) {
          event.preventDefault()
          return false
        }
      }

      // Add listeners to all possible targets
      window.addEventListener("error", handleGlobalError, true)
      document.addEventListener("error", handleGlobalError, true)
      window.addEventListener("unhandledrejection", handleUnhandledRejection, true)

      // Override ResizeObserver constructor
      if (typeof window !== "undefined" && window.ResizeObserver) {
        const OriginalResizeObserver = window.ResizeObserver

        window.ResizeObserver = class extends OriginalResizeObserver {
          constructor(callback: ResizeObserverCallback) {
            const safeCallback: ResizeObserverCallback = (entries, observer) => {
              try {
                // Use requestAnimationFrame to prevent loop issues
                requestAnimationFrame(() => {
                  try {
                    callback(entries, observer)
                  } catch (error) {
                    // Silently ignore
                  }
                })
              } catch (error) {
                // Silently ignore
              }
            }
            super(safeCallback)
          }
        }
      }

      return () => {
        console.error = originalError
        console.warn = originalWarn
        window.removeEventListener("error", handleGlobalError, true)
        document.removeEventListener("error", handleGlobalError, true)
        window.removeEventListener("unhandledrejection", handleUnhandledRejection, true)
      }
    }

    return suppressResizeObserverErrors()
  }, [])

  return null
}

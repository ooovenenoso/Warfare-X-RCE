"use client"

import { useEffect } from "react"

export function useResizeObserverErrorHandler() {
  useEffect(() => {
    // Aggressive error suppression
    const originalError = console.error
    const originalWarn = console.warn
    const originalLog = console.log

    console.error = (...args) => {
      const message = args.join(" ")
      if (
        message.includes("ResizeObserver") ||
        message.includes("resize observer") ||
        message.includes("loop completed with undelivered notifications") ||
        message.includes("loop limit exceeded")
      ) {
        return // Suppress ResizeObserver errors completely
      }
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      const message = args.join(" ")
      if (message.includes("ResizeObserver") || message.includes("resize observer")) {
        return // Suppress ResizeObserver warnings
      }
      originalWarn.apply(console, args)
    }

    // Override ResizeObserver globally
    if (typeof window !== "undefined") {
      const OriginalResizeObserver = window.ResizeObserver

      window.ResizeObserver = class extends OriginalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
            try {
              callback(entries, observer)
            } catch (error) {
              // Silently ignore ResizeObserver errors
            }
          }
          super(wrappedCallback)
        }
      }

      // Additional error handlers
      const handleError = (event: ErrorEvent) => {
        if (
          event.message?.includes("ResizeObserver") ||
          event.message?.includes("resize observer") ||
          event.message?.includes("loop completed with undelivered notifications")
        ) {
          event.preventDefault()
          event.stopPropagation()
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

      window.addEventListener("error", handleError, true)
      window.addEventListener("unhandledrejection", handleUnhandledRejection, true)

      return () => {
        console.error = originalError
        console.warn = originalWarn
        console.log = originalLog
        window.removeEventListener("error", handleError, true)
        window.removeEventListener("unhandledrejection", handleUnhandledRejection, true)
      }
    }
  }, [])
}

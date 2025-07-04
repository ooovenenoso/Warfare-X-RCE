"use client"

import { useEffect } from "react"

// Global flag to track if we've already patched ResizeObserver
let isResizeObserverPatched = false

export const useResizeObserverErrorHandler = () => {
  useEffect(() => {
    if (isResizeObserverPatched) return

    // Store original functions
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    const originalResizeObserver = window.ResizeObserver

    // Enhanced console.error interceptor
    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ""
      if (
        message.includes("ResizeObserver loop completed with undelivered notifications") ||
        message.includes("ResizeObserver loop limit exceeded") ||
        message.includes("ResizeObserver")
      ) {
        return // Suppress ResizeObserver errors completely
      }
      originalConsoleError.apply(console, args)
    }

    // Enhanced console.warn interceptor
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ""
      if (message.includes("ResizeObserver")) {
        return // Suppress ResizeObserver warnings
      }
      originalConsoleWarn.apply(console, args)
    }

    // Create a safer ResizeObserver wrapper
    if (typeof ResizeObserver !== "undefined") {
      window.ResizeObserver = class extends originalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
            window.requestAnimationFrame(() => {
              try {
                callback(entries, observer)
              } catch (error: any) {
                if (!error?.toString().includes("ResizeObserver")) {
                  throw error
                }
                // Silently ignore ResizeObserver errors
              }
            })
          }
          super(wrappedCallback)
        }
      }
    }

    // Global error handlers with high priority
    const handleGlobalError = (event: ErrorEvent) => {
      if (
        event.message?.includes("ResizeObserver loop completed with undelivered notifications") ||
        event.message?.includes("ResizeObserver loop limit exceeded")
      ) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.toString() || ""
      if (reason.includes("ResizeObserver")) {
        event.preventDefault()
        return false
      }
    }

    // Add event listeners with capture phase
    window.addEventListener("error", handleGlobalError, { capture: true, passive: false })
    window.addEventListener("unhandledrejection", handleUnhandledRejection, { capture: true, passive: false })

    isResizeObserverPatched = true

    // Cleanup function
    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      if (originalResizeObserver) {
        window.ResizeObserver = originalResizeObserver
      }
      window.removeEventListener("error", handleGlobalError, { capture: true } as any)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection, { capture: true } as any)
      isResizeObserverPatched = false
    }
  }, [])
}

// Custom hook for safe ResizeObserver usage
export const useSafeResizeObserver = (
  callback: ResizeObserverCallback,
  element: Element | null,
  options?: ResizeObserverOptions,
) => {
  useEffect(() => {
    if (!element) return

    let timeoutId: NodeJS.Timeout

    const safeCallback: ResizeObserverCallback = (entries, observer) => {
      // Debounce to prevent loops
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        try {
          callback(entries, observer)
        } catch (error: any) {
          // Suppress ResizeObserver errors
          if (
            error instanceof Error &&
            (error.message.includes("ResizeObserver loop completed") ||
              error.message.includes("ResizeObserver loop limit exceeded"))
          ) {
            return
          }
          console.error("ResizeObserver callback error:", error)
        }
      }, 16) // ~60fps
    }

    const observer = new ResizeObserver(safeCallback)
    observer.observe(element, options)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [callback, element, options])
}

export default useResizeObserverErrorHandler

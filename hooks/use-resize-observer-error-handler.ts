"use client"

import { useEffect } from "react"

export function useResizeObserverErrorHandler() {
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.message?.includes("ResizeObserver loop completed with undelivered notifications")) {
        e.stopImmediatePropagation()
        return false
      }
    }

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (e.reason?.message?.includes("ResizeObserver loop completed with undelivered notifications")) {
        e.preventDefault()
        return false
      }
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleUnhandledRejection)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
    }
  }, [])
}

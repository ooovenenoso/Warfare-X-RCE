"use client"

import { useResizeObserverErrorHandler } from "@/hooks/use-resize-observer-error-handler"

/**
 * A client component that handles and suppresses the "ResizeObserver loop" error
 * globally. It doesn't render any UI.
 */
export function ErrorHandler() {
  useResizeObserverErrorHandler()
  return null
}

"use client"

import { useEffect } from "react"

export function useResizeObserverErrorHandler() {
  useEffect(() => {
    // Sobrescribir ResizeObserver globalmente para controlar los errores
    const OriginalResizeObserver = window.ResizeObserver

    window.ResizeObserver = class extends OriginalResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        const wrappedCallback: ResizeObserverCallback = (entries, observer) => {
          try {
            callback(entries, observer)
          } catch (error) {
            // Suprimir silenciosamente todos los errores de ResizeObserver
            if (error instanceof Error && error.message.includes("ResizeObserver")) {
              return
            }
            throw error
          }
        }
        super(wrappedCallback)
      }
    }

    // Interceptar todos los tipos de errores
    const handleError = (e: ErrorEvent) => {
      if (
        e.message?.includes("ResizeObserver") ||
        e.message?.includes("loop completed") ||
        e.message?.includes("undelivered notifications") ||
        e.error?.message?.includes("ResizeObserver")
      ) {
        e.stopImmediatePropagation()
        e.preventDefault()
        return false
      }
    }

    const handleUnhandledRejection = (e: PromiseRejectionEvent) => {
      if (
        e.reason?.message?.includes("ResizeObserver") ||
        e.reason?.toString?.()?.includes("ResizeObserver") ||
        String(e.reason).includes("ResizeObserver")
      ) {
        e.preventDefault()
        return false
      }
    }

    // Sobrescribir console.error para filtrar mensajes de ResizeObserver
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args.join(" ")
      if (
        message.includes("ResizeObserver") ||
        message.includes("loop completed") ||
        message.includes("undelivered notifications")
      ) {
        return // No mostrar estos errores
      }
      originalConsoleError.apply(console, args)
    }

    // Sobrescribir console.warn también
    const originalConsoleWarn = console.warn
    console.warn = (...args: any[]) => {
      const message = args.join(" ")
      if (
        message.includes("ResizeObserver") ||
        message.includes("loop completed") ||
        message.includes("undelivered notifications")
      ) {
        return // No mostrar estos warnings
      }
      originalConsoleWarn.apply(console, args)
    }

    // Agregar múltiples listeners para capturar todos los casos
    window.addEventListener("error", handleError, { capture: true, passive: false })
    window.addEventListener("unhandledrejection", handleUnhandledRejection, { passive: false })

    // También interceptar en el nivel del documento
    document.addEventListener("error", handleError, { capture: true, passive: false })

    // Cleanup
    return () => {
      window.removeEventListener("error", handleError, { capture: true })
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      document.removeEventListener("error", handleError, { capture: true })

      // Restaurar console original
      console.error = originalConsoleError
      console.warn = originalConsoleWarn

      // Restaurar ResizeObserver original
      window.ResizeObserver = OriginalResizeObserver
    }
  }, [])
}

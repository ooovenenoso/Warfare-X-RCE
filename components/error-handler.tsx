"use client"

import { useEffect } from "react"

/**
 * A client component that handles and suppresses the "ResizeObserver loop" error
 * globally. It doesn't render any UI.
 */
export function ErrorHandler() {
  useEffect(() => {
    // Función para suprimir errores de ResizeObserver de manera agresiva
    const suppressResizeObserverErrors = () => {
      // Sobrescribir ResizeObserver completamente
      const OriginalResizeObserver = window.ResizeObserver

      class SafeResizeObserver extends OriginalResizeObserver {
        constructor(callback: ResizeObserverCallback) {
          const safeCallback: ResizeObserverCallback = (entries, observer) => {
            requestAnimationFrame(() => {
              try {
                callback(entries, observer)
              } catch (error) {
                // Silenciar completamente
              }
            })
          }
          super(safeCallback)
        }
      }

      window.ResizeObserver = SafeResizeObserver

      // Interceptar TODOS los errores posibles
      const errorHandler = (event: any) => {
        const message = event.message || event.error?.message || String(event.reason || "")

        if (
          message.includes("ResizeObserver") ||
          message.includes("loop completed") ||
          message.includes("undelivered notifications") ||
          message.includes("resize observer") ||
          message.toLowerCase().includes("resizeobserver")
        ) {
          event.stopImmediatePropagation?.()
          event.preventDefault?.()
          return false
        }
      }

      // Agregar listeners a TODOS los eventos de error posibles
      window.addEventListener("error", errorHandler, { capture: true, passive: false })
      window.addEventListener("unhandledrejection", errorHandler, { passive: false })
      document.addEventListener("error", errorHandler, { capture: true, passive: false })

      // Interceptar también en el objeto global
      if (typeof globalThis !== "undefined") {
        globalThis.addEventListener?.("error", errorHandler, { capture: true, passive: false })
      }

      // Sobrescribir métodos de console de manera más agresiva
      const originalMethods = {
        error: console.error,
        warn: console.warn,
        log: console.log,
      }

      const filterConsoleOutput = (originalMethod: Function) => {
        return (...args: any[]) => {
          const message = args.join(" ").toLowerCase()
          if (
            message.includes("resizeobserver") ||
            message.includes("loop completed") ||
            message.includes("undelivered notifications")
          ) {
            return // Completamente silenciado
          }
          originalMethod.apply(console, args)
        }
      }

      console.error = filterConsoleOutput(originalMethods.error)
      console.warn = filterConsoleOutput(originalMethods.warn)
      console.log = filterConsoleOutput(originalMethods.log)

      // Cleanup function
      return () => {
        window.removeEventListener("error", errorHandler, { capture: true })
        window.removeEventListener("unhandledrejection", errorHandler)
        document.removeEventListener("error", errorHandler, { capture: true })

        // Restaurar métodos originales
        console.error = originalMethods.error
        console.warn = originalMethods.warn
        console.log = originalMethods.log

        // Restaurar ResizeObserver original
        window.ResizeObserver = OriginalResizeObserver
      }
    }

    // Ejecutar inmediatamente y también después de que el DOM esté listo
    const cleanup = suppressResizeObserverErrors()

    // También ejecutar cuando el documento esté completamente cargado
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", suppressResizeObserverErrors)
    }

    return cleanup
  }, [])

  return null
}

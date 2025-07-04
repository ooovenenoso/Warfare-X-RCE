"use client"

import type React from "react"

export function PinGuard({ children }: { children: React.ReactNode }) {
  // PIN system disabled - always allow access
  return <>{children}</>
}

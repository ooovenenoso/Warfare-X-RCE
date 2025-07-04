"use client"

import type { ReactNode } from "react"

interface PinGuardProps {
  children: ReactNode
}

export function PinGuard({ children }: PinGuardProps) {
  // Permitir acceso directo sin verificación de PIN
  return <>{children}</>
}

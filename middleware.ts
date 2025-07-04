import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Allow all requests - PIN system disabled
  return NextResponse.next()
}

export const config = {
  matcher: [],
}

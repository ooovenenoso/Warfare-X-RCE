import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, and pin entry page
  if (
    request.nextUrl.pathname.startsWith("/api/") ||
    request.nextUrl.pathname.startsWith("/_next/") ||
    request.nextUrl.pathname.startsWith("/pin-entry") ||
    request.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Check if user has valid PIN cookie
  const pinVerified = request.cookies.get("pin_verified")

  if (!pinVerified) {
    return NextResponse.redirect(new URL("/pin-entry", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - pin-entry (PIN entry page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|pin-entry).*)",
  ],
}

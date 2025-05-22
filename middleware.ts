import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// Paths that are accessible without authentication
const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/api/auth"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path) || pathname === "/")

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Redirect authenticated users away from auth pages
  if (isPublicPath && token) {
    // If the user is already logged in and tries to access a public path,
    // redirect to the dashboard
    if (pathname !== "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Redirect unauthenticated users to login
  if (!isPublicPath && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURIComponent(pathname))
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

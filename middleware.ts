import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if the user is authenticated
  if (!token) {
    // If the user is not authenticated and trying to access a protected route
    if (isProtectedRoute(request.nextUrl.pathname)) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Check if the session has expired (30 minutes of inactivity)
  const lastActive = token.iat as number
  const currentTime = Math.floor(Date.now() / 1000)
  const inactiveTime = currentTime - lastActive

  // If inactive for more than 30 minutes (1800 seconds)
  if (inactiveTime > 1800) {
    // Redirect to login with expired session message
    const url = new URL("/login", request.url)
    url.searchParams.set("error", "SessionExpired")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Define which routes should be protected
function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/dashboard", "/upload", "/client-info", "/analysis", "/results"]

  return protectedRoutes.some((route) => pathname.startsWith(route))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api/auth (auth API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)",
  ],
}

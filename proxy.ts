import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Proxy to protect authenticated routes
 * Redirects unauthenticated users to login page
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // API auth routes should always be accessible
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for session cookie (Better Auth uses "better-auth.session_token")
  // Also check for the legacy "session_token" cookie
  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("session_token");

  // If user is not authenticated and trying to access protected route
  if (!(sessionToken || isPublicRoute)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access public route (login/signup)
  if (sessionToken && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Matcher configuration for proxy
 * Exclude auth routes, static files, and API routes
 */
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (Next.js static files)
     * - _next/image (Next.js image optimization)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

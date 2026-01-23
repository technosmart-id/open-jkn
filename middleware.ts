import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware to protect authenticated routes
 * NOTE: Using middleware.ts as workaround for Next.js 16 proxy.ts bug
 * https://github.com/vercel/next.js/issues/86122
 */
export function middleware(request: NextRequest) {
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
  const sessionToken = request.cookies.get("better-auth.session_token");

  // Debug logging
  console.log(
    "[Middleware] Path:",
    pathname,
    "Has session:",
    !!sessionToken,
    "Is public:",
    isPublicRoute
  );

  // If user is not authenticated and trying to access protected route
  if (!(sessionToken || isPublicRoute)) {
    console.log("[Middleware] Redirecting to login");
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access public route (login/signup)
  if (sessionToken && isPublicRoute) {
    console.log("[Middleware] Redirecting to dashboard");
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Matcher configuration for middleware
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

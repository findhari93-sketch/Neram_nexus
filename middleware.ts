import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { AppRole } from "@/lib/auth-config";

/**
 * Route protection configuration
 * Maps route prefixes to required roles (in order of priority)
 */
const ROUTE_ROLE_MAP: Record<string, AppRole[]> = {
  "/superadmin": ["superadmin"],
  "/admin": ["superadmin", "admin"],
  "/teacher": ["superadmin", "admin", "teacher"],
  "/student": ["superadmin", "admin", "teacher", "student"],
};

/**
 * Check if user has required role for the requested path
 */
function hasRequiredRole(userRole: AppRole, path: string): boolean {
  for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ROLE_MAP)) {
    if (path.startsWith(routePrefix)) {
      return allowedRoles.includes(userRole);
    }
  }
  return true; // No protection required for this route
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    // Allow all auth pages (custom NextAuth pages) to render without redirects
    pathname.startsWith("/auth") ||
    pathname === "/" ||
    pathname === "/auth/unauthorized" ||
    pathname === "/unauthorized"
  ) {
    return NextResponse.next();
  }

  // Get the user's token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Check if user is authenticated
  if (!token) {
    const signInUrl = new URL("/api/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Check if user has required role
  const userRole = token.role as AppRole;
  if (!hasRequiredRole(userRole, pathname)) {
    // Redirect to unauthorized page
    const unauthorizedUrl = new URL("/unauthorized", request.url);
    return NextResponse.redirect(unauthorizedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

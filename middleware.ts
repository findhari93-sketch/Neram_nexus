import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { AppRole } from "@/lib/auth-config";

/**
 * Route protection configuration
 * Maps route prefixes to required roles (in order of priority)
 */
const ROUTE_ROLE_MAP: Record<string, AppRole[]> = {
  "/superadmin": ["super_admin"],
  "/admin": ["super_admin", "admin"],
  "/teacher": ["super_admin", "admin", "teacher"],
  "/student": ["super_admin", "admin", "teacher", "student"],
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
  const hostname = request.nextUrl.hostname;

  // Domain constants (adjust via env if needed)
  const ADMIN_DOMAIN =
    process.env.NEXT_PUBLIC_ADMIN_DOMAIN || "admin.neramclasses.com";
  const APP_DOMAIN =
    process.env.NEXT_PUBLIC_APP_DOMAIN || "app.neramclasses.com";

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
    // Redirect unauthenticated users to the custom NextAuth sign-in page (not the API route)
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  const userRole = token.role as AppRole;

  // Host-based access control:
  // - admin.neramclasses.com: only super_admin & admin allowed
  // - app.neramclasses.com: all roles allowed
  if (hostname === ADMIN_DOMAIN) {
    if (userRole === "teacher" || userRole === "student") {
      // Redirect teachers/students attempting to access admin domain
      const target = new URL(request.url);
      target.hostname = APP_DOMAIN;
      target.protocol = "https:"; // enforce https in production
      // Optionally carry a flag for UI messaging
      target.searchParams.set("redirected", "admin-denied");
      return NextResponse.redirect(target);
    }
    // Super admins and admins can access all routes on admin domain
  }

  // Route-level role protection (path prefixes)
  if (!hasRequiredRole(userRole, pathname)) {
    const unauthorizedUrl = new URL("/auth/unauthorized", request.url);
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

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "aidex_session";

// Routes that require an authenticated user session
const PROTECTED_PREFIXES = [
  "/goals/new",
  "/dashboard",
  "/settings",
  "/activity",
  "/contributions",
  "/payouts",
  "/onboarding",
];

// Helper to check token signature without full node crypto if running on edge/lightweight runtime
function hasValidSessionCookieFormat(cookieValue?: string): boolean {
  if (!cookieValue) return false;
  // Signed format: <token_hex>.<signature_hex>
  const parts = cookieValue.split(".");
  return parts.length === 2 && parts[0].length >= 32 && parts[1].length >= 32;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Explicitly allow public goal funding links: /goals/[id]/fund
  if (pathname.includes("/fund")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const isAuthenticated = hasValidSessionCookieFormat(sessionCookie);

  // 2. Check protected routes
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    if (!isAuthenticated) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", `${pathname}${search}`);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // 3. If already authenticated and visiting /login or /signup, redirect to dashboard
  if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const target = redirectParam && !redirectParam.startsWith("/login") ? redirectParam : "/dashboard";
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/ (API routes handle their own auth responses)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images/, public icons
     */
    "/((?!api|_next/static|_next/image|images|favicon.ico|icon.webp).*)",
  ],
};

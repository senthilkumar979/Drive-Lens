import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/vehicle/:path*",
    "/trips/:path*",
    "/charging/:path*",
    "/analytics/:path*",
    "/favorites/:path*",
    "/maintenance/:path*",
    "/reports/:path*",
    "/assistant/:path*",
    "/settings/:path*",
    "/api/vehicle/:path*",
    "/api/trips/:path*",
    "/api/charging/:path*",
    "/api/favorites/:path*",
    "/api/navigation/:path*",
    "/api/analytics/:path*",
    "/api/reports/:path*",
    "/api/notifications/:path*",
    "/api/maintenance/:path*",
    "/api/assistant/:path*",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/cron") || pathname === "/api/health") {
    return NextResponse.next();
  }

  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value;

  if (!sessionToken) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

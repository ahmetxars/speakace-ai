import { CONSENT_COOKIE, parseCookieConsent } from "@/lib/cookie-consent";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");

  const localHost = ["localhost", "127.0.0.1", "[::1]"].includes(request.nextUrl.hostname);
  if (forwardedProto === "http" && !localHost) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.protocol = "https";
    return NextResponse.redirect(redirectUrl, 308);
  }

  const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const pathname = request.nextUrl.pathname;
  const isMaintenancePage = pathname === "/maintenance";
  const isInternalAsset =
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";
  const isAllowedDuringMaintenance = isMaintenancePage || pathname.startsWith("/admin") || pathname.startsWith("/api") || isInternalAsset;

  if (maintenanceMode && !isAllowedDuringMaintenance) {
    const maintenanceUrl = request.nextUrl.clone();
    maintenanceUrl.pathname = "/maintenance";
    maintenanceUrl.search = "";
    return NextResponse.rewrite(maintenanceUrl);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-current-path", request.nextUrl.pathname);
  requestHeaders.set("x-maintenance-mode", maintenanceMode ? "true" : "false");

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
  if (!parseCookieConsent(request.cookies.get(CONSENT_COOKIE)?.value)?.analytics && request.cookies.has("speakace_visitor_id")) {
    response.cookies.set("speakace_visitor_id", "", { path: "/", maxAge: 0 });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

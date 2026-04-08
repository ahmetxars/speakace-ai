import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedProto === "http") {
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

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

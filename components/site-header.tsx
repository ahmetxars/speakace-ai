"use client";

import { usePathname } from "next/navigation";
import { EditorialPublicHeader } from "@/components/editorial-public-header";
import { WorkspaceHeader } from "@/components/workspace-header";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  if (
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/maintenance")
  )
    return null;
  if (pathname === "/app" || pathname.startsWith("/app/"))
    return <WorkspaceHeader />;
  return <EditorialPublicHeader account={pathname.startsWith("/auth")} />;
}

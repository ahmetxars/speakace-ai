"use client";

import { usePathname } from "next/navigation";
import { PublicFooter } from "@/components/public/footer";

export function SiteFooter() {
  const pathname = usePathname() ?? "/";
  if (
    pathname === "/" ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/maintenance")
  )
    return null;
  return <PublicFooter compact={pathname.startsWith("/auth")} />;
}

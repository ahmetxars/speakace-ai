"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { hasPublicPageFrame } from "@/lib/public-navigation";

/** Root layouts persist across client navigation; the styling boundary must follow the route. */
export function PublicPageFrame({
  children,
  initialPath,
}: {
  children: ReactNode;
  initialPath: string;
}) {
  const pathname = usePathname() ?? initialPath;
  return hasPublicPageFrame(pathname) ? (
    <div className="public-page">{children}</div>
  ) : (
    children
  );
}

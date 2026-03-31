import type { ReactNode } from "react";
import { AppMobileNav } from "@/components/app-mobile-nav";
import { SiteHeader } from "@/components/site-header";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <AppMobileNav />
    </>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppMobileNav } from "@/components/app-mobile-nav";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true
  }
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <main className="app-main">
        {children}
      </main>
      <AppMobileNav />
    </div>
  );
}

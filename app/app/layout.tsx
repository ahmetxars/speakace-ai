import type { ReactNode } from "react";
import { AppHeader } from "@/components/app-header";
import { AppMobileNav } from "@/components/app-mobile-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <AppHeader />
      <main className="app-main">
        {children}
      </main>
      <AppMobileNav />
    </div>
  );
}

import type { ReactNode } from "react";
import { AppMobileNav } from "@/components/app-mobile-nav";

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

import type { Metadata } from "next";
import type { ReactNode } from "react";

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
      <main className="app-main" id="workspace-main" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}

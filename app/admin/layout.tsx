import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", margin: 0, padding: 0 }}>
      {children}
    </div>
  );
}

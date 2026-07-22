"use client";

import { usePathname } from "next/navigation";
import { useAppState } from "@/components/providers";
import { Moon, Sun } from "lucide-react";

export function FloatingThemeToggle() {
  const pathname = usePathname();
  const { theme, setTheme, language } = useAppState();
  const tr = language === "tr";

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/app") || pathname?.startsWith("/auth")) {
    return null;
  }

  const isDark = theme === "dark";
  const label = isDark
    ? (tr ? "Aydınlık temaya geç" : "Switch to light theme")
    : (tr ? "Koyu temaya geç" : "Switch to dark theme");

  return (
    <div className="theme-fab-shell">
      <button
        type="button"
        className="theme-fab-button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        aria-label={label}
        title={label}
      >
        {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
      </button>
    </div>
  );
}

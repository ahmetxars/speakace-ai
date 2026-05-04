"use client";

import { Moon, Sun } from "lucide-react";
import { useAppState } from "@/components/providers";

export function AppThemeToggle() {
  const { theme, setTheme, language } = useAppState();
  const tr = language === "tr";
  const isDark = theme === "dark";
  const label = isDark
    ? (tr ? "Aydınlık temaya geç" : "Switch to light theme")
    : (tr ? "Koyu temaya geç" : "Switch to dark theme");

  return (
    <button
      type="button"
      className="app-theme-toggle"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={label}
      title={label}
    >
      {isDark ? <Sun size={15} strokeWidth={2} /> : <Moon size={15} strokeWidth={2} />}
    </button>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { useAppState } from "@/components/providers";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";
import { Moon, Sun } from "lucide-react";

const themeToggleCopy: Record<PublicLanguage, { light: string; dark: string }> = {
  en: { light: "Switch to light theme", dark: "Switch to dark theme" },
  tr: { light: "Aydınlık temaya geç", dark: "Koyu temaya geç" },
  de: { light: "Zum hellen Design wechseln", dark: "Zum dunklen Design wechseln" },
  es: { light: "Cambiar al tema claro", dark: "Cambiar al tema oscuro" },
  fr: { light: "Passer au thème clair", dark: "Passer au thème sombre" },
};

export function FloatingThemeToggle() {
  const pathname = usePathname();
  const { theme, setTheme, language } = useAppState();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/app") || pathname?.startsWith("/auth")) {
    return null;
  }

  const isDark = theme === "dark";
  const copy = themeToggleCopy[normalizePublicLanguage(language)];
  const label = isDark ? copy.light : copy.dark;

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

"use client";

import { useMemo } from "react";
import { useAppState } from "@/components/providers";

export function FloatingThemeToggle() {
  const { theme, setTheme, language } = useAppState();
  const tr = language === "tr";

  const content = useMemo(() => {
    if (theme === "dark") {
      return {
        activeEmoji: "🌙",
        activeLabel: tr ? "Koyu tema aktif" : "Dark theme active",
        nextEmoji: "☀️",
        nextLabel: tr ? "Aydinlik temaya gec" : "Switch to light theme",
        nextTheme: "light" as const
      };
    }

    return {
      activeEmoji: "☀️",
      activeLabel: tr ? "Aydinlik tema aktif" : "Light theme active",
      nextEmoji: "🌙",
      nextLabel: tr ? "Koyu temaya gec" : "Switch to dark theme",
      nextTheme: "dark" as const
    };
  }, [theme, tr]);

  return (
    <div className="theme-fab-shell" aria-label={tr ? "Tema degistirici" : "Theme switcher"}>
      <div className="theme-fab-stack">
        <button
          type="button"
          className="theme-fab-button theme-fab-button-next"
          onClick={() => setTheme(content.nextTheme)}
          aria-label={content.nextLabel}
          title={content.nextLabel}
        >
          <span aria-hidden="true">{content.nextEmoji}</span>
        </button>
        <div
          className="theme-fab-button theme-fab-button-current"
          aria-label={content.activeLabel}
          title={content.activeLabel}
        >
          <span aria-hidden="true">{content.activeEmoji}</span>
        </div>
      </div>
    </div>
  );
}

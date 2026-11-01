"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useAppState } from "@/components/providers";
import {
  normalizePublicLanguage,
  publicLocaleOptions,
  type Language,
} from "@/lib/copy";
const labels = {
  en: [
    "Practice",
    "Resources",
    "For learners",
    "Plans",
    "Sign in",
    "Start free",
    "Dashboard",
  ],
  tr: [
    "Pratik",
    "Kaynaklar",
    "Öğrenciler için",
    "Planlar",
    "Giriş yap",
    "Ücretsiz başla",
    "Panelim",
  ],
  de: [
    "Üben",
    "Ressourcen",
    "Für Lernende",
    "Tarife",
    "Anmelden",
    "Kostenlos starten",
    "Dashboard",
  ],
  es: [
    "Practicar",
    "Recursos",
    "Estudiantes",
    "Planes",
    "Entrar",
    "Empieza gratis",
    "Panel",
  ],
  fr: [
    "Pratiquer",
    "Ressources",
    "Étudiants",
    "Offres",
    "Connexion",
    "Commencer",
    "Tableau de bord",
  ],
};
export function EditorialPublicHeader() {
  const { language, setLanguage, signedIn } = useAppState();
  const t = labels[normalizePublicLanguage(language)];
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const links = [
    "/app/practice",
    "/resources",
    "/for-students",
    "/pricing",
  ] as const;
  return (
    <header
      className="public-site-header"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <div className="public-header-inner">
        <Link className="public-wordmark" href="/" aria-label="SpeakAce home">
          <span className="public-wordmark-icon" aria-hidden="true">
            ≋
          </span>
          SpeakAce<span>.</span>
        </Link>
        <nav className="public-desktop-nav" aria-label="Main navigation">
          {links.map((href, i) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {t[i]}
            </Link>
          ))}
        </nav>
        <div className="public-header-actions">
          <select
            aria-label="Language"
            value={normalizePublicLanguage(language)}
            onChange={(e) => setLanguage(e.target.value as Language)}
          >
            {publicLocaleOptions.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code.toUpperCase()}
              </option>
            ))}
          </select>
          <Link
            className="public-signin"
            href={signedIn ? "/app" : "/auth?mode=signin"}
          >
            {signedIn ? t[6] : t[4]}
          </Link>
          <Link className="public-start" href="/app/practice">
            {t[5]}
            <ArrowUpRight size={16} />
          </Link>
          <button
            type="button"
            className="public-menu-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="public-mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="public-mobile-nav"
          className="public-mobile-nav"
          aria-label="Mobile navigation"
        >
          {links.map((href, i) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}>
              {t[i]}
            </Link>
          ))}
          <Link
            href={signedIn ? "/app" : "/auth?mode=signin"}
            onClick={() => setOpen(false)}
          >
            {signedIn ? t[6] : t[4]}
          </Link>
        </nav>
      )}
    </header>
  );
}

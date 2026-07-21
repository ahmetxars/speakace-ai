"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun, ChevronDown, Globe } from "lucide-react";
import { useAppState } from "@/components/providers";
import { normalizePublicLanguage, publicLocaleOptions, type PublicLanguage } from "@/lib/copy";
import { resolveDashboardRole } from "@/lib/roles";

type AppHeaderLabels = {
  profile: string;
  billing: string;
  settings: string;
  signOut: string;
  account: string;
  dashboard: string;
  speaking: string;
  writing: string;
  review: string;
  signIn: string;
  signUp: string;
  home: string;
  pricing: string;
  schools: string;
  teaching: string;
  compare: string;
  admin: string;
  lightTheme: string;
  darkTheme: string;
};

const labels: Record<PublicLanguage, AppHeaderLabels> = {
  en: {
    profile: "Profile",
    billing: "Billing",
    settings: "Settings",
    signOut: "Sign out",
    account: "Account",
    dashboard: "Dashboard",
    speaking: "Speaking",
    writing: "Writing",
    review: "Review",
    signIn: "Sign in",
    signUp: "Sign up",
    home: "Home",
    pricing: "Pricing",
    schools: "Schools",
    teaching: "Teaching",
    compare: "Compare",
    admin: "Admin",
    lightTheme: "Switch to light theme",
    darkTheme: "Switch to dark theme"
  },
  tr: {
    profile: "Profil",
    billing: "Fatura",
    settings: "Ayarlar",
    signOut: "Çıkış yap",
    account: "Hesap",
    dashboard: "Panel",
    speaking: "Konuşma",
    writing: "Yazma",
    review: "İnceleme",
    signIn: "Giriş yap",
    signUp: "Kayıt ol",
    home: "Ana sayfa",
    pricing: "Fiyatlar",
    schools: "Kurumlar",
    teaching: "Sınıf",
    compare: "Karşılaştır",
    admin: "Kurum",
    lightTheme: "Aydınlık temaya geç",
    darkTheme: "Koyu temaya geç"
  },
  de: {
    profile: "Profil",
    billing: "Abrechnung",
    settings: "Einstellungen",
    signOut: "Abmelden",
    account: "Konto",
    dashboard: "Übersicht",
    speaking: "Sprechen",
    writing: "Schreiben",
    review: "Wiederholen",
    signIn: "Anmelden",
    signUp: "Registrieren",
    home: "Start",
    pricing: "Preise",
    schools: "Schulen",
    teaching: "Klassen",
    compare: "Vergleichen",
    admin: "Verwaltung",
    lightTheme: "Zum hellen Modus",
    darkTheme: "Zum dunklen Modus"
  },
  es: {
    profile: "Perfil",
    billing: "Pagos",
    settings: "Ajustes",
    signOut: "Salir",
    account: "Cuenta",
    dashboard: "Panel",
    speaking: "Speaking",
    writing: "Writing",
    review: "Repaso",
    signIn: "Entrar",
    signUp: "Crear cuenta",
    home: "Inicio",
    pricing: "Precios",
    schools: "Escuelas",
    teaching: "Clases",
    compare: "Comparar",
    admin: "Administración",
    lightTheme: "Cambiar a tema claro",
    darkTheme: "Cambiar a tema oscuro"
  },
  fr: {
    profile: "Profil",
    billing: "Paiement",
    settings: "Réglages",
    signOut: "Déconnexion",
    account: "Compte",
    dashboard: "Tableau",
    speaking: "Oral",
    writing: "Écrit",
    review: "Révision",
    signIn: "Connexion",
    signUp: "Créer un compte",
    home: "Accueil",
    pricing: "Tarifs",
    schools: "Écoles",
    teaching: "Classes",
    compare: "Comparer",
    admin: "Administration",
    lightTheme: "Passer au thème clair",
    darkTheme: "Passer au thème sombre"
  },
};

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname() ?? "/app";
  const { language, setLanguage, theme, setTheme, signedIn, signOut, currentUser } = useAppState();
  const publicLanguage = normalizePublicLanguage(language);
  const l = labels[publicLanguage];
  const dashboardRole = resolveDashboardRole(currentUser);

  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [accountOpen]);

  const isDark = theme === "dark";
  const themeLabel = isDark ? l.lightTheme : l.darkTheme;

  const logoHref: Route = !signedIn
    ? "/"
    : dashboardRole === "school"
      ? "/app/institution-admin"
      : dashboardRole === "teacher"
        ? "/app/teacher"
        : "/app";

  const desktopNavItems: Array<{ href: Route; label: string; active: boolean }> =
    !signedIn
      ? [
          { href: "/", label: l.home, active: pathname === "/" },
          { href: "/pricing", label: l.pricing, active: pathname.startsWith("/pricing") },
          { href: "/for-schools", label: l.schools, active: pathname.startsWith("/for-schools") },
        ]
      : dashboardRole === "teacher"
        ? [
            { href: "/app/teacher", label: l.teaching, active: pathname.startsWith("/app/teacher") && !pathname.startsWith("/app/teacher/compare") },
            { href: "/app/teacher/compare", label: l.compare, active: pathname.startsWith("/app/teacher/compare") },
            { href: "/app/settings", label: l.settings, active: pathname.startsWith("/app/settings") },
          ]
        : dashboardRole === "school"
          ? [
              { href: "/app/institution-admin", label: l.admin, active: pathname.startsWith("/app/institution-admin") },
              { href: "/app/billing", label: l.billing, active: pathname.startsWith("/app/billing") || pathname.startsWith("/app/teacher/billing") },
              { href: "/app/settings", label: l.settings, active: pathname.startsWith("/app/settings") },
            ]
          : [
              { href: "/app", label: l.dashboard, active: pathname === "/app" },
              { href: "/app/practice", label: l.speaking, active: pathname.startsWith("/app/practice") },
              { href: "/app/writing", label: l.writing, active: pathname.startsWith("/app/writing") },
              { href: "/app/review", label: l.review, active: pathname.startsWith("/app/review") },
            ];

  const accountItems =
    dashboardRole === "school"
      ? [
          { href: "/app/institution-admin", label: l.admin },
          { href: "/app/billing", label: l.billing },
          { href: "/app/settings", label: l.settings },
        ]
      : dashboardRole === "teacher"
        ? [
            { href: "/app/teacher", label: l.teaching },
            { href: "/app/teacher/billing", label: l.billing },
            { href: "/app/settings", label: l.settings },
          ]
        : [
            { href: "/app/profile", label: l.profile },
            { href: "/app/billing", label: l.billing },
            { href: "/app/settings", label: l.settings },
          ];

  return (
    <header className={`app-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="app-header-inner">
        <Link href={logoHref} className="app-header-logo" aria-label="SpeakAce dashboard">
          <div className="app-header-logo-mark" aria-hidden="true">
            <span>SA</span>
          </div>
          <Image
            src="/brand/speakace-logo.webp"
            alt="SpeakAce"
            width={120}
            height={41}
            priority
            className="nav-logo-img"
            style={{ height: "20px", width: "auto" }}
          />
        </Link>

        <nav className="app-header-nav desktop-nav" aria-label="App navigation">
          {desktopNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`app-header-nav-link${item.active ? " is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="app-header-actions">
          <label className="app-header-language" aria-label="Language">
            <Globe size={14} strokeWidth={2} aria-hidden="true" />
            <select
              value={publicLanguage}
              onChange={(event) => setLanguage(event.target.value as PublicLanguage)}
              aria-label="Language"
            >
              {publicLocaleOptions.map((item) => (
                <option key={item.code} value={item.code}>{item.code.toUpperCase()}</option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="app-header-icon-btn desktop-nav"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={themeLabel}
            title={themeLabel}
          >
            {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          </button>

          {signedIn ? (
            <div ref={accountRef} className="app-header-account">
              <button
                type="button"
                className="app-header-account-btn"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span>{l.account}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={2}
                  style={{ transition: "transform 0.2s", transform: accountOpen ? "rotate(180deg)" : "none" }}
                />
              </button>

              {accountOpen && (
                <div className="app-header-dropdown" role="menu">
                  {accountItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href as Route}
                      role="menuitem"
                      className="app-header-dropdown-item"
                      onClick={() => setAccountOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="app-header-dropdown-divider" role="separator" />
                  <button
                    type="button"
                    role="menuitem"
                    className="app-header-dropdown-item app-header-dropdown-signout"
                    onClick={() => {
                      setAccountOpen(false);
                      void signOut().then(() => {
                        router.push("/");
                        router.refresh();
                      });
                    }}
                  >
                    {l.signOut}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="app-header-auth desktop-nav">
              <Link href="/auth" className="button button-secondary">
                {l.signIn}
              </Link>
              <Link href="/pricing" className="button button-primary">
                {l.signUp}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

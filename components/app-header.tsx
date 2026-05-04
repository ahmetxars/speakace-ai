"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { useAppState } from "@/components/providers";
import { resolveDashboardRole } from "@/lib/roles";

const labels = {
  en: { profile: "Profile", billing: "Billing", settings: "Settings", signOut: "Sign out", account: "Account" },
  tr: { profile: "Profil", billing: "Fatura", settings: "Ayarlar", signOut: "Çıkış yap", account: "Hesap" },
};

export function AppHeader() {
  const pathname = usePathname() ?? "/app";
  const { language, theme, setTheme, signedIn, signOut, currentUser } = useAppState();
  const tr = language === "tr";
  const l = tr ? labels.tr : labels.en;
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
  const themeLabel = isDark
    ? (tr ? "Aydınlık temaya geç" : "Switch to light theme")
    : (tr ? "Koyu temaya geç" : "Switch to dark theme");

  const accountItems =
    dashboardRole === "school"
      ? [
          { href: "/app/institution-admin", label: tr ? "Kurum" : "Admin" },
          { href: "/app/billing", label: l.billing },
          { href: "/app/settings", label: l.settings },
        ]
      : dashboardRole === "teacher"
        ? [
            { href: "/app/teacher", label: tr ? "Sınıf" : "Teaching" },
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
        {/* Logo → /app */}
        <Link href="/app" className="app-header-logo" aria-label="SpeakAce dashboard">
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

        {/* Desktop role breadcrumb */}
        <nav className="app-header-nav desktop-nav" aria-label="App navigation">
          {dashboardRole === "teacher" && (
            <Link
              href="/app/teacher"
              className={`app-header-nav-link${pathname.startsWith("/app/teacher") ? " is-active" : ""}`}
            >
              {tr ? "Sınıf" : "Teaching"}
            </Link>
          )}
          {dashboardRole === "school" && (
            <Link
              href="/app/institution-admin"
              className={`app-header-nav-link${pathname.startsWith("/app/institution-admin") ? " is-active" : ""}`}
            >
              {tr ? "Kurum" : "Admin"}
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="app-header-actions">
          {/* Theme toggle — desktop only */}
          <button
            type="button"
            className="app-header-icon-btn desktop-nav"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={themeLabel}
            title={themeLabel}
          >
            {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
          </button>

          {/* Account dropdown */}
          {signedIn && (
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
                    onClick={() => { setAccountOpen(false); void signOut(); }}
                  >
                    {l.signOut}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

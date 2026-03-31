"use client";

import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { copy } from "@/lib/copy";
import { useAppState } from "@/components/providers";

type NavLinkItem = {
  href: Route;
  label: string;
};

const navItem = (href: Route, label: string): NavLinkItem => ({ href, label });

export function SiteHeader() {
  const { language, setLanguage, signedIn, currentUser, signOut } = useAppState();
  const content = copy[language];
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const primaryLinks = useMemo<NavLinkItem[]>(
    () => [
      navItem("/app/practice", content.nav.practice),
      navItem(signedIn ? "/app" : "/pricing", signedIn ? content.nav.dashboard : content.nav.pricing),
      navItem("/resources", language === "tr" ? "Kaynaklar" : "Resources"),
      navItem("/free-ielts-speaking-test", language === "tr" ? "Ucretsiz test" : "Free test"),
      navItem("/tools", language === "tr" ? "Araclar" : "Tools"),
      navItem("/blog", "Blog"),
      navItem("/reviews", language === "tr" ? "Yorumlar" : "Reviews")
    ],
    [content.nav.dashboard, content.nav.practice, content.nav.pricing, language, signedIn]
  );

  const signedOutLinks = useMemo<NavLinkItem[]>(
    () => [
      navItem("/for-teachers", language === "tr" ? "Öğretmenler için" : "For teachers"),
      navItem("/for-schools", language === "tr" ? "Kurumlar için" : "For schools")
    ],
    [language]
  );

  const signedInLinks = useMemo<NavLinkItem[]>(
    () => [
      ...(!currentUser?.isTeacher ? [navItem("/app/profile", language === "tr" ? "Profil" : "Profile")] : []),
      navItem("/app/notifications", language === "tr" ? "Bildirimler" : "Notifications"),
      navItem("/app/analytics", language === "tr" ? "Analitik" : "Analytics"),
      ...(currentUser?.isTeacher
        ? [
            navItem("/app/teacher", language === "tr" ? "Öğretmen" : "Teacher"),
            navItem("/app/teacher/billing", language === "tr" ? "Kurum" : "Institution"),
            navItem("/app/teacher/institution", language === "tr" ? "Kurum analitiği" : "Analytics")
          ]
        : []),
      ...(currentUser?.isAdmin
        ? [navItem("/app/institution-admin", language === "tr" ? "Kurum yönetimi" : "Institution admin")]
        : []),
      navItem("/app/study-lists", language === "tr" ? "Çalışma listeleri" : "Study lists"),
      navItem("/app/review", language === "tr" ? "Gözden geçir" : "Review"),
      navItem("/app/billing", content.nav.billing),
      navItem("/app/settings", content.nav.settings)
    ],
    [content.nav.billing, content.nav.settings, currentUser?.isAdmin, currentUser?.isTeacher, language]
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="page-shell site-header-shell">
      <div className="card site-header-card">
        <div className="site-header-brand">
          <Link href="/" className="site-header-logo" onClick={closeMenu}>
            {content.brand}
          </Link>
          <div className="site-header-tagline">{content.tagline}</div>
          {currentUser ? (
            <div className="site-header-userline">
              {currentUser.name} · {currentUser.plan.toUpperCase()}
              {currentUser.isTeacher ? (language === "tr" ? " · ÖĞRETMEN" : " · TEACHER") : ""}
            </div>
          ) : null}
        </div>

        <nav className="site-header-nav desktop-nav">
          {primaryLinks.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          {!signedIn
            ? signedOutLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))
            : signedInLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
          {!signedIn ? (
            <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus&coupon=LAUNCH20&campaign=header_cta">
              {language === "tr" ? "Plus al" : "Get Plus"}
            </a>
          ) : null}
          {signedIn ? (
            <button className="button button-secondary" type="button" onClick={() => void signOut()}>
              {content.nav.signOut}
            </button>
          ) : (
            <Link href="/auth">{content.nav.signIn}</Link>
          )}
          <div style={{ display: "inline-flex", border: "1px solid var(--line)", borderRadius: 999 }}>
            <button
              className="button"
              type="button"
              onClick={() => setLanguage("en")}
              style={{
                padding: "0.45rem 0.7rem",
                background: language === "en" ? "var(--accent)" : "transparent",
                color: language === "en" ? "white" : "inherit"
              }}
            >
              EN
            </button>
            <button
              className="button"
              type="button"
              onClick={() => setLanguage("tr")}
              style={{
                padding: "0.45rem 0.7rem",
                background: language === "tr" ? "var(--accent)" : "transparent",
                color: language === "tr" ? "white" : "inherit"
              }}
            >
              TR
            </button>
          </div>
        </nav>

        <button
          type="button"
          className="site-header-menu-button"
          aria-label={menuOpen ? (language === "tr" ? "Menüyü kapat" : "Close menu") : language === "tr" ? "Menüyü aç" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-nav-overlay ${menuOpen ? "is-open" : ""}`} onClick={closeMenu} />
      <aside className={`mobile-nav-panel ${menuOpen ? "is-open" : ""}`} aria-hidden={!menuOpen}>
        <div className="mobile-nav-panel-head">
          <div>
            <strong>{content.brand}</strong>
            <div className="site-header-tagline">{content.tagline}</div>
          </div>
          <button type="button" className="site-header-menu-button is-close" aria-label={language === "tr" ? "Menüyü kapat" : "Close menu"} onClick={closeMenu}>
            <span />
            <span />
          </button>
        </div>

        <div className="mobile-nav-section">
          <span className="eyebrow">{language === "tr" ? "Gezinme" : "Navigation"}</span>
          <div className="mobile-nav-links">
            {primaryLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mobile-nav-section">
          <span className="eyebrow">{signedIn ? (language === "tr" ? "Hesap" : "Account") : language === "tr" ? "Daha fazlası" : "More"}</span>
          <div className="mobile-nav-links">
            {!signedIn
              ? signedOutLinks.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMenu}>
                    {item.label}
                  </Link>
                ))
              : signedInLinks.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeMenu}>
                    {item.label}
                  </Link>
                ))}
          </div>
        </div>

        <div className="mobile-nav-actions">
          {!signedIn ? (
            <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus&coupon=LAUNCH20&campaign=header_mobile_cta">
              {language === "tr" ? "Plus al" : "Get Plus"}
            </a>
          ) : (
            <button className="button button-secondary" type="button" onClick={() => void signOut()}>
              {content.nav.signOut}
            </button>
          )}
          {!signedIn ? (
            <Link className="button button-secondary" href="/auth" onClick={closeMenu}>
              {content.nav.signIn}
            </Link>
          ) : null}
        </div>

        <div className="mobile-language-switch">
          <button
            className="button"
            type="button"
            onClick={() => setLanguage("en")}
            style={{
              padding: "0.55rem 0.85rem",
              background: language === "en" ? "var(--accent)" : "transparent",
              color: language === "en" ? "white" : "inherit"
            }}
          >
            EN
          </button>
          <button
            className="button"
            type="button"
            onClick={() => setLanguage("tr")}
            style={{
              padding: "0.55rem 0.85rem",
              background: language === "tr" ? "var(--accent)" : "transparent",
              color: language === "tr" ? "white" : "inherit"
            }}
          >
            TR
          </button>
        </div>
      </aside>
    </header>
  );
}

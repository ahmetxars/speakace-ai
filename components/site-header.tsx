"use client";

import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { copy } from "@/lib/copy";
import { useAppState } from "@/components/providers";
import type { NotificationItem } from "@/lib/notifications";

type NavLinkItem = {
  href: Route;
  label: string;
};

const navItem = (href: Route, label: string): NavLinkItem => ({ href, label });

export function SiteHeader() {
  const { language, setLanguage, signedIn, currentUser, signOut } = useAppState();
  const content = copy[language];
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const bellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!signedIn || !currentUser?.id) {
      setNotifications([]);
      return;
    }
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data: { notifications?: NotificationItem[] }) => setNotifications((data.notifications ?? []).slice(0, 5)))
      .catch(() => setNotifications([]));
  }, [currentUser?.id, signedIn]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!bellRef.current?.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const primaryLinks = useMemo<NavLinkItem[]>(
    () => [
      navItem("/app/practice", content.nav.practice),
      navItem(signedIn ? "/app" : "/pricing", signedIn ? content.nav.dashboard : content.nav.pricing),
      navItem("/free-ielts-speaking-test", language === "tr" ? "Ucretsiz test" : "Free test"),
      navItem("/blog", "Blog"),
      navItem("/for-teachers", language === "tr" ? "Öğretmenler için" : "For teachers"),
      navItem("/for-schools", language === "tr" ? "Kurumlar için" : "For schools")
    ],
    [content.nav.dashboard, content.nav.practice, content.nav.pricing, language, signedIn]
  );

  const secondaryLinks = useMemo<NavLinkItem[]>(
    () => [
      navItem("/resources", language === "tr" ? "Kaynaklar" : "Resources"),
      navItem("/tools", language === "tr" ? "Araclar" : "Tools"),
      navItem("/reviews", language === "tr" ? "Yorumlar" : "Reviews")
    ],
    [language]
  );

  const signedInLinks = useMemo<NavLinkItem[]>(
    () => [
      navItem("/app/review", language === "tr" ? "Gözden geçir" : "Review"),
      navItem("/app/study-lists", language === "tr" ? "Çalışma listeleri" : "Study lists"),
      ...(!currentUser?.isTeacher ? [navItem("/app/profile", language === "tr" ? "Profil" : "Profile")] : []),
      ...(currentUser?.isTeacher
        ? [
            navItem("/app/teacher", language === "tr" ? "Öğretmen" : "Teacher"),
            navItem("/app/teacher/institution", language === "tr" ? "Kurum analitiği" : "Institution")
          ]
        : []),
      ...(currentUser?.isAdmin
        ? [navItem("/app/institution-admin", language === "tr" ? "Kurum yönetimi" : "Institution admin")]
        : []),
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

        <div className="site-header-desktop desktop-nav">
          <div className="site-header-utility">
            <div className="site-header-subnav">
              {secondaryLinks.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="site-header-actions">
              {!signedIn ? (
                <>
                  <Link className="button button-secondary" href="/auth?mode=signup">
                    {language === "tr" ? "Kayıt ol" : "Sign up"}
                  </Link>
                  <Link className="button button-ghost" href="/auth?mode=signin">
                    {content.nav.signIn}
                  </Link>
                  <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus&coupon=LAUNCH20&campaign=header_cta">
                    {language === "tr" ? "Plus al" : "Get Plus"}
                  </a>
                </>
              ) : (
                <>
                  <div className="notification-bell-wrap" ref={bellRef}>
                    <button
                      className="notification-bell"
                      type="button"
                      aria-label={language === "tr" ? "Bildirimleri aç" : "Open notifications"}
                      aria-expanded={notificationOpen}
                      onClick={() => setNotificationOpen((value) => !value)}
                    >
                      <span className="notification-bell-icon">🔔</span>
                      {notifications.length ? <span className="notification-bell-count">{Math.min(notifications.length, 9)}</span> : null}
                    </button>
                    {notificationOpen ? (
                      <div className="notification-dropdown card">
                        <div className="notification-dropdown-head">
                          <strong>{language === "tr" ? "Bildirimler" : "Notifications"}</strong>
                          <Link href="/app/notifications" onClick={() => setNotificationOpen(false)}>
                            {language === "tr" ? "Tumunu gor" : "View all"}
                          </Link>
                        </div>
                        <div className="notification-dropdown-list">
                          {notifications.length ? (
                            notifications.map((item) => (
                              <a
                                key={item.id}
                                href={item.href ?? "/app/notifications"}
                                className={`notification-dropdown-item is-${item.level}`}
                                onClick={() => setNotificationOpen(false)}
                              >
                                <strong>{item.title}</strong>
                                <span>{item.body}</span>
                              </a>
                            ))
                          ) : (
                            <div className="notification-dropdown-empty">
                              {language === "tr" ? "Su an yeni bildirim yok." : "No new notifications right now."}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <Link className="button button-ghost" href="/app/analytics">
                    {language === "tr" ? "Analitik" : "Analytics"}
                  </Link>
                  <button className="button button-secondary" type="button" onClick={() => void signOut()}>
                    {content.nav.signOut}
                  </button>
                </>
              )}
            </div>
          </div>

          <nav className="site-header-nav">
            {primaryLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            {signedIn
              ? signedInLinks.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))
              : null}
          </nav>

          <div className="site-header-locale">
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
        </div>

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
            {secondaryLinks.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

          <div className="mobile-nav-section">
            <span className="eyebrow">{signedIn ? (language === "tr" ? "Hesap" : "Account") : language === "tr" ? "Daha fazlası" : "More"}</span>
            <div className="mobile-nav-links">
              {signedIn ? (
                <Link href="/app/notifications" onClick={closeMenu}>
                  {language === "tr" ? "Bildirimler" : "Notifications"}
                </Link>
              ) : null}
              {signedIn
                ? signedInLinks.map((item) => (
                    <Link key={item.href} href={item.href} onClick={closeMenu}>
                    {item.label}
                  </Link>
                ))
              : null}
          </div>
        </div>

        <div className="mobile-nav-actions">
          {!signedIn ? (
            <>
              <Link className="button button-secondary" href="/auth?mode=signup" onClick={closeMenu}>
                {language === "tr" ? "Kayıt ol" : "Sign up"}
              </Link>
              <Link className="button button-ghost" href="/auth?mode=signin" onClick={closeMenu}>
                {content.nav.signIn}
              </Link>
              <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus&coupon=LAUNCH20&campaign=header_mobile_cta">
                {language === "tr" ? "Plus al" : "Get Plus"}
              </a>
            </>
          ) : (
            <button className="button button-secondary" type="button" onClick={() => void signOut()}>
              {content.nav.signOut}
            </button>
          )}
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

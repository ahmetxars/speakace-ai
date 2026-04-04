"use client";

import type { Route } from "next";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { copy, languageMeta, localeOptions } from "@/lib/copy";
import { useAppState } from "@/components/providers";
import type { NotificationItem } from "@/lib/notifications";

type NavMenuItem = {
  href: Route;
  label: string;
  description: string;
};

type NavGroup = {
  label: string;
  items: NavMenuItem[];
};

const menuItem = (href: Route, label: string, description: string): NavMenuItem => ({ href, label, description });

export function SiteHeader() {
  const { language, setLanguage, signedIn, currentUser, signOut } = useAppState();
  const content = copy[language];
  const currentLocale = languageMeta[language];
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

  const practiceGroup = useMemo<NavGroup>(
    () => ({
      label: language === "tr" ? "Pratik" : "Practice",
      items: [
        menuItem("/app/practice", language === "tr" ? "Speaking practice" : "Speaking practice", ""),
        menuItem("/tools", language === "tr" ? "Araçlar" : "Tools", ""),
        menuItem("/free-ielts-speaking-test", language === "tr" ? "Ücretsiz test" : "Free test", ""),
        menuItem("/daily-ielts-speaking-prompt", language === "tr" ? "Günlük prompt" : "Daily prompt", "")
      ]
    }),
    [language]
  );

  const exploreGroup = useMemo<NavGroup>(
    () => ({
      label: language === "tr" ? "Keşfet" : "Explore",
      items: [
        menuItem("/resources", language === "tr" ? "Kaynaklar" : "Resources", ""),
        menuItem("/blog", "Blog", ""),
        menuItem("/reviews", language === "tr" ? "Yorumlar" : "Reviews", ""),
        menuItem("/pricing", language === "tr" ? "Fiyatlar" : "Pricing", "")
      ]
    }),
    [language]
  );

  const programsGroup = useMemo<NavGroup>(
    () => ({
      label: language === "tr" ? "Kime uygun" : "Programs",
      items: [
        menuItem("/for-students", language === "tr" ? "Students" : "Students", ""),
        menuItem("/for-teachers", language === "tr" ? "Teachers" : "Teachers", ""),
        menuItem("/for-schools", language === "tr" ? "Schools" : "Schools", ""),
        menuItem("/teacher-demo", language === "tr" ? "Demo class" : "Demo class", "")
      ]
    }),
    [language]
  );

  const aboutGroup = useMemo<NavGroup>(
    () => ({
      label: language === "tr" ? "Hakkımızda" : "About",
      items: [
        menuItem("/about", language === "tr" ? "SpeakAce kimdir?" : "Who is SpeakAce?", ""),
        menuItem("/case-studies", language === "tr" ? "Case studies" : "Case studies", ""),
        menuItem("/success-stories", language === "tr" ? "Başarı hikayeleri" : "Success stories", ""),
        menuItem("/compare", language === "tr" ? "Karşılaştır" : "Compare", "")
      ]
    }),
    [language]
  );

  const mobileGroups = useMemo(
    () => [practiceGroup, exploreGroup, programsGroup, aboutGroup],
    [aboutGroup, exploreGroup, practiceGroup, programsGroup]
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="page-shell site-header-shell">
      <div className="card site-header-card">
        <div className="site-header-brand">
          <Link href="/" className="site-header-logo" onClick={closeMenu}>
            {content.brand}
          </Link>
          <div className="site-header-tagline">
            {language === "tr" ? "IELTS ve TOEFL speaking için yeni nesil AI koçu." : "A next-generation AI coach for IELTS and TOEFL speaking."}
          </div>
          {currentUser ? (
            <div className="site-header-userline">
              {currentUser.name} · {currentUser.plan.toUpperCase()}
              {currentUser.isTeacher ? (language === "tr" ? " · ÖĞRETMEN" : " · TEACHER") : ""}
            </div>
          ) : null}
        </div>

        <div className="site-header-desktop desktop-nav">
          <nav className="site-header-nav site-header-nav-groups">
            {signedIn ? (
              <Link className="site-header-toplink" href="/app">
                {language === "tr" ? "Panel" : "Dashboard"}
              </Link>
            ) : null}

            {[practiceGroup, exploreGroup, programsGroup, aboutGroup].map((group) => (
              <div key={group.label} className="site-header-dropdown site-header-mega">
                <button type="button" className="site-header-dropdown-trigger">
                  {group.label}
                </button>
                <div className="site-header-dropdown-menu card site-header-mega-menu">
                  <div className="site-header-mega-grid">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href} className="site-header-mega-link">
                        <strong>{item.label}</strong>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="site-header-utility">
            <div className="site-header-actions">
              {!signedIn ? (
                <>
                  <Link className="button button-secondary button-header-minor" href="/auth?mode=signup">
                    {language === "tr" ? "Sign up" : "Sign up"}
                  </Link>
                  <Link className="button button-ghost button-header-minor" href="/auth?mode=signin">
                    {content.nav.signIn}
                  </Link>
                  <a className="button button-primary" href="/api/payments/lemon/checkout?plan=plus&coupon=LAUNCH20&campaign=header_cta">
                    {language === "tr" ? "Get Plus" : "Get Plus"}
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
                            {language === "tr" ? "Tümünü gör" : "View all"}
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
                              {language === "tr" ? "Şu an yeni bildirim yok." : "No new notifications right now."}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  <div className="site-header-dropdown site-header-mega">
                    <button type="button" className="button button-secondary button-header-minor">
                      {language === "tr" ? "Hesap" : "Account"}
                    </button>
                    <div className="site-header-dropdown-menu card site-header-mega-menu site-header-account-menu">
                      <div className="site-header-mega-grid">
                        <Link href="/app/profile" className="site-header-mega-link">
                          <strong>{language === "tr" ? "Profil" : "Profile"}</strong>
                        </Link>
                        <Link href="/app/billing" className="site-header-mega-link">
                          <strong>{content.nav.billing}</strong>
                        </Link>
                        <Link href="/app/settings" className="site-header-mega-link">
                          <strong>{content.nav.settings}</strong>
                        </Link>
                        {currentUser?.isTeacher ? (
                          <Link href="/app/teacher" className="site-header-mega-link">
                            <strong>{language === "tr" ? "Teacher" : "Teacher"}</strong>
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <button className="button button-ghost button-header-minor" type="button" onClick={() => void signOut()}>
                    {content.nav.signOut}
                  </button>
                </>
              )}
            </div>
            <div className="site-header-dropdown site-header-locale-dropdown">
              <button className="button button-locale button-locale-trigger" type="button" aria-label="Change language">
                <span className="button-locale-flag" aria-hidden="true">{currentLocale.flag}</span>
                <span>{currentLocale.code.toUpperCase()}</span>
              </button>
              <div className="site-header-dropdown-menu card site-header-locale-menu">
                {localeOptions.map((locale) => (
                  <button
                    key={locale.code}
                    className="site-header-locale-option"
                    type="button"
                    onClick={() => setLanguage(locale.code)}
                    data-active={language === locale.code}
                  >
                    <span aria-hidden="true">{locale.flag}</span>
                    <span>{locale.nativeLabel}</span>
                  </button>
                ))}
              </div>
            </div>
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

      {menuOpen ? <div className="mobile-nav-overlay is-open" onClick={closeMenu} /> : null}
      {menuOpen ? (
      <aside className="mobile-nav-panel is-open">
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

        {signedIn ? (
          <div className="mobile-nav-section">
            <span className="eyebrow">{language === "tr" ? "Hızlı giriş" : "Quick access"}</span>
            <div className="mobile-nav-links">
              <Link href="/app" onClick={closeMenu}>
                {language === "tr" ? "Panel" : "Dashboard"}
              </Link>
            </div>
          </div>
        ) : null}

        {mobileGroups.map((group) => (
          <div key={group.label} className="mobile-nav-section">
            <span className="eyebrow">{group.label}</span>
            <div className="mobile-nav-links">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMenu}>
                  <strong>{item.label}</strong>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {signedIn ? (
          <div className="mobile-nav-section">
            <span className="eyebrow">{language === "tr" ? "Hesap" : "Account"}</span>
            <div className="mobile-nav-links">
              <Link href="/app/profile" onClick={closeMenu}>
                {language === "tr" ? "Profil" : "Profile"}
              </Link>
              <Link href="/app/billing" onClick={closeMenu}>
                {content.nav.billing}
              </Link>
              <Link href="/app/settings" onClick={closeMenu}>
                {content.nav.settings}
              </Link>
              <Link href="/app/notifications" onClick={closeMenu}>
                {language === "tr" ? "Bildirimler" : "Notifications"}
              </Link>
              {currentUser?.isTeacher ? (
                <Link href="/app/teacher" onClick={closeMenu}>
                  {language === "tr" ? "Öğretmen paneli" : "Teacher panel"}
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

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

        <div className="mobile-language-switch mobile-language-grid">
          {localeOptions.map((locale) => (
            <button
              key={locale.code}
              className="button button-locale mobile-language-option"
              type="button"
              onClick={() => setLanguage(locale.code)}
              data-active={language === locale.code}
            >
              <span aria-hidden="true">{locale.flag}</span>
              <span>{locale.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </aside>
      ) : null}
    </header>
  );
}

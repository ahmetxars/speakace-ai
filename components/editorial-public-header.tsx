"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpenText,
  ChevronDown,
  GraduationCap,
  Layers3,
  LockKeyhole,
  UsersRound,
} from "lucide-react";
import { useAppState } from "@/components/providers";
import {
  normalizePublicLanguage,
  publicLocaleOptions,
  type Language,
} from "@/lib/copy";
import { publicDesignCopy } from "@/lib/public-design-copy";
import { resolveDashboardRole } from "@/lib/roles";
import { PublicBrand } from "@/components/public/brand";

type Menu = "audience" | "resources";

export function EditorialPublicHeader({
  home = false,
  account = false,
}: {
  home?: boolean;
  account?: boolean;
}) {
  const { language, setLanguage, signedIn, currentUser } = useAppState();
  const locale = normalizePublicLanguage(language);
  const t = publicDesignCopy[locale];
  const pathname = usePathname();
  const previousPathname = useRef(pathname);
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const id = useId();
  const [menu, setMenu] = useState<Menu | null>(null);
  const [mobileGroup, setMobileGroup] = useState<Menu | null>(null);
  const [mobile, setMobile] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const role = resolveDashboardRole(currentUser);
  const dashboard =
    role === "teacher"
      ? "/app/teacher"
      : role === "school"
        ? "/app/institution-admin"
        : "/app";
  const close = () => {
    setMenu(null);
    setMobileGroup(null);
    setMobile(false);
  };

  useEffect(() => {
    setEnhanced(true);
  }, []);
  useEffect(() => {
    if (previousPathname.current === pathname) return;
    previousPathname.current = pathname;
    setMenu(null);
    setMobileGroup(null);
    setMobile(false);
  }, [pathname]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) {
        setMenu(null);
        setMobileGroup(null);
        setMobile(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);

  const audiences = [
    {
      href: "/for-students",
      title: t.students,
      note: t.studentsNote,
      icon: GraduationCap,
    },
    {
      href: "/for-teachers",
      title: t.teachers,
      note: t.teachersNote,
      icon: UsersRound,
    },
    {
      href: "/for-schools",
      title: t.schools,
      note: t.schoolsNote,
      icon: Layers3,
    },
  ] as const;
  const resources = [
    { href: "/resources", title: t.library },
    { href: "/blog", title: t.blog },
    { href: "/ielts-speaking-topics", title: t.topics },
    { href: "/free-ielts-speaking-test", title: t.freeTest },
    { href: "/tools", title: t.tools },
  ] as const;

  const disclosure = (kind: Menu, inMobile = false) => {
    const open = inMobile ? mobileGroup === kind : menu === kind;
    const panelId = id + (inMobile ? "-mobile-" : "-desktop-") + kind;
    const set = (value: Menu | null) =>
      inMobile ? setMobileGroup(value) : setMenu(value);
    const clicked = (event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
      set(open ? null : kind);
    };
    const key = (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== "ArrowDown") return;
      event.preventDefault();
      set(kind);
      requestAnimationFrame(() =>
        document
          .getElementById(panelId)
          ?.querySelector<HTMLAnchorElement>("a")
          ?.focus(),
      );
    };
    return (
      <details
        className={"public-nav-disclosure" + (inMobile ? " is-mobile" : "")}
        open={open}
      >
        <summary
          onClick={clicked}
          onKeyDown={key}
          aria-expanded={enhanced ? open : undefined}
          aria-controls={panelId}
          aria-label={kind === "resources" ? t.resourceMenu : undefined}
          data-active={
            (kind === "audience" &&
              audiences.some((item) => item.href === pathname)) ||
            undefined
          }
        >
          {kind === "audience" ? t.forYou : null}
          <ChevronDown size={12} aria-hidden="true" />
        </summary>
        <div id={panelId} className="public-menu-panel" data-nav-panel>
          {kind === "audience" ? (
            audiences.map(({ href, title, note, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={close}
                aria-current={pathname === href ? "page" : undefined}
              >
                <span className="public-menu-icon">
                  <Icon size={19} />
                </span>
                <span>
                  <strong>{title}</strong>
                  <small>{note}</small>
                </span>
                <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            ))
          ) : (
            <>
              <span className="public-menu-label">{t.learn}</span>
              {resources.slice(0, 3).map(({ href, title }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  <BookOpenText size={16} aria-hidden="true" />
                  <span>{title}</span>
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              ))}
              <span className="public-menu-label">{t.practiceTools}</span>
              {resources.slice(3).map(({ href, title }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={close}
                  aria-current={pathname === href ? "page" : undefined}
                >
                  <span>{title}</span>
                  <ArrowUpRight size={13} aria-hidden="true" />
                </Link>
              ))}
            </>
          )}
        </div>
      </details>
    );
  };

  const keyNavigation = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && (menu || mobile)) {
      const trigger = root.current?.querySelector<HTMLElement>(
        "details[open] > summary",
      );
      close();
      if (mobile) toggle.current?.focus();
      else trigger?.focus();
      event.preventDefault();
      return;
    }
    const panel = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-nav-panel]",
    );
    if (!panel || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
      return;
    const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>("a"));
    const index = links.indexOf(event.target as HTMLAnchorElement);
    if (index < 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? links.length - 1
          : (index + (event.key === "ArrowUp" ? -1 : 1) + links.length) %
            links.length;
    links[next]?.focus();
  };
  const localeOptions = home
    ? publicLocaleOptions.filter(
        (item) =>
          item.code === "en" || item.code === "tr" || item.code === locale,
      )
    : publicLocaleOptions;
  const localePicker = (mobilePicker = false) => (
    <select
      aria-label={mobilePicker ? t.language + " · mobile" : t.language}
      value={locale}
      onChange={(event) => setLanguage(event.target.value as Language)}
    >
      {localeOptions.map((item) => (
        <option key={item.code} value={item.code}>
          {mobilePicker ? item.nativeLabel : item.code.toUpperCase()}
        </option>
      ))}
    </select>
  );

  return (
    <div
      className="public-chrome"
      ref={root}
      data-keyboard={keyboard || undefined}
      onKeyDownCapture={() => setKeyboard(true)}
      onPointerDownCapture={() => setKeyboard(false)}
      onKeyDown={keyNavigation}
      onBlur={(event) => {
        if (
          event.relatedTarget &&
          !event.currentTarget.contains(event.relatedTarget as Node)
        ) {
          setMenu(null);
          setMobileGroup(null);
        }
      }}
    >
      <header
        className={
          "public-header site-header wrap" + (account ? " is-account" : "")
        }
      >
        <div className="public-header-inner">
          <PublicBrand />
          {account ? (
            <>
              <span className="public-account-trust">
                <LockKeyhole size={14} />
                {t.secure}
              </span>
              <div className="public-header-actions">
                {localePicker()}
                <Link className="public-back" href="/">
                  <ArrowLeft size={15} />
                  {t.back}
                </Link>
              </div>
            </>
          ) : (
            <>
              <nav className="public-main-nav" aria-label="Main navigation">
                <Link
                  href={home ? "#practice" : "/#practice"}
                  aria-label={t.practiceLabel}
                >
                  {t.practice}
                </Link>
                {disclosure("audience")}
                <Link
                  href="/pricing"
                  aria-current={pathname === "/pricing" ? "page" : undefined}
                >
                  {t.plans}
                </Link>
                <div className="public-resource-nav">
                  <Link
                    href="/resources"
                    aria-current={
                      pathname?.startsWith("/resources") ? "page" : undefined
                    }
                  >
                    {t.resources}
                    <span className="public-resource-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                  {disclosure("resources")}
                </div>
              </nav>
              <div className="header-actions public-header-actions">
                <span className="public-desktop-locale">{localePicker()}</span>
                {!signedIn && (
                  <Link
                    className="sign-in public-signin"
                    href="/auth?mode=signin"
                  >
                    {t.signin}
                  </Link>
                )}
                <Link
                  className="button small public-button public-start"
                  href={signedIn ? dashboard : "/app/practice"}
                  aria-label={signedIn ? t.dashboard : t.start}
                >
                  <span className="public-start-label">
                    {signedIn ? t.dashboard : t.start}
                  </span>
                  <span className="public-start-short" aria-hidden="true">
                    {signedIn
                      ? {
                          en: "My account",
                          tr: "Hesabım",
                          de: "Übersicht",
                          es: "Mi cuenta",
                          fr: "Mon espace",
                        }[locale]
                      : {
                          en: "Start free",
                          tr: "Başla",
                          de: "Starten",
                          es: "Empezar",
                          fr: "Commencer",
                        }[locale]}
                  </span>
                  <span className="public-start-arrow" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </div>
              <button
                ref={toggle}
                type="button"
                className="menu-button public-menu-toggle"
                aria-label={mobile ? t.close : t.open}
                aria-expanded={mobile}
                aria-controls={id + "-mobile-nav"}
                onClick={() => {
                  setMobile(!mobile);
                  setMenu(null);
                }}
              >
                <span />
                <span />
              </button>
            </>
          )}
        </div>
      </header>
      {!account && (
        <nav
          className="mobile-nav public-mobile-nav"
          id={id + "-mobile-nav"}
          aria-label="Mobile navigation"
          hidden={!mobile}
        >
          <Link href={home ? "#practice" : "/#practice"} onClick={close}>
            {t.practice}
          </Link>
          {disclosure("audience", true)}
          <Link href="/pricing" onClick={close}>
            {t.plans}
          </Link>
          <div className="public-mobile-resource-heading">
            <Link href="/resources" onClick={close}>
              {t.resources}
            </Link>
            {disclosure("resources", true)}
          </div>
          <label className="public-mobile-language">
            {t.language}
            {localePicker(true)}
          </label>
          <Link
            href={signedIn ? dashboard : "/auth?mode=signin"}
            onClick={close}
          >
            {signedIn ? t.dashboard : t.signin}
          </Link>
        </nav>
      )}
    </div>
  );
}

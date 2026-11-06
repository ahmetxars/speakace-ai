"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ArrowUpRight, Bell, BookOpen, ChevronDown, CircleUserRound, LayoutDashboard, LogOut, Mic, Moon, PenLine, Settings2, Sun, Target, TrendingUp } from "lucide-react";
import { useAppState } from "@/components/providers";
import { publicLocaleOptions, type Language } from "@/lib/copy";
import { PublicBrand } from "@/components/public/brand";
import { resolveDashboardRole } from "@/lib/roles";

export function WorkspaceHeader() {
  const pathname = usePathname();
  const { language, setLanguage, theme, setTheme, currentUser, signedIn, signOut } = useAppState();
  const tr = language === "tr";
  const role = resolveDashboardRole(currentUser);
  const menuRef = useRef<HTMLDetailsElement>(null);
  const home: Route = role === "school" ? "/app/institution-admin" : role === "teacher" ? "/app/teacher" : "/app";
  const studentLinks = [
    { href: "/app", label: tr ? "Genel bakış" : "Overview", icon: LayoutDashboard },
    { href: "/app/practice", label: tr ? "Konuşma" : "Speaking", icon: Mic },
    { href: "/app/writing", label: tr ? "Yazma" : "Writing", icon: PenLine },
    { href: "/app/review", label: tr ? "Sonuçlarım" : "My results", icon: TrendingUp },
    { href: "/app/plan", label: tr ? "Çalışma planı" : "Study plan", icon: Target },
    { href: "/app/study-lists", label: tr ? "Kütüphanem" : "My library", icon: BookOpen }
  ];
  const links = role === "school" ? [
    { href: "/app/institution-admin", label: tr ? "Kurum paneli" : "Institution", icon: LayoutDashboard },
    { href: "/app/billing", label: tr ? "Üyelik" : "Membership", icon: CircleUserRound },
    { href: "/app/settings", label: tr ? "Ayarlar" : "Settings", icon: Settings2 }
  ] : role === "teacher" ? [
    { href: "/app/teacher", label: tr ? "Sınıflarım" : "My classes", icon: LayoutDashboard },
    { href: "/app/teacher/compare", label: tr ? "Öğrenci karşılaştır" : "Compare learners", icon: TrendingUp },
    { href: "/app/teacher/billing", label: tr ? "Üyelik" : "Membership", icon: CircleUserRound },
    { href: "/app/settings", label: tr ? "Ayarlar" : "Settings", icon: Settings2 }
  ] : studentLinks;
  const active = (href: string) => {
    if (href === "/app" || href === "/app/teacher") return pathname === href;
    if (href === "/app/review" && ["/app/results/", "/app/improve", "/app/analytics"].some((path) => pathname?.startsWith(path))) return true;
    if (href === "/app/practice" && pathname === "/app/mock-exam") return true;
    return pathname === href || pathname?.startsWith(href + "/");
  };

  useEffect(() => { if (menuRef.current) menuRef.current.open = false; }, [pathname]);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) menuRef.current.open = false;
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <header className="workspace-header" onKeyDown={(event) => { if (event.key === "Escape" && menuRef.current?.open) { menuRef.current.open = false; menuRef.current.querySelector("summary")?.focus(); } }}>
      <a className="workspace-skip" href="#workspace-main">{tr ? "İçeriğe geç" : "Skip to content"}</a>
      <div className="workspace-topbar">
        <PublicBrand className="workspace-brand"/>
        <span className="workspace-edition">{role === "school" ? (tr ? "Kurum alanı" : "Institution workspace") : role === "teacher" ? (tr ? "Öğretmen alanı" : "Teaching workspace") : (tr ? "Kişisel çalışma alanın" : "Your learning workspace")}</span>
        <div className="workspace-tools">
          <Link className="workspace-resource-link" href="/resources">{tr ? "Kaynaklar" : "Resources"}<ArrowUpRight size={14} /></Link>
          <select aria-label={tr ? "Arayüz dili" : "Interface language"} value={tr ? "tr" : "en"} title={tr ? "Çalışma alanı: Türkçe ve İngilizce. Kaynaklar: beş dil." : "Workspace: English and Turkish. Resources: five languages."} onChange={(event) => setLanguage(event.target.value as Language)}>
            {publicLocaleOptions.map((locale) => <option value={locale.code} key={locale.code} disabled={locale.code !== "en" && locale.code !== "tr"}>{locale.code.toUpperCase()}</option>)}
          </select>
          <button className="workspace-icon-button" type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={tr ? (theme === "dark" ? "Açık tema" : "Koyu tema") : (theme === "dark" ? "Light theme" : "Dark theme")}>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link href="/app/notifications" className="workspace-icon-button" aria-label={tr ? "Bildirimler" : "Notifications"}><Bell size={18} /></Link>
          <details className="workspace-account" ref={menuRef}>
            <summary><span className="workspace-avatar">{currentUser?.name?.trim().charAt(0).toUpperCase() || "S"}</span><span className="workspace-account-name">{currentUser?.name?.split(" ")[0] || (tr ? "Hesabım" : "My account")}</span><ChevronDown size={13} /></summary>
            <div className="workspace-account-menu">
              <div className="workspace-account-caption">{currentUser?.name || "SpeakAce"}<small>{currentUser?.plan?.toUpperCase() || "FREE"}</small></div>
              <Link href={home}>{tr ? "Çalışma alanım" : "My workspace"}</Link>
              {role === "student" ? <Link href="/app/profile">{tr ? "Profilim" : "My profile"}</Link> : null}
              {role === "student" ? <>
                <Link href="/app/improve">{tr ? "Gelişim koçu" : "Improvement coach"}</Link>
                <Link href="/app/analytics">{tr ? "Çalışma istatistikleri" : "Practice analytics"}</Link>
              </> : null}
              <Link href="/app/settings">{tr ? "Ayarlar" : "Settings"}</Link>
              <Link href={role === "teacher" ? "/app/teacher/billing" : "/app/billing"}>{tr ? "Üyelik ve ödemeler" : "Membership & billing"}</Link>
              {currentUser?.isAdmin ? <Link href="/admin">{tr ? "Site yönetimi" : "Site administration"}</Link> : null}
              {signedIn ? <button type="button" onClick={() => { void signOut(); }}><LogOut size={14} />{tr ? "Çıkış yap" : "Sign out"}</button> : <Link href="/auth?mode=signin">{tr ? "Giriş yap" : "Sign in"}</Link>}
            </div>
          </details>
        </div>
      </div>
      <div className="workspace-navigation-wrap"><nav className="workspace-navigation" aria-label={tr ? "Çalışma alanı gezinme" : "Workspace navigation"}>
        {links.map(({ href, label, icon: Icon }) => <Link key={href} href={href as Route} aria-current={active(href) ? "page" : undefined}><Icon size={16} strokeWidth={1.6} /><span>{label}</span></Link>)}
        {role === "student" || role === "guest" ? <Link className="workspace-profile-link" href="/app/profile" aria-current={pathname === "/app/profile" ? "page" : undefined}><CircleUserRound size={16} strokeWidth={1.6} /><span>{tr ? "Profilim" : "My profile"}</span></Link> : null}
      </nav></div>
    </header>
  );
}

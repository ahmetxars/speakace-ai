"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, FileText, Home, Layers, Mic, PenLine, Scale, Target } from "lucide-react";
import { useAppState } from "@/components/providers";
import { resolveDashboardRole } from "@/lib/roles";

type NavItem = {
  href: Route;
  en: string;
  tr: string;
  icon: React.ReactNode;
};

const navIcon = (href: Route, en: string, tr: string, icon: React.ReactNode): NavItem => ({
  href,
  en,
  tr,
  icon,
});

export function AppMobileNav() {
  const pathname = usePathname();
  const { language, currentUser, signedIn } = useAppState();
  const tr = language === "tr";
  const dashboardRole = resolveDashboardRole(currentUser);

  if (!signedIn) {
    return null;
  }

  const studentItems: NavItem[] = [
    navIcon("/app", "Home", "Ana sayfa", <Home size={18} strokeWidth={2} />),
    navIcon("/app/practice", "Speaking", "Konuşma", <Mic size={18} strokeWidth={2} />),
    navIcon("/app/writing", "Writing", "Yazma", <PenLine size={18} strokeWidth={2} />),
    navIcon("/app/review", "Review", "Gözden geç", <BookOpen size={18} strokeWidth={2} />),
    navIcon("/app/improve", "Improve", "Gelişim", <Layers size={18} strokeWidth={2} />),
    navIcon("/app/plan", "Plan", "Plan", <Target size={18} strokeWidth={2} />),
    navIcon("/app/profile", "Profile", "Profil", <ClipboardList size={18} strokeWidth={2} />),
  ];

  const teacherItems: NavItem[] = [
    navIcon("/app/teacher", "Teaching", "Sınıf", <ClipboardList size={18} strokeWidth={2} />),
    navIcon("/app/teacher/compare", "Compare", "Kıyasla", <Scale size={18} strokeWidth={2} />),
    navIcon("/app/teacher/billing", "Billing", "Fatura", <FileText size={18} strokeWidth={2} />),
    navIcon("/app/settings", "Settings", "Ayarlar", <Layers size={18} strokeWidth={2} />),
  ];

  const schoolItems: NavItem[] = [
    navIcon("/app/institution-admin", "Admin", "Kurum", <ClipboardList size={18} strokeWidth={2} />),
    navIcon("/app/billing", "Billing", "Fatura", <FileText size={18} strokeWidth={2} />),
    navIcon("/app/settings", "Settings", "Ayarlar", <Layers size={18} strokeWidth={2} />),
  ];

  const items =
    dashboardRole === "school"
      ? schoolItems
      : dashboardRole === "teacher"
        ? teacherItems
        : studentItems;

  return (
    <nav className="app-mobile-nav" aria-label="App navigation">
      {items.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/app" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`app-mobile-nav-link${active ? " is-active" : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span className="app-mobile-nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="app-mobile-nav-label">{tr ? item.tr : item.en}</span>
          </Link>
        );
      })}
    </nav>
  );
}

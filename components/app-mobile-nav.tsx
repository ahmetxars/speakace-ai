"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/components/providers";

const navItem = (href: Route, en: string, tr: string, icon: string) => ({ href, en, tr, icon });

export function AppMobileNav() {
  const pathname = usePathname();
  const { language, currentUser } = useAppState();
  const tr = language === "tr";
  const accountHref =
    currentUser?.memberType === "school"
      ? "/app/institution-admin"
      : currentUser?.isTeacher || currentUser?.memberType === "teacher"
        ? "/app/teacher"
        : "/app/profile";
  const accountLabelEn =
    currentUser?.memberType === "school"
      ? "School"
      : currentUser?.isTeacher || currentUser?.memberType === "teacher"
        ? "Teacher"
        : "Profile";
  const accountLabelTr =
    currentUser?.memberType === "school"
      ? "Kurum"
      : currentUser?.isTeacher || currentUser?.memberType === "teacher"
        ? "Öğretmen"
        : "Profil";

  const items = [
    navItem("/app", "Home", "Ana sayfa", "•"),
    navItem("/app/improve", "Improve", "Gelisim", "✦"),
    navItem("/app/practice", "Practice", "Practice", "◦"),
    navItem("/app/review", "Review", "Gözden geçir", "△"),
    navItem("/app/plan", "Plan", "Plan", "◇"),
    navItem(accountHref, accountLabelEn, accountLabelTr, "☰")
  ];

  return (
    <nav className="app-mobile-nav">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href} className={`app-mobile-nav-link ${active ? "is-active" : ""}`}>
            <span className="app-mobile-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{tr ? item.tr : item.en}</span>
          </Link>
        );
      })}
    </nav>
  );
}

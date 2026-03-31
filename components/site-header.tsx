"use client";

import Link from "next/link";
import { copy } from "@/lib/copy";
import { commerceConfig } from "@/lib/commerce";
import { useAppState } from "@/components/providers";

export function SiteHeader() {
  const { language, setLanguage, signedIn, currentUser, signOut } = useAppState();
  const content = copy[language];

  return (
    <header className="page-shell" style={{ padding: "1.2rem 0 0.5rem" }}>
      <div
        className="card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          padding: "1rem 1.2rem",
          flexWrap: "wrap"
        }}
      >
        <div>
          <Link href="/" style={{ fontWeight: 800, fontSize: "1.2rem" }}>
            {content.brand}
          </Link>
          <div style={{ color: "var(--muted)", fontSize: "0.95rem", marginTop: "0.2rem" }}>{content.tagline}</div>
          {currentUser ? (
            <div style={{ color: "var(--accent-cool)", fontSize: "0.85rem", marginTop: "0.35rem" }}>
              {currentUser.name} · {currentUser.plan.toUpperCase()}{currentUser.isTeacher ? language === "tr" ? " · ÖĞRETMEN" : " · TEACHER" : ""}
            </div>
          ) : null}
        </div>

        <nav style={{ display: "flex", gap: "0.9rem", alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/app/practice">{content.nav.practice}</Link>
          {signedIn ? <Link href="/app">{content.nav.dashboard}</Link> : <Link href="/pricing">{content.nav.pricing}</Link>}
          <Link href="/resources">{language === "tr" ? "Kaynaklar" : "Resources"}</Link>
          <Link href="/blog">{language === "tr" ? "Blog" : "Blog"}</Link>
          {!signedIn ? <Link href="/for-teachers">{language === "tr" ? "Öğretmenler için" : "For teachers"}</Link> : null}
          {!signedIn ? <Link href="/for-schools">{language === "tr" ? "Kurumlar için" : "For schools"}</Link> : null}
          {signedIn && !currentUser?.isTeacher ? <Link href="/app/profile">{language === "tr" ? "Profil" : "Profile"}</Link> : null}
          {signedIn ? <Link href="/app/notifications">{language === "tr" ? "Bildirimler" : "Notifications"}</Link> : null}
          {signedIn ? <Link href="/app/analytics">{language === "tr" ? "Analitik" : "Analytics"}</Link> : null}
          {signedIn && currentUser?.isTeacher ? <Link href="/app/teacher">{language === "tr" ? "Öğretmen" : "Teacher"}</Link> : null}
          {signedIn && currentUser?.isTeacher ? <Link href="/app/teacher/billing">{language === "tr" ? "Kurum" : "Institution"}</Link> : null}
          {signedIn && currentUser?.isTeacher ? <Link href="/app/teacher/institution">{language === "tr" ? "Kurum analitiği" : "Analytics"}</Link> : null}
          {signedIn && currentUser?.isAdmin ? <Link href="/app/institution-admin">{language === "tr" ? "Kurum yönetimi" : "Institution admin"}</Link> : null}
          {signedIn ? <Link href="/app/study-lists">{language === "tr" ? "Çalışma listeleri" : "Study lists"}</Link> : null}
          {signedIn ? <Link href="/app/review">{language === "tr" ? "Gözden geçir" : "Review"}</Link> : null}
          {signedIn ? <Link href="/app/billing">{content.nav.billing}</Link> : null}
          <Link href="/app/settings">{content.nav.settings}</Link>
          {!signedIn ? (
            <a className="button button-primary" href={commerceConfig.plusCheckoutPath} style={{ padding: "0.55rem 0.9rem" }}>
              {language === "tr" ? "Plus al" : "Get Plus"}
            </a>
          ) : null}
          {signedIn ? (
            <button className="button button-secondary" type="button" onClick={() => void signOut()} style={{ padding: "0.55rem 0.9rem" }}>
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
      </div>
    </header>
  );
}

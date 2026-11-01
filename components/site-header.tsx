"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Globe, LockKeyhole } from "lucide-react";
import { EditorialPublicHeader } from "@/components/editorial-public-header";
import { WorkspaceHeader } from "@/components/workspace-header";
import { useAppState } from "@/components/providers";
import { normalizePublicLanguage, publicLocaleOptions, type Language, type PublicLanguage } from "@/lib/copy";

const authHeaderLabels: Record<PublicLanguage, { back: string; secure: string; language: string }> = {
  en: { back: "Back home", secure: "Secure account access", language: "Language" },
  tr: { back: "Ana sayfaya dön", secure: "Güvenli hesap erişimi", language: "Dil" },
  de: { back: "Zur Startseite", secure: "Sicherer Kontozugang", language: "Sprache" },
  es: { back: "Volver al inicio", secure: "Acceso seguro a tu cuenta", language: "Idioma" },
  fr: { back: "Retour à l’accueil", secure: "Accès sécurisé au compte", language: "Langue" }
};

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const { language, setLanguage } = useAppState();
  const publicLanguage = normalizePublicLanguage(language);
  const labels = authHeaderLabels[publicLanguage];
  if (pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/maintenance")) return null;
  if (pathname === "/app" || pathname.startsWith("/app/")) return <WorkspaceHeader />;
  if (!pathname.startsWith("/auth")) return <EditorialPublicHeader />;
  return (
    <header className="auth-site-header">
      <div className="auth-site-header-inner">
        <Link href="/" className="auth-site-brand" aria-label="SpeakAce home">
          <span className="auth-site-brand-mark" aria-hidden="true">≋</span>
          <span className="auth-wordmark">SpeakAce<span>.</span></span>
        </Link>
        <span className="auth-site-trust"><LockKeyhole size={14} />{labels.secure}</span>
        <div className="auth-site-actions">
          <label className="auth-site-locale" aria-label={labels.language}>
            <Globe size={15} aria-hidden="true" />
            <select value={publicLanguage} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={labels.language}>
              {publicLocaleOptions.map((item) => <option key={item.code} value={item.code}>{item.nativeLabel}</option>)}
            </select>
          </label>
          <Link href="/" className="auth-site-back"><ArrowLeft size={15} />{labels.back}</Link>
        </div>
      </div>
    </header>
  );
}

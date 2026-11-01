"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { siteConfig } from "@/lib/site";

import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";
import { useAppState } from "@/components/providers";

type FooterText = {
  tagline: string;
  newsletterTitle: string;
  newsletterBody: string;
  subscribe: string;
  subscribed: string;
  retry: string;
  product: string;
  resources: string;
  programs: string;
  legal: string;
  start: string;
  plus: string;
  practice: string;
  pricing: string;
  freeTest: string;
  tools: string;
  resourcesLink: string;
  blog: string;
  topics: string;
  reviews: string;
  students: string;
  teachers: string;
  schools: string;
  demoClass: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  weeklyLabel: string;
  copyright: string;
};

const footerText: Record<PublicLanguage, FooterText> = {
  en: {
    tagline: "Master IELTS and TOEFL speaking with AI-powered feedback.",
    newsletterTitle: "Get the IELTS Speaking score diagnostic",
    newsletterBody:
      "Get the 4-part guide first; confirm inside it to activate three short score-and-retry emails.",
    subscribe: "Subscribe",
    subscribed: "Thanks, you're in",
    retry: "Try again",
    product: "Product",
    resources: "Resources",
    programs: "Programs",
    legal: "Legal",
    start: "Start Practice",
    plus: "Get Plus",
    practice: "Practice",
    pricing: "Pricing",
    freeTest: "Free test",
    tools: "Tools",
    resourcesLink: "Resources",
    blog: "Blog",
    topics: "IELTS topics",
    reviews: "Reviews",
    students: "Students",
    teachers: "Teachers",
    schools: "Schools",
    demoClass: "Demo class",
    about: "About",
    contact: "Contact",
    privacy: "Privacy policy",
    terms: "Terms of service",
    weeklyLabel: "Free score guide",
    copyright: "All rights reserved.",
  },
  tr: {
    tagline:
      "Yapay zeka destekli geri bildirimle IELTS ve TOEFL speaking'i geliştir.",
    newsletterTitle: "IELTS Speaking skor analiz rehberini al",
    newsletterBody:
      "Önce 4 bölümlük rehberi al; üç kısa takip e-postasını açmak için içinden onayla.",
    subscribe: "Abone ol",
    subscribed: "Tamam, eklendin",
    retry: "Tekrar dene",
    product: "Ürün",
    resources: "Kaynaklar",
    programs: "Programlar",
    legal: "Yasal",
    start: "Pratiğe başla",
    plus: "Plus al",
    practice: "Pratik",
    pricing: "Fiyatlar",
    freeTest: "Ücretsiz test",
    tools: "Araçlar",
    resourcesLink: "Kaynaklar",
    blog: "Blog",
    topics: "IELTS konuları",
    reviews: "Yorumlar",
    students: "Öğrenciler",
    teachers: "Öğretmenler",
    schools: "Kurumlar",
    demoClass: "Demo sınıf",
    about: "Hakkımızda",
    contact: "İletişim",
    privacy: "Gizlilik politikası",
    terms: "Kullanım koşulları",
    weeklyLabel: "Ücretsiz skor rehberi",
    copyright: "Tüm hakları saklıdır.",
  },
  de: {
    tagline: "Verbessere IELTS- und TOEFL-Sprechen mit KI-gestütztem Feedback.",
    newsletterTitle: "Hol dir die IELTS-Sprechdiagnose",
    newsletterBody:
      "Du erhältst zuerst den 4-Teile-Leitfaden; bestätige darin drei kurze Folge-E-Mails.",
    subscribe: "Abonnieren",
    subscribed: "Du bist dabei",
    retry: "Erneut versuchen",
    product: "Produkt",
    resources: "Ressourcen",
    programs: "Programme",
    legal: "Rechtliches",
    start: "Übung starten",
    plus: "Plus holen",
    practice: "Üben",
    pricing: "Preise",
    freeTest: "Gratis-Test",
    tools: "Tools",
    resourcesLink: "Ressourcen",
    blog: "Blog",
    topics: "IELTS-Themen",
    reviews: "Bewertungen",
    students: "Lernende",
    teachers: "Lehrkräfte",
    schools: "Schulen",
    demoClass: "Demo-Klasse",
    about: "Über uns",
    contact: "Kontakt",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    weeklyLabel: "Kostenloser Score-Leitfaden",
    copyright: "Alle Rechte vorbehalten.",
  },
  es: {
    tagline: "Mejora tu speaking de IELTS y TOEFL con feedback de IA.",
    newsletterTitle: "Recibe el diagnóstico de IELTS Speaking",
    newsletterBody:
      "Recibe primero la guía de 4 partes y confirma dentro si quieres tres emails breves.",
    subscribe: "Suscribirme",
    subscribed: "Ya estás dentro",
    retry: "Intentar de nuevo",
    product: "Producto",
    resources: "Recursos",
    programs: "Programas",
    legal: "Legal",
    start: "Empezar práctica",
    plus: "Obtener Plus",
    practice: "Practicar",
    pricing: "Precios",
    freeTest: "Prueba gratis",
    tools: "Herramientas",
    resourcesLink: "Recursos",
    blog: "Blog",
    topics: "Temas IELTS",
    reviews: "Opiniones",
    students: "Estudiantes",
    teachers: "Profesores",
    schools: "Escuelas",
    demoClass: "Clase demo",
    about: "Nosotros",
    contact: "Contacto",
    privacy: "Privacidad",
    terms: "Términos del servicio",
    weeklyLabel: "Guía de puntuación gratis",
    copyright: "Todos los derechos reservados.",
  },
  fr: {
    tagline: "Progressez à l’oral IELTS et TOEFL avec un feedback IA.",
    newsletterTitle: "Reçois le diagnostic IELTS Speaking",
    newsletterBody:
      "Recevez d’abord le guide en 4 parties, puis confirmez-y trois courts e-mails de suivi.",
    subscribe: "S’abonner",
    subscribed: "Vous êtes inscrit",
    retry: "Réessayer",
    product: "Produit",
    resources: "Ressources",
    programs: "Programmes",
    legal: "Légal",
    start: "Commencer",
    plus: "Obtenir Plus",
    practice: "Pratique",
    pricing: "Tarifs",
    freeTest: "Test gratuit",
    tools: "Outils",
    resourcesLink: "Ressources",
    blog: "Blog",
    topics: "Sujets IELTS",
    reviews: "Avis",
    students: "Étudiants",
    teachers: "Enseignants",
    schools: "Écoles",
    demoClass: "Classe démo",
    about: "À propos",
    contact: "Contact",
    privacy: "Confidentialité",
    terms: "Conditions d’utilisation",
    weeklyLabel: "Guide de score gratuit",
    copyright: "Tous droits réservés.",
  },
};

export function SiteFooter() {
  const pathname = usePathname();
  const { language } = useAppState();

  if (
    pathname?.startsWith("/app") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/auth")
  ) {
    return null;
  }

  const t = footerText[normalizePublicLanguage(language)];
  const currentYear = new Date().getFullYear();

  const linkGroups = [
    {
      title: t.product,
      links: [
        { href: "/app/practice", label: t.practice },
        { href: "/pricing", label: t.pricing },
        { href: "/free-ielts-speaking-test", label: t.freeTest },
        { href: "/tools", label: t.tools },
      ],
    },
    {
      title: t.resources,
      links: [
        { href: "/resources", label: t.resourcesLink },
        { href: "/blog", label: t.blog },
        { href: "/ielts-speaking-topics", label: t.topics },
        { href: "/reviews", label: t.reviews },
      ],
    },
    {
      title: t.programs,
      links: [
        { href: "/for-students", label: t.students },
        { href: "/for-teachers", label: t.teachers },
        { href: "/for-schools", label: t.schools },
        { href: "/teacher-demo", label: t.demoClass },
      ],
    },
    {
      title: t.legal,
      links: [
        { href: "/about", label: t.about },
        { href: "/contact", label: t.contact },
        { href: "/privacy-policy", label: t.privacy },
        {
          href: "/cookie-policy",
          label: language === "tr" ? "Çerez politikası" : "Cookie policy",
        },
        { href: "/terms", label: t.terms },
      ],
    },
  ];

  return (
    <footer className="public-site-footer">
      <div className="public-footer-main">
        <div className="public-footer-brand">
          <Link href="/" className="public-wordmark">
            <span className="public-wordmark-icon" aria-hidden="true">
              ≋
            </span>
            SpeakAce<span>.</span>
          </Link>
          <p>{t.tagline}</p>
          <Link href="/app/practice">{t.start} ↗</Link>
        </div>
        {linkGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((item) => (
              <Link key={item.href} href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="public-footer-newsletter">
        <div>
          <span>{t.weeklyLabel}</span>
          <h3>{t.newsletterTitle}</h3>
          <p>{t.newsletterBody}</p>
        </div>
        <LeadCaptureForm
          source="footer_newsletter"
          variant="compact"
          showName={false}
        />
      </div>
      <div className="public-footer-bottom">
        <p>
          © {currentYear} SpeakAce. {t.copyright}
        </p>
        <a href={`mailto:${siteConfig.contactEmail}`}>
          {siteConfig.contactEmail} ↗
        </a>
      </div>
    </footer>
  );
}

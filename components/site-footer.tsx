"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buildPlanCheckoutPath } from "@/lib/commerce";
import { copy } from "@/lib/copy";
import { useAppState } from "@/components/providers";

const footerText = {
  en: {
    title: "A cleaner, faster way to improve IELTS and TOEFL speaking.",
    description:
      "Built around guided speaking practice, transcript review, score signals, and a calmer study rhythm.",
    newsletterTitle: "Get one practical speaking tip each week",
    newsletterBody: "Short IELTS and TOEFL speaking tips, prompts, and study ideas. No spam.",
    subscribe: "Subscribe",
    subscribed: "Thanks, you're in",
    product: "Product",
    resources: "Resources",
    programs: "Programs",
    company: "Company",
    start: "Start practice",
    plus: "Get Plus",
    summary: "SpeakAce · IELTS and TOEFL speaking practice with AI feedback"
  },
  tr: {
    title: "IELTS ve TOEFL speaking'i geliştirmek için daha temiz ve daha hızlı bir yol.",
    description:
      "Yönlendirmeli speaking practice, transcript incelemesi, skor sinyalleri ve daha sakin bir çalışma ritmi etrafında kuruldu.",
    newsletterTitle: "Her hafta bir pratik speaking ipucu al",
    newsletterBody: "Kısa IELTS ve TOEFL speaking ipuçları, prompt'lar ve çalışma fikirleri.",
    subscribe: "Abone ol",
    subscribed: "Tamam, eklendin",
    product: "Ürün",
    resources: "Kaynaklar",
    programs: "Programlar",
    company: "Şirket",
    start: "Practice başlat",
    plus: "Plus al",
    summary: "SpeakAce · AI geri bildirimli IELTS ve TOEFL speaking practice"
  }
} as const;

export function SiteFooter() {
  const pathname = usePathname();
  const { language } = useAppState();
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  if (pathname?.startsWith("/app") || pathname?.startsWith("/admin")) {
    return null;
  }

  const t = footerText[language === "tr" ? "tr" : "en"];

  const linkGroups = [
    {
      title: t.product,
      links: [
        { href: "/pricing", label: copy[language].nav.pricing },
        { href: "/app/practice", label: copy[language].nav.practice },
        { href: "/free-ielts-speaking-test", label: "Free test" },
        { href: "/tools", label: "Tools" }
      ]
    },
    {
      title: t.resources,
      links: [
        { href: "/resources", label: "Resources" },
        { href: "/blog", label: "Blog" },
        { href: "/ielts-speaking-topics", label: "IELTS topics" },
        { href: "/reviews", label: "Reviews" }
      ]
    },
    {
      title: t.programs,
      links: [
        { href: "/for-students", label: "Students" },
        { href: "/for-teachers", label: "Teachers" },
        { href: "/for-schools", label: "Schools" },
        { href: "/teacher-demo", label: "Demo class" }
      ]
    },
    {
      title: t.company,
      links: [
        { href: "/about", label: "About" },
        { href: "/case-studies", label: "Case studies" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy-policy", label: "Privacy" },
        { href: "/terms", label: "Terms" }
      ]
    }
  ];

  return (
    <footer className="sa-footer-shell">
      <div className="page-shell sa-footer">
        <div className="sa-footer-newsletter">
          <div>
            <span className="eyebrow">Weekly speaking notes</span>
            <h2>{t.newsletterTitle}</h2>
            <p>{t.newsletterBody}</p>
          </div>
          <form
            className="sa-footer-form"
            onSubmit={(event) => {
              event.preventDefault();
              if (!email.trim()) return;
              setDone(true);
              setEmail("");
              window.setTimeout(() => setDone(false), 2500);
            }}
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
            />
            <button type="submit" className="sa-primary-button">
              {done ? t.subscribed : t.subscribe}
            </button>
          </form>
        </div>

        <div className="sa-footer-main">
          <div className="sa-footer-brand">
            <Image src="/brand/speakace-logo.png" alt="SpeakAce" width={958} height={330} className="sa-footer-logo" />
            <h3>{t.title}</h3>
            <p>{t.description}</p>
            <div className="sa-footer-brand-actions">
              <Link href="/app/practice" className="sa-secondary-button">
                {t.start}
              </Link>
              <a href={buildPlanCheckoutPath({ campaign: "footer_cta" })} className="sa-primary-button">
                {t.plus}
              </a>
            </div>
          </div>

          <div className="sa-footer-columns">
            {linkGroups.map((group) => (
              <div key={group.title} className="sa-footer-column">
                <strong>{group.title}</strong>
                <div className="sa-footer-links">
                  {group.links.map((item) => (
                    <Link key={item.href} href={item.href as Route}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="sa-footer-bottom">
          <span>{t.summary}</span>
          <span>speakace.org</span>
        </div>
      </div>
    </footer>
  );
}

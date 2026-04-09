"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Twitter, Linkedin, Instagram, CirclePlay, Mail } from "lucide-react";
import { buildPlanCheckoutPath } from "@/lib/commerce";
import { copy } from "@/lib/copy";
import { useAppState } from "@/components/providers";

const footerText = {
  en: {
    tagline: "Master IELTS and TOEFL speaking with AI-powered feedback.",
    newsletterTitle: "Get one practical speaking tip each week",
    newsletterBody: "Short IELTS and TOEFL speaking tips, prompts, and study ideas. No spam.",
    subscribe: "Subscribe",
    subscribed: "Thanks, you're in!",
    product: "Product",
    resources: "Resources",
    programs: "Programs",
    legal: "Legal",
    start: "Start Practice",
    plus: "Get Plus"
  },
  tr: {
    tagline: "Yapay zeka destekli geri bildirimle IELTS ve TOEFL speaking'i geliştir.",
    newsletterTitle: "Her hafta bir pratik speaking ipucu al",
    newsletterBody: "Kısa IELTS ve TOEFL speaking ipuçları, prompt'lar ve çalışma fikirleri.",
    subscribe: "Abone ol",
    subscribed: "Tamam, eklendin!",
    product: "Ürün",
    resources: "Kaynaklar",
    programs: "Programlar",
    legal: "Yasal",
    start: "Practice Başlat",
    plus: "Plus Al"
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
  const currentYear = new Date().getFullYear();

  const linkGroups = [
    {
      title: t.product,
      links: [
        { href: "/app/practice", label: copy[language].nav.practice },
        { href: "/pricing", label: copy[language].nav.pricing },
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
      title: t.legal,
      links: [
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
        { href: "/privacy-policy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" }
      ]
    }
  ];

  return (
    <footer
      style={{
        background: "var(--card)",
        borderTop: "1px solid var(--border)",
        marginTop: "auto"
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "3rem 1.5rem 2rem" }}>

        {/* Main grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "2.5rem", marginBottom: "3rem" }}
          className="footer-main-grid"
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <span style={{ color: "white", fontWeight: 700, fontSize: "12px" }}>SA</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: "1rem" }}>SpeakAce</span>
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.6, marginBottom: "1.25rem", maxWidth: "240px" }}>
              {t.tagline}
            </p>
            <div style={{ display: "flex", gap: "0.625rem" }}>
              <a
                href={buildPlanCheckoutPath({ campaign: "footer_cta" })}
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  color: "white",
                  background: "var(--primary)",
                  borderRadius: "8px",
                  textDecoration: "none"
                }}
              >
                {t.plus}
              </a>
              <Link
                href="/app/practice"
                style={{
                  display: "inline-block",
                  padding: "0.5rem 1rem",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--foreground)",
                  background: "oklch(1 0 0 / 6%)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: "8px",
                  textDecoration: "none",
                  opacity: 0.8
                }}
              >
                {t.start}
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--foreground)",
                  marginBottom: "1rem",
                  opacity: 0.9
                }}
              >
                {group.title}
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {group.links.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href as Route}
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--muted-foreground)",
                        textDecoration: "none",
                        transition: "color 0.15s",
                        display: "inline-block"
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div
          style={{
            background: "oklch(1 0 0 / 3%)",
            border: "1px solid oklch(1 0 0 / 7%)",
            borderRadius: "14px",
            padding: "1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            flexWrap: "wrap",
            marginBottom: "2rem"
          }}
        >
          <div>
            <span style={{ display: "inline-block", fontSize: "0.6875rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.375rem" }}>
              Weekly speaking notes
            </span>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.25rem" }}>{t.newsletterTitle}</h3>
            <p style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>{t.newsletterBody}</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!email.trim()) return;
              setDone(true);
              setEmail("");
              window.setTimeout(() => setDone(false), 2500);
            }}
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              style={{
                padding: "0.625rem 1rem",
                fontSize: "0.875rem",
                background: "oklch(1 0 0 / 6%)",
                border: "1px solid oklch(1 0 0 / 12%)",
                borderRadius: "8px",
                color: "var(--foreground)",
                outline: "none",
                minWidth: "220px"
              }}
            />
            <button
              type="submit"
              style={{
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "white",
                background: "var(--primary)",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                whiteSpace: "nowrap"
              }}
            >
              {done ? t.subscribed : t.subscribe}
            </button>
          </form>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--border)"
          }}
        >
          <p style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>
            © {currentYear} SpeakAce. All rights reserved.
          </p>

          {/* Social links */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
            {[
              { href: "https://twitter.com/speakace", Icon: Twitter, label: "Twitter" },
              { href: "https://linkedin.com/company/speakace", Icon: Linkedin, label: "LinkedIn" },
              { href: "https://instagram.com/speakace", Icon: Instagram, label: "Instagram" },
              { href: "https://youtube.com/@speakace", Icon: CirclePlay, label: "YouTube" },
              { href: "mailto:support@speakace.org", Icon: Mail, label: "Email" }
            ].map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto") ? undefined : "_blank"}
                rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                aria-label={label}
                style={{
                  color: "var(--muted-foreground)",
                  transition: "color 0.15s",
                  opacity: 0.65
                }}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .footer-main-grid { grid-template-columns: 1fr 1fr 1fr !important; }
        }
        @media (max-width: 640px) {
          .footer-main-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </footer>
  );
}

"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Mail } from "lucide-react";

function IconX({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconLinkedin({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function IconInstagram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function IconYoutube({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
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
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

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
                  background: "var(--secondary)",
                  border: "1px solid var(--border)",
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
            background: "var(--secondary)",
            border: "1px solid var(--border)",
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
            onSubmit={async (event) => {
              event.preventDefault();
              if (!email.trim() || status === "loading") return;
              setStatus("loading");
              try {
                const response = await fetch("/api/marketing/lead", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: email.trim(), source: "footer-newsletter" })
                });
                if (response.ok) {
                  setStatus("done");
                  setEmail("");
                  window.setTimeout(() => setStatus("idle"), 3000);
                } else {
                  setStatus("error");
                  window.setTimeout(() => setStatus("idle"), 3000);
                }
              } catch {
                setStatus("error");
                window.setTimeout(() => setStatus("idle"), 3000);
              }
            }}
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
          >
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              disabled={status === "loading" || status === "done"}
              style={{
                padding: "0.625rem 1rem",
                fontSize: "0.875rem",
                background: "var(--input-bg)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
                outline: "none",
                minWidth: "220px",
                opacity: status === "loading" ? 0.6 : 1
              }}
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "done"}
              style={{
                padding: "0.625rem 1.25rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "white",
                background: status === "error" ? "var(--destructive, #e53e3e)" : "var(--primary)",
                border: "none",
                borderRadius: "8px",
                cursor: status === "loading" || status === "done" ? "default" : "pointer",
                whiteSpace: "nowrap",
                opacity: status === "loading" ? 0.7 : 1,
                transition: "background 0.2s, opacity 0.2s"
              }}
            >
              {status === "loading" ? "..." : status === "done" ? "Thanks!" : status === "error" ? "Try again" : t.subscribe}
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
              { href: "https://twitter.com/speakace", Icon: IconX, label: "X (Twitter)" },
              { href: "https://linkedin.com/company/speakace", Icon: IconLinkedin, label: "LinkedIn" },
              { href: "https://instagram.com/speakace", Icon: IconInstagram, label: "Instagram" },
              { href: "https://youtube.com/@speakace", Icon: IconYoutube, label: "YouTube" },
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

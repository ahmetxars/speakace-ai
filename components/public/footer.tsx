"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers";
import { PublicBrand } from "./brand";
import { publicDesignCopy } from "@/lib/public-design-copy";
import { normalizePublicLanguage } from "@/lib/copy";
import { homeTurkish } from "@/lib/home-translations";

export function PublicFooter({
  compact = false,
  home = false,
}: {
  compact?: boolean;
  home?: boolean;
}) {
  const { language } = useAppState();
  const locale = normalizePublicLanguage(language);
  const t = publicDesignCopy[locale];
  const h = (text: string) =>
    locale === "tr" ? (homeTurkish[text] ?? text) : text;
  const year = new Date().getFullYear();
  if (compact)
    return (
      <footer className="site-footer wrap public-footer public-footer-compact">
        <div className="footer-top">
          <PublicBrand />
          <p>{home ? h("A clearer next attempt.") : t.tagline}</p>
          <div>
            <Link href="/about">{home ? h("About") : t.about}</Link>
            <Link href="/contact">{home ? h("Contact") : t.contact}</Link>
            <Link href="/resources">{home ? h("Resources") : t.resources}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {year} SpeakAce</span>
          <span>
            {home ? h("Independent IELTS & TOEFL practice.") : t.independent}
          </span>
          <div>
            <Link href="/cookie-policy">{home ? h("Cookies") : t.cookies}</Link>
            <Link href="/privacy-policy">
              {home ? h("Privacy") : t.privacy}
            </Link>
            <Link href="/terms">{home ? h("Terms") : t.terms}</Link>
          </div>
        </div>
      </footer>
    );
  const groups = [
    {
      title: t.product,
      links: [
        { href: "/app/practice", label: t.practice },
        { href: "/pricing", label: t.plans },
        { href: "/free-ielts-speaking-test", label: t.freeTest },
        { href: "/tools", label: t.tools },
      ],
    },
    {
      title: t.learn,
      links: [
        { href: "/resources", label: t.library },
        { href: "/blog", label: t.blog },
        { href: "/ielts-speaking-topics", label: t.topics },
        {
          href: "/reviews",
          label:
            locale === "tr"
              ? "Ürünü incele"
              : locale === "de"
                ? "Produkt ansehen"
                : locale === "es"
                  ? "Ver el producto"
                  : locale === "fr"
                    ? "Voir le produit"
                    : "Review the product",
        },
      ],
    },
    {
      title: t.forYou,
      links: [
        { href: "/for-students", label: t.students },
        { href: "/for-teachers", label: t.teachers },
        { href: "/for-schools", label: t.schools },
        { href: "/teacher-demo", label: t.demo },
      ],
    },
    {
      title: t.company,
      links: [
        { href: "/about", label: t.about },
        { href: "/contact", label: t.contact },
        { href: "/privacy-policy", label: t.privacy },
        { href: "/cookie-policy", label: t.cookies },
        { href: "/terms", label: t.terms },
      ],
    },
  ];
  return (
    <footer className="public-footer public-footer-expanded">
      <div className="public-footer-inner">
        <div className="public-footer-intro">
          <PublicBrand />
          <p>{t.tagline}</p>
          <Link className="public-footer-start" href="/app/practice">
            {t.footerStart}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="public-footer-links">
          {groups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2>{group.title}</h2>
              {group.links.map((link) => (
                <Link key={link.href} href={link.href as import("next").Route}>
                  {link.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>
        <div className="public-footer-bottom">
          <span>© {year} SpeakAce</span>
          <span>{t.independent}</span>
          <Link href="/contact">{t.contact} ↗</Link>
        </div>
      </div>
    </footer>
  );
}

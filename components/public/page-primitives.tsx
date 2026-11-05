import type { ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SpeakAceVoiceSignal } from "@/components/voice-in-motion/voice-signal";

export function PublicPageFrame({ children }: { children: ReactNode }) {
  return <div className="public-page">{children}</div>;
}

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  visual,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  actions?: ReactNode;
  visual?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className={"public-page-hero" + (visual ? " has-visual" : "")}>
      <div className="public-page-hero-copy">
        <span className="public-kicker">{eyebrow}</span>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
        {actions && <div className="public-actions">{actions}</div>}
        {children}
      </div>
      {visual && <div className="public-page-hero-visual">{visual}</div>}
    </header>
  );
}

export function PageSection({
  eyebrow,
  title,
  description,
  children,
  className = "",
  id,
}: {
  eyebrow?: string;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={"public-section " + className} id={id}>
      {(eyebrow || title) && (
        <div className="public-section-head">
          <div>
            {eyebrow && <span className="public-kicker">{eyebrow}</span>}
            {title && <h2>{title}</h2>}
          </div>
          {description && <p>{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function PublicButton({
  href,
  secondary = false,
  children,
  className = "",
}: {
  href: string;
  secondary?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const classes =
    "public-button" + (secondary ? " is-secondary " : " ") + className;
  if (/^(mailto:|https?:)/.test(href))
    return (
      <a className={classes} href={href}>
        {children}
        <ArrowUpRight size={18} aria-hidden="true" />
      </a>
    );
  return (
    <Link className={classes} href={href as Route}>
      {children}
      {!secondary && <ArrowUpRight size={18} aria-hidden="true" />}
    </Link>
  );
}

export function PageCTA({
  eyebrow,
  title,
  description,
  children,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className="public-page-cta" id={id}>
      <SpeakAceVoiceSignal className="public-cta-signal" />
      <div>
        {eyebrow && <span className="public-kicker">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      <div className="public-actions">{children}</div>
    </section>
  );
}

export function Breadcrumb({
  items,
  label,
}: {
  items: Array<{ href?: string; label: string }>;
  label: string;
}) {
  return (
    <nav className="public-breadcrumb" aria-label={label}>
      <ol>
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link href={item.href as Route}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
            {index < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ResourceCard({
  href,
  category,
  title,
  description,
  action,
  index,
  icon,
}: {
  href: string;
  category: string;
  title: string;
  description: string;
  action: string;
  index?: number;
  icon?: ReactNode;
}) {
  return (
    <article className="public-resource-card">
      <div className="public-card-topline">
        <span>
          {index === undefined ? category : String(index + 1).padStart(2, "0")}
        </span>
        {icon}
      </div>
      {index !== undefined && (
        <span className="public-card-category">{category}</span>
      )}
      <h3>
        <Link href={href as Route}>{title}</Link>
      </h3>
      <p>{description}</p>
      <Link className="public-card-action" href={href as Route}>
        {action}
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}

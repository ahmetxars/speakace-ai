import { Fragment } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { LeadCaptureForm } from "@/components/lead-capture-form";

type Stat = {
  value: string;
  label: string;
};

type Highlight = {
  title: string;
  body: string;
  icon: LucideIcon;
};

type TimelineStep = {
  title: string;
  body: string;
};

type Testimonial = {
  quote: string;
  name: string;
  detail: string;
};

type PackageOption = {
  title: string;
  subtitle: string;
  points: string[];
  href: string;
  cta: string;
  featured?: boolean;
};

type ComparisonRow = {
  need: string;
  solution: string;
};

type PageAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type PreviewCard = {
  label: string;
  body: string;
};

type AudiencePageProps = {
  audienceLabel: string;
  heroTitle: string;
  heroBody: string;
  heroKicker: string;
  heroStats: Stat[];
  heroSignals: string[];
  heroPreviewCards?: [PreviewCard, PreviewCard];
  primaryAction: PageAction;
  secondaryAction?: PageAction;
  tertiaryAction?: PageAction;
  highlightsLabel: string;
  highlightsTitle: string;
  highlightsBody?: string;
  highlights: Highlight[];
  timelineLabel: string;
  timelineTitle: string;
  timelineBody?: string;
  timeline: TimelineStep[];
  testimonialsLabel: string;
  testimonialsTitle: string;
  testimonials: Testimonial[];
  leadLabel: string;
  leadTitle: string;
  leadBody: string;
  leadSource: string;
  leadId?: string;
  finalCtaLabel: string;
  finalCtaTitle: string;
  finalCtaBody: string;
  finalPrimaryAction: PageAction;
  finalSecondaryAction?: PageAction;
  packagesLabel?: string;
  packagesTitle?: string;
  packagesBody?: string;
  packages?: PackageOption[];
  comparisonLabel?: string;
  comparisonTitle?: string;
  comparisonRows?: ComparisonRow[];
};

function renderAction(action: PageAction, key: string) {
  const className = action.variant === "secondary" ? "button button-secondary" : "button button-primary";
  return (
    <a key={key} className={className} href={action.href}>
      {action.label}
    </a>
  );
}

export function AudiencePage({
  audienceLabel,
  heroTitle,
  heroBody,
  heroKicker,
  heroStats,
  heroSignals,
  heroPreviewCards,
  primaryAction,
  secondaryAction,
  tertiaryAction,
  highlightsLabel,
  highlightsTitle,
  highlightsBody,
  highlights,
  timelineLabel,
  timelineTitle,
  timelineBody,
  timeline,
  testimonialsLabel,
  testimonialsTitle,
  testimonials,
  leadLabel,
  leadTitle,
  leadBody,
  leadSource,
  leadId,
  finalCtaLabel,
  finalCtaTitle,
  finalCtaBody,
  finalPrimaryAction,
  finalSecondaryAction,
  packagesLabel,
  packagesTitle,
  packagesBody,
  packages,
  comparisonLabel,
  comparisonTitle,
  comparisonRows
}: AudiencePageProps) {
  return (
    <main className="page-shell section audience-page">
      <section className="audience-hero">
        <div className="audience-hero-copy card">
          <span className="eyebrow">{audienceLabel}</span>
          <h1>{heroTitle}</h1>
          <p>{heroBody}</p>
          <div className="audience-hero-actions">
            {renderAction(primaryAction, "primary")}
            {secondaryAction ? renderAction(secondaryAction, "secondary") : null}
            {tertiaryAction ? renderAction(tertiaryAction, "tertiary") : null}
          </div>
          <div className="audience-hero-signals">
            {heroSignals.map((signal) => (
              <div key={signal} className="audience-signal-pill">
                <CheckCircle2 size={16} />
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="audience-hero-panel card">
          <div className="audience-panel-head">
            <span className="audience-panel-badge">
              <Sparkles size={16} />
              <span>{heroKicker}</span>
            </span>
            <strong>SpeakAce</strong>
          </div>
          <div className="audience-stat-grid">
            {heroStats.map((stat) => (
              <article key={`${stat.value}-${stat.label}`} className="audience-stat-card">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
          {heroPreviewCards ? (
            <div className="audience-preview-stack">
              <div className="audience-preview-card">
                <span>{heroPreviewCards[0].label}</span>
                <strong>{heroPreviewCards[0].body}</strong>
              </div>
              <div className="audience-preview-card">
                <span>{heroPreviewCards[1].label}</span>
                <strong>{heroPreviewCards[1].body}</strong>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="audience-section">
        <div className="section-head">
          <span className="eyebrow">{highlightsLabel}</span>
          <h2>{highlightsTitle}</h2>
          {highlightsBody ? <p>{highlightsBody}</p> : null}
        </div>
        <div className="audience-feature-grid">
          {highlights.map(({ title, body, icon: Icon }) => (
            <article key={title} className="audience-feature-card card">
              <div className="audience-feature-icon">
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="audience-section audience-timeline-shell">
        <div className="section-head">
          <span className="eyebrow">{timelineLabel}</span>
          <h2>{timelineTitle}</h2>
          {timelineBody ? <p>{timelineBody}</p> : null}
        </div>
        <div className="audience-timeline">
          {timeline.map((step, index) => (
            <article key={step.title} className="audience-timeline-card card">
              <div className="audience-timeline-index">{String(index + 1).padStart(2, "0")}</div>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {packages && packages.length > 0 && packagesLabel && packagesTitle ? (
        <section className="audience-section">
          <div className="section-head">
            <span className="eyebrow">{packagesLabel}</span>
            <h2>{packagesTitle}</h2>
            {packagesBody ? <p>{packagesBody}</p> : null}
          </div>
          <div className="audience-package-grid">
            {packages.map((pack) => (
              <article key={pack.title} className="audience-package-card card" data-featured={pack.featured ? "true" : "false"}>
                <div className="audience-package-head">
                  <span>{pack.subtitle}</span>
                  <h3>{pack.title}</h3>
                </div>
                <div className="audience-package-points">
                  {pack.points.map((point) => (
                    <div key={point} className="audience-package-point">
                      <CheckCircle2 size={16} />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
                <a className={pack.featured ? "button button-primary" : "button button-secondary"} href={pack.href}>
                  {pack.cta}
                </a>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {comparisonRows && comparisonRows.length > 0 && comparisonLabel && comparisonTitle ? (
        <section className="audience-comparison card">
          <div className="section-head">
            <span className="eyebrow">{comparisonLabel}</span>
            <h2>{comparisonTitle}</h2>
          </div>
          <div className="audience-comparison-grid">
            <div className="audience-comparison-head">Challenge</div>
            <div className="audience-comparison-head">How SpeakAce fits</div>
            {comparisonRows.map((row) => (
              <Fragment key={row.need}>
                <div key={`${row.need}-need`} className="audience-comparison-cell">
                  <strong>{row.need}</strong>
                </div>
                <div key={`${row.need}-solution`} className="audience-comparison-cell">
                  <p>{row.solution}</p>
                </div>
              </Fragment>
            ))}
          </div>
        </section>
      ) : null}

      <section className="audience-section">
        <div className="section-head">
          <span className="eyebrow">{testimonialsLabel}</span>
          <h2>{testimonialsTitle}</h2>
        </div>
        <div className="audience-testimonial-grid">
          {testimonials.map((item) => (
            <article key={item.name} className="audience-testimonial-card card">
              <p>&ldquo;{item.quote}&rdquo;</p>
              <div>
                <strong>{item.name}</strong>
                <span>{item.detail}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id={leadId} className="audience-lead card">
        <div>
          <span className="eyebrow">{leadLabel}</span>
          <h2>{leadTitle}</h2>
          <p>{leadBody}</p>
        </div>
        <LeadCaptureForm source={leadSource} />
      </section>

      <section className="audience-final-cta card">
        <div>
          <span className="eyebrow">{finalCtaLabel}</span>
          <h2>{finalCtaTitle}</h2>
          <p>{finalCtaBody}</p>
        </div>
        <div className="audience-final-actions">
          {renderAction(finalPrimaryAction, "final-primary")}
          {finalSecondaryAction ? renderAction(finalSecondaryAction, "final-secondary") : null}
          <a className="button button-secondary" href="/auth?mode=signup">
            Create account
            <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}

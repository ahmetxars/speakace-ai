import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShareAttributionCapture } from "@/components/share-attribution-capture";
import { buildShareAttributionPath, buildSharePricingHref, buildShareSignupHref, estimateCountryRank } from "@/lib/share-growth";
import { getSharedResultCard } from "@/lib/shared-result-cards";
import { siteConfig } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const card = await getSharedResultCard(slug);

  if (!card) {
    return {
      title: "Shared result not found | SpeakAce AI",
      description: "This shared speaking result is no longer available."
    };
  }

  const title = `${card.learnerName} scored ${card.overallScore} ${card.scaleLabel} on SpeakAce`;
  const description = `${card.badgeLabel} • ${card.localeFlag} ${card.streakLabel} • ${card.promptTitle}`;
  const url = `${siteConfig.domain}/share/${card.slug}`;
  const image = `${siteConfig.domain}/share/${card.slug}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${card.learnerName} SpeakAce result card`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}

export default async function SharedResultPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getSharedResultCard(slug);
  if (!card) notFound();
  const rankMeta = estimateCountryRank(card.overallScore, card.examType, card.localeFlag);
  const sharePath = buildShareSignupHref(card.slug);
  const pricingPath = buildSharePricingHref(card.slug);
  const attributionPath = buildShareAttributionPath(card.slug);

  const scorePct = Math.round((card.overallScore / (card.examType === "TOEFL" ? 4 : 9)) * 100);
  const catColors = ["#22d3ee", "#f472b6", "#818cf8", "#fbbf24"];

  return (
    <main className="page-shell section">
      <ShareAttributionCapture path={attributionPath} />
      <div style={{ maxWidth: 560, margin: "0 auto", display: "grid", gap: "1.2rem" }}>

        {/* ── SHARE CARD ── */}
        <div className="rsc-card">
          <div className="rsc-topbar">
            <span className="rsc-brand">SpeakAce</span>
            <span className="rsc-exam-tag">{card.examType}</span>
          </div>

          <div className="rsc-user-row">
            <div className="rsc-avatar">
              {card.avatarDataUrl
                ? <img src={card.avatarDataUrl} alt={card.learnerName} />
                : <span>{card.learnerName.slice(0, 2).toUpperCase()}</span>}
            </div>
            <div className="rsc-user-info">
              <strong>{card.learnerName}</strong>
              <span>{card.localeFlag} {card.streakLabel}</span>
            </div>
          </div>

          <div className="rsc-score-row">
            <div
              className="rsc-score-ring"
              style={{ background: `conic-gradient(#22d3ee 0% ${scorePct}%, rgba(255,255,255,0.08) 0%)` }}
            >
              <div className="rsc-score-inner">
                <strong>{card.overallScore}</strong>
                <span>OVERALL</span>
              </div>
            </div>
            <div className="rsc-score-meta">
              <span className="rsc-scale-label">≈ {card.scaleLabel}</span>
              <span className="rsc-badge-label">{card.badgeLabel}</span>
              <span className="rsc-badge-label" style={{ color: "rgba(148,163,184,0.8)", background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
                {rankMeta.percentileLabel}
              </span>
            </div>
          </div>

          <div className="rsc-categories">
            {card.categories.map((item, index) => {
              const pct = Math.max(6, Math.min(100, (item.score / (card.examType === "TOEFL" ? 4 : 9)) * 100));
              return (
                <div key={item.label} className="rsc-cat-row">
                  <span>{item.label}</span>
                  <div className="rsc-cat-track">
                    <div className="rsc-cat-fill" style={{ width: `${pct}%`, background: catColors[index % 4] }} />
                  </div>
                  <strong>{item.score}</strong>
                </div>
              );
            })}
          </div>

          <div className="rsc-prompt-row">
            <p>{card.promptTitle}</p>
            <span>{card.examType} · {card.taskType} · {card.difficulty}</span>
          </div>

          <div className="rsc-footer">
            <span className="rsc-footer-tag">{rankMeta.countrySignal}</span>
            <span className="rsc-domain">speakace.ai</span>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.8rem" }}>
          <strong style={{ fontSize: "1.05rem" }}>Practice your own IELTS speaking with AI</strong>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.68, fontSize: "0.9rem" }}>
            Record one answer, get an AI score and transcript, and share your own result card in minutes.
          </p>
          <div style={{ display: "flex", gap: "0.65rem", flexWrap: "wrap" }}>
            <a href={sharePath} className="button button-primary">Start Free Test</a>
            <a href={pricingPath} className="button button-secondary">Unlock full feedback</a>
          </div>
        </div>

      </div>
    </main>
  );
}

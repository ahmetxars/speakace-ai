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

  return (
    <main className="page-shell section">
      <ShareAttributionCapture path={attributionPath} />
      <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gap: "1.2rem" }}>
        <div
          style={{
            position: "relative",
            padding: "2rem 1.5rem",
            borderRadius: 32,
            background: "#151e32",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.42), 0 0 0 1px rgba(255,255,255,0.05)",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: -50, left: -50, width: 180, height: 180, borderRadius: 999, background: "linear-gradient(135deg, rgba(99,102,241,0.42), rgba(168,85,247,0.28))", filter: "blur(80px)", opacity: 0.75 }} />
          <div style={{ position: "absolute", bottom: -60, right: -40, width: 180, height: 180, borderRadius: 999, background: "linear-gradient(135deg, rgba(99,102,241,0.24), rgba(168,85,247,0.34))", filter: "blur(80px)", opacity: 0.8 }} />
          <div style={{ position: "relative", zIndex: 1, display: "grid", gap: "1.5rem", minHeight: 760 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <div style={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                SpeakAce
              </div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, background: "rgba(255,255,255,0.08)", padding: "0.45rem 0.8rem", borderRadius: 999, color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                AI Certified
              </div>
            </div>

            <div style={{ display: "grid", gap: "1.35rem", justifyItems: "center", textAlign: "center", marginBottom: "auto" }}>
              <div style={{ display: "grid", gap: "0.85rem", justifyItems: "center" }}>
                <div style={{ display: "flex", gap: "0.7rem", alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                  <div style={{ width: 56, height: 56, borderRadius: 999, overflow: "hidden", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", color: "white", display: "grid", placeItems: "center", fontWeight: 900, fontSize: "1rem" }}>
                    {card.avatarDataUrl ? <img src={card.avatarDataUrl} alt="Learner" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : card.learnerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ display: "grid", gap: "0.15rem", textAlign: "left" }}>
                    <div style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>{card.learnerName}</div>
                    <div style={{ color: "var(--text-muted)", fontSize: "0.84rem" }}>{card.localeFlag} {card.streakLabel}</div>
                  </div>
                </div>
                <h1 style={{ margin: 0, color: "white", fontSize: "clamp(1.4rem, 3vw, 2rem)", maxWidth: 620 }}>{card.promptTitle}</h1>
                <p style={{ margin: 0, color: "var(--text-muted)" }}>{card.examType} • {card.taskType} • {card.difficulty}</p>
              </div>

              <div style={{ width: 236, height: 236, borderRadius: "50%", background: "conic-gradient(#22d3ee 0% 78%, rgba(255,255,255,0.1) 78% 100%)", display: "grid", placeItems: "center", boxShadow: "0 0 36px rgba(34,211,238,0.18)" }}>
                <div style={{ width: 206, height: 206, borderRadius: "50%", background: "#151e32", display: "grid", placeItems: "center" }}>
                  <div style={{ display: "grid", justifyItems: "center" }}>
                    <div style={{ fontSize: "4.2rem", fontWeight: 900, lineHeight: 1, background: "linear-gradient(to bottom, #fff, #cbd5e1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{card.overallScore}</div>
                    <div style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: 4 }}>OVERALL SCORE</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gap: "0.75rem", justifyItems: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(16,185,129,0.15)", color: "#34d399", padding: "0.5rem 1rem", borderRadius: 999, fontWeight: 700, fontSize: "0.95rem", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <span>≈ {card.scaleLabel}</span>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", background: "rgba(255,255,255,0.08)", color: "#22d3ee", padding: "0.45rem 0.95rem", borderRadius: 999, fontWeight: 700, fontSize: "0.82rem", border: "1px solid rgba(34,211,238,0.14)" }}>
                  {card.badgeLabel}
                </div>
              </div>

              <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {card.categories.map((item, index) => {
                  const tone = ["#22d3ee", "#f472b6", "#818cf8", "#fbbf24"][index % 4];
                  const pct = Math.max(10, Math.min(100, (item.score / (card.examType === "TOEFL" ? 4 : 9)) * 100));
                  return (
                    <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", padding: "1rem", borderRadius: 16, textAlign: "left" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>{item.label}</span>
                        <span style={{ fontWeight: 800, color: "white" }}>{item.score}</span>
                      </div>
                      <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: tone }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ width: "100%", display: "grid", gap: "0.8rem", justifyItems: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0.8rem 1rem", borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)", color: "white", fontSize: "0.95rem", fontWeight: 700, textAlign: "center" }}>
                  {rankMeta.percentileLabel} • {rankMeta.countrySignal}
                </div>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "rgba(255,255,255,0.76)", maxWidth: 560, lineHeight: 1.6, textAlign: "center" }}>{card.nextExercise}</p>
              </div>

              <div style={{ width: "100%", paddingTop: "1.2rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gap: "0.8rem", justifyItems: "center" }}>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>SpeakAce AI tarafından analiz edildi.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>Practice your own speaking result with SpeakAce</strong>
          <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.7 }}>Record one answer, get an IELTS-style score estimate, and share your own result card in minutes.</p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href={sharePath} className="button button-primary">Start Free Test</a>
            <a href={pricingPath} className="button button-secondary">Unlock full feedback</a>
          </div>
        </div>
      </div>
    </main>
  );
}

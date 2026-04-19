import type { Metadata } from "next";
import Link from "next/link";
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
            padding: "1.5rem",
            borderRadius: 30,
            background: "radial-gradient(circle at top right, rgba(76,132,255,0.34), transparent 28%), radial-gradient(circle at bottom left, rgba(18,184,166,0.26), transparent 35%), linear-gradient(135deg, #06111f 0%, #0d1a33 52%, #102f43 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 90px rgba(7, 17, 31, 0.28)",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "absolute", top: -40, right: -20, width: 220, height: 220, borderRadius: 999, background: "rgba(93, 112, 255, 0.18)", filter: "blur(36px)" }} />
          <div style={{ position: "absolute", bottom: -70, left: -30, width: 260, height: 260, borderRadius: 999, background: "rgba(16, 185, 129, 0.14)", filter: "blur(42px)" }} />
          <div style={{ position: "relative", zIndex: 1, display: "grid", gap: "1.1rem", padding: "1.5rem", borderRadius: 24, background: "linear-gradient(180deg, rgba(8, 15, 28, 0.58), rgba(8, 15, 28, 0.32))", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(18px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "0.55rem", padding: "0.4rem 0.8rem", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.82)", fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.8rem" }}>
                  <span style={{ width: 11, height: 11, borderRadius: 999, background: "linear-gradient(135deg, #60a5fa, #34d399)", boxShadow: "0 0 18px rgba(96,165,250,0.7)" }} />
                  SpeakAce Shared Result
                </div>
                <div style={{ display: "flex", gap: "0.7rem", alignItems: "center", marginBottom: "0.9rem" }}>
                  <div style={{ width: 46, height: 46, borderRadius: 999, overflow: "hidden", display: "grid", placeItems: "center", background: "rgba(255,255,255,0.12)", color: "white", fontWeight: 900 }}>
                    {card.avatarDataUrl ? <img src={card.avatarDataUrl} alt="Learner" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : card.learnerName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 800 }}>{card.learnerName}</div>
                    <div style={{ color: "rgba(255,255,255,0.66)", fontSize: "0.84rem" }}>{card.localeFlag} {card.streakLabel}</div>
                  </div>
                  <div style={{ padding: "0.36rem 0.72rem", borderRadius: 999, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.88)", fontSize: "0.8rem", fontWeight: 700 }}>{card.badgeLabel}</div>
                </div>
                <h1 style={{ margin: 0, color: "white", fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>{card.promptTitle}</h1>
                <p style={{ margin: "0.55rem 0 0", color: "rgba(255,255,255,0.68)" }}>{card.examType} • {card.taskType} • {card.difficulty}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "rgba(255,255,255,0.88)", fontWeight: 800, fontSize: "1rem" }}>speakace.org</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "1rem" }}>
              <div style={{ padding: "1.15rem", borderRadius: 20, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "4.8rem", fontWeight: 900, lineHeight: 0.95, color: "white" }}>{card.overallScore}</div>
                <div style={{ marginTop: "0.5rem", color: "rgba(255,255,255,0.82)", fontWeight: 700 }}>{card.scaleLabel}</div>
                <p style={{ margin: "0.9rem 0 0", lineHeight: 1.65, color: "rgba(255,255,255,0.68)" }}>{card.nextExercise}</p>
                <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginTop: "1rem" }}>
                  <div style={{ padding: "0.65rem 0.8rem", borderRadius: 16, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 160 }}>
                    <div style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Estimated percentile</div>
                    <div style={{ color: "white", fontWeight: 800, marginTop: "0.25rem" }}>{rankMeta.percentileLabel}</div>
                  </div>
                  <div style={{ padding: "0.65rem 0.8rem", borderRadius: 16, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 180 }}>
                    <div style={{ color: "rgba(255,255,255,0.62)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Country signal</div>
                    <div style={{ color: "white", fontWeight: 800, marginTop: "0.25rem" }}>{rankMeta.countrySignal}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem" }}>
                {card.categories.map((item) => (
                  <div key={item.label} style={{ padding: "0.9rem", borderRadius: 16, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.8rem", minHeight: 32 }}>{item.label}</div>
                    <div style={{ marginTop: "0.35rem", color: "white", fontSize: "1.6rem", fontWeight: 900 }}>{item.score}</div>
                  </div>
                ))}
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

import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { estimateCountryRank } from "@/lib/share-growth";
import { getSharedResultCard } from "@/lib/shared-result-cards";

export const size = {
  width: 1200,
  height: 1500
};

export const contentType = "image/png";

const statTones = ["#22d3ee", "#f472b6", "#818cf8", "#fbbf24"];

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getSharedResultCard(slug);

  if (!card) notFound();

  const rankMeta = estimateCountryRank(card.overallScore, card.examType, card.localeFlag);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          padding: 44,
          position: "relative",
          backgroundColor: "#0f172a",
          color: "white",
          fontFamily: "Arial, sans-serif",
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(99,102,241,0.18) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(168,85,247,0.18) 0%, transparent 20%)"
        }}
      >
        <div
          style={{
            width: "100%",
            borderRadius: 36,
            background: "#151e32",
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 20px 50px rgba(0,0,0,0.38)",
            border: "1px solid rgba(255,255,255,0.10)",
            padding: 42,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              left: -60,
              top: -60,
              borderRadius: 9999,
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              filter: "blur(100px)",
              opacity: 0.28
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              right: -70,
              bottom: -70,
              borderRadius: 9999,
              background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
              filter: "blur(100px)",
              opacity: 0.24
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 42,
                fontWeight: 800,
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              SpeakAce
            </div>
            <div
              style={{
                display: "flex",
                padding: "10px 18px",
                borderRadius: 9999,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(34,211,238,0.22)",
                color: "#22d3ee",
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: 1
              }}
            >
              AI CERTIFIED
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, marginTop: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {card.avatarDataUrl ? (
                <img
                  src={card.avatarDataUrl}
                  alt={card.learnerName}
                  width={84}
                  height={84}
                  style={{ width: 84, height: 84, borderRadius: 9999, objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 30,
                    fontWeight: 800,
                    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
                  }}
                >
                  {card.learnerName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 30, fontWeight: 700 }}>{card.learnerName}</div>
                <div style={{ fontSize: 22, color: "#94a3b8" }}>{card.localeFlag} {card.streakLabel}</div>
              </div>
            </div>

            <div style={{ fontSize: 44, fontWeight: 800, textAlign: "center", marginTop: 28, lineHeight: 1.08 }}>
              {card.promptTitle.length > 62 ? `${card.promptTitle.slice(0, 59)}...` : card.promptTitle}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", zIndex: 2, marginTop: 18 }}>
            <div
              style={{
                width: 360,
                height: 360,
                borderRadius: 9999,
                background: "conic-gradient(#22d3ee 0% 78%, rgba(255,255,255,0.10) 78% 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 30px rgba(34,211,238,0.16)"
              }}
            >
              <div
                style={{
                  width: 314,
                  height: 314,
                  borderRadius: 9999,
                  background: "#151e32",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1 }}>{card.overallScore}</div>
                <div style={{ fontSize: 24, color: "#94a3b8" }}>OVERALL SCORE</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", zIndex: 2, marginTop: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "12px 26px",
                borderRadius: 9999,
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.22)",
                color: "#34d399",
                fontSize: 26,
                fontWeight: 700
              }}
            >
              ≈ {card.scaleLabel}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, zIndex: 2, marginTop: 30 }}>
            {card.categories.slice(0, 4).map((item, index) => {
              const pct = Math.max(8, Math.min(100, (item.score / (card.examType === "TOEFL" ? 4 : 9)) * 100));
              return (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    padding: 22,
                    borderRadius: 20,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                    <div style={{ fontSize: 24, color: "#94a3b8" }}>
                      {item.label.length > 18 ? `${item.label.slice(0, 18)}...` : item.label}
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 800 }}>{item.score}</div>
                  </div>
                  <div style={{ width: "100%", height: 10, borderRadius: 9999, background: "rgba(255,255,255,0.10)", overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 9999, background: statTones[index % 4] }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gap: 16, zIndex: 2, marginTop: 24 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 20px",
                borderRadius: 16,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "white",
                fontSize: 24,
                fontWeight: 700
              }}
            >
              {rankMeta.percentileLabel} • {rankMeta.countrySignal}
            </div>
            <div style={{ fontSize: 24, color: "#94a3b8", textAlign: "center", lineHeight: 1.5 }}>
              {card.nextExercise.length > 138 ? `${card.nextExercise.slice(0, 135)}...` : card.nextExercise}
            </div>
          </div>

          <div style={{ display: "grid", gap: 14, zIndex: 2, marginTop: 28 }}>
            <div style={{ fontSize: 22, color: "#94a3b8", textAlign: "center" }}>Analyzed by SpeakAce AI.</div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                padding: "18px 0",
                borderRadius: 18,
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                color: "white",
                fontSize: 30,
                fontWeight: 700
              }}
            >
              Get Your Score
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}

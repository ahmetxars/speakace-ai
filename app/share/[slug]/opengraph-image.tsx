import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { estimateCountryRank } from "@/lib/share-growth";
import { getSharedResultCard } from "@/lib/shared-result-cards";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await getSharedResultCard(slug);

  if (!card) {
    notFound();
  }
  const rankMeta = estimateCountryRank(card.overallScore, card.examType, card.localeFlag);

  const avatarContent = card.avatarDataUrl ? (
    <img
      alt={card.learnerName}
      src={card.avatarDataUrl}
      width={88}
      height={88}
      style={{
        width: 88,
        height: 88,
        borderRadius: 9999,
        objectFit: "cover",
        border: "3px solid rgba(255,255,255,0.18)"
      }}
    />
  ) : (
    <div
      style={{
        width: 88,
        height: 88,
        borderRadius: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: 32,
        fontWeight: 800,
        background: "linear-gradient(135deg, rgba(96,165,250,0.95), rgba(52,211,153,0.9))",
        border: "3px solid rgba(255,255,255,0.16)"
      }}
    >
      {card.learnerName.slice(0, 2).toUpperCase()}
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #06111f 0%, #0d1a33 52%, #102f43 100%)",
          color: "white",
          fontFamily: "Arial"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -40,
            width: 320,
            height: 320,
            borderRadius: 9999,
            background: "rgba(93, 112, 255, 0.22)",
            filter: "blur(32px)"
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -60,
            bottom: -90,
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: "rgba(16, 185, 129, 0.16)",
            filter: "blur(36px)"
          }}
        />

        <div
          style={{
            margin: 32,
            width: 1136,
            height: 566,
            borderRadius: 34,
            display: "flex",
            flexDirection: "column",
            padding: 36,
            background: "rgba(5, 13, 24, 0.42)",
            border: "1px solid rgba(255,255,255,0.12)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 18px",
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.08)",
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase"
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 9999,
                    background: "linear-gradient(135deg, #60a5fa, #34d399)"
                  }}
                />
                SpeakAce Shared Result
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 26 }}>
                {avatarContent}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 30, fontWeight: 800 }}>{card.learnerName}</div>
                  <div style={{ fontSize: 20, color: "rgba(255,255,255,0.72)" }}>
                    {card.localeFlag} {card.streakLabel}
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: 12,
                    padding: "10px 18px",
                    borderRadius: 9999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 20,
                    fontWeight: 700
                  }}
                >
                  {card.badgeLabel}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>speakace.org</div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.64)" }}>AI speaking score</div>
            </div>
          </div>

          <div style={{ display: "flex", marginTop: 28, justifyContent: "space-between", gap: 28, flex: 1 }}>
            <div
              style={{
                width: 600,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 28,
                borderRadius: 28,
                background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
                border: "1px solid rgba(255,255,255,0.10)"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.08 }}>
                  {card.promptTitle.length > 84 ? `${card.promptTitle.slice(0, 81)}...` : card.promptTitle}
                </div>
                <div style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>
                  {card.examType} • {card.taskType} • {card.difficulty}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
                <div style={{ fontSize: 132, lineHeight: 0.92, fontWeight: 900 }}>{card.overallScore}</div>
                <div style={{ display: "flex", flexDirection: "column", marginBottom: 12 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.84)" }}>{card.scaleLabel}</div>
                  {card.delta != null ? (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 14px",
                        borderRadius: 9999,
                        background: card.delta >= 0 ? "rgba(16,185,129,0.16)" : "rgba(248,113,113,0.16)",
                        color: card.delta >= 0 ? "#86efac" : "#fca5a5",
                        fontSize: 18,
                        fontWeight: 800
                      }}
                    >
                      {card.delta >= 0 ? `+${card.delta}` : `${card.delta}`} vs last try
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={{ width: 480, display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 14
                }}
              >
                {card.categories.slice(0, 4).map((item) => (
                  <div
                    key={item.label}
                    style={{
                      width: 233,
                      padding: 18,
                      borderRadius: 24,
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.10)"
                    }}
                  >
                    <div style={{ fontSize: 18, color: "rgba(255,255,255,0.7)" }}>
                      {item.label.length > 22 ? `${item.label.slice(0, 22)}...` : item.label}
                    </div>
                    <div style={{ fontSize: 42, fontWeight: 900 }}>{item.score}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  padding: 22,
                  borderRadius: 24,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.10)"
                }}
              >
                <div style={{ fontSize: 16, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(255,255,255,0.66)", fontWeight: 700 }}>
                  Next improvement move
                </div>
                <div style={{ fontSize: 22, lineHeight: 1.35, color: "rgba(255,255,255,0.88)" }}>
                  {card.nextExercise.length > 140 ? `${card.nextExercise.slice(0, 137)}...` : card.nextExercise}
                </div>
              </div>

              <div style={{ display: "flex", gap: 14 }}>
                <div
                  style={{
                    flex: 1,
                    padding: 18,
                    borderRadius: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)"
                  }}
                >
                  <div style={{ fontSize: 15, textTransform: "uppercase", letterSpacing: 1.1, color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>
                    Estimated percentile
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{rankMeta.percentileLabel}</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: 18,
                    borderRadius: 20,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.10)"
                  }}
                >
                  <div style={{ fontSize: 15, textTransform: "uppercase", letterSpacing: 1.1, color: "rgba(255,255,255,0.62)", fontWeight: 700 }}>
                    Country signal
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800 }}>{rankMeta.countrySignal}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}

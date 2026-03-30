"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import { ProgressSummary, SpeakingSession } from "@/lib/types";

export function SessionReplay({ session, summary }: { session: SpeakingSession; summary: ProgressSummary }) {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [audioSource, setAudioSource] = useState("");
  const [audioDuration, setAudioDuration] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcript = session.rawTranscript ?? session.transcript ?? "";

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAudioSource(window.localStorage.getItem(`speakace-audio-${session.id}`) ?? "");
  }, [session.id]);

  useEffect(() => {
    if (!currentUser?.id) return;
    void trackClientEvent({ userId: currentUser.id, event: "session_replay_view", path: `/app/replay/${session.id}` });
  }, [currentUser?.id, session.id]);

  const segments = useMemo(() => {
    const parts = transcript.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (!parts.length) return [];
    const duration = audioDuration || parts.length * 3;
    const unit = duration / parts.length;
    return parts.map((text, index) => ({
      text,
      start: index * unit,
      end: (index + 1) * unit
    }));
  }, [audioDuration, transcript]);

  const previous = summary.recentSessions.find((item) => item.id !== session.id && item.prompt.id === session.prompt.id && item.report);

  const jumpTo = (index: number) => {
    if (!audioRef.current || !segments[index]) return;
    audioRef.current.currentTime = segments[index].start;
    audioRef.current.play().catch(() => undefined);
    setActiveIndex(index);
  };

  return (
    <div className="page-shell section">
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "start" }}>
        <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.9rem" }}>
          <span className="eyebrow">{tr ? "Session replay" : "Session replay"}</span>
          <h1 style={{ margin: 0 }}>{session.prompt.title}</h1>
          <p style={{ margin: 0, color: "var(--muted)" }}>{session.examType} · {session.taskType} · {session.report?.scaleLabel ?? (tr ? "Rapor yok" : "No report")}</p>

          {audioSource ? (
            <audio
              ref={audioRef}
              controls
              src={audioSource}
              style={{ width: "100%" }}
              onLoadedMetadata={(event) => setAudioDuration(event.currentTarget.duration || 0)}
              onTimeUpdate={(event) => {
                const time = event.currentTarget.currentTime;
                const next = segments.findIndex((segment) => time >= segment.start && time < segment.end);
                if (next >= 0) setActiveIndex(next);
              }}
            />
          ) : (
            <div style={{ color: "var(--muted)" }}>{tr ? "Bu cihazda ses kaydi bulunamadi." : "No local audio recording was found on this device."}</div>
          )}

          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Transcript timeline" : "Transcript timeline"}</strong>
            <div style={{ display: "grid", gap: "0.6rem", marginTop: "0.75rem" }}>
              {segments.map((segment, index) => (
                <button
                  key={`${segment.text}-${index}`}
                  type="button"
                  className="button button-secondary"
                  onClick={() => jumpTo(index)}
                  style={{
                    textAlign: "left",
                    justifyContent: "flex-start",
                    whiteSpace: "normal",
                    background: activeIndex === index ? "rgba(29, 111, 117, 0.12)" : "rgba(255,255,255,0.55)"
                  }}
                >
                  {segment.text}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.9rem" }}>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.65rem" }}>
            {(session.report?.categories ?? []).map((item) => (
              <div key={item.label} className="card" style={{ padding: "0.8rem", background: "var(--surface-strong)" }}>
                <div className="practice-meta">{item.label}</div>
                <strong>{item.score.toFixed(1)}</strong>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: "1rem", background: "rgba(47, 125, 75, 0.08)" }}>
            <strong>{tr ? "Improved answer" : "Improved answer"}</strong>
            <p style={{ margin: "0.65rem 0 0", lineHeight: 1.75 }}>{session.report?.improvedAnswer ?? (tr ? "Henuz yok." : "Not available yet.")}</p>
          </div>

          <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.06)" }}>
            <strong>{tr ? "Replay insight" : "Replay insight"}</strong>
            <p style={{ margin: "0.65rem 0 0", lineHeight: 1.75 }}>
              {tr
                ? "Bu ekran, kendi kaydını duyup transcript ve geliştirilmiş cevapla aynı anda karşılaştırman için hazırlandı."
                : "This screen is designed so you can hear your own answer while comparing it with the transcript and improved version."}
            </p>
            {typeof session.transcriptQualityScore === "number" ? (
              <div className="practice-meta" style={{ marginTop: "0.55rem" }}>
                {tr ? "Transcript kalitesi" : "Transcript quality"}: {session.transcriptQualityScore.toFixed(0)}/100 · {session.transcriptQualityLabel ?? ""}
              </div>
            ) : null}
          </div>

          {previous?.report ? (
            <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
              <strong>{tr ? "Ayni soruda onceki deneme" : "Previous attempt on the same prompt"}</strong>
              <p style={{ margin: "0.65rem 0 0", lineHeight: 1.7 }}>
                {tr
                  ? `Bir onceki denemen ${previous.report.overall.toFixed(1)} idi. Bu replay ekranini kullanarak nerede daha temiz aktigini duyabilirsin.`
                  : `Your previous attempt scored ${previous.report.overall.toFixed(1)}. Use this replay screen to hear where your delivery sounds cleaner now.`}
              </p>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href={`/app/results/${session.id}`} className="button button-secondary">{tr ? "Result'a don" : "Back to result"}</Link>
            <Link href="/app/practice" className="button button-primary">{tr ? "Yeni practice" : "New practice"}</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

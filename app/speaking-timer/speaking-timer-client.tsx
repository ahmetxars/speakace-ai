"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

type Mode = "part1" | "part2" | "part3" | "toefl-independent" | "toefl-integrated" | "custom";
type Phase = "prep" | "speaking";

type ModeConfig = {
  id: Mode;
  label: string;
  exam: "IELTS" | "TOEFL" | "Custom";
  badge: string;
  description: string;
  tip: string;
  totalSeconds: number;
  phases?: { phase: Phase; label: string; seconds: number }[];
};

const MODES: ModeConfig[] = [
  {
    id: "part1",
    label: "Part 1",
    exam: "IELTS",
    badge: "5 min warm-up",
    description: "Answer 4–5 interview-style questions naturally.",
    tip: "Answer naturally. Don't over-explain. 2–3 sentences per question.",
    totalSeconds: 300,
  },
  {
    id: "part2",
    label: "Part 2",
    exam: "IELTS",
    badge: "1 min prep + 2 min speaking",
    description: "Prepare notes for 1 minute then speak for 2 minutes.",
    tip: "Use prep time to write 3–4 bullet notes. Don't memorize — just outline.",
    totalSeconds: 180,
    phases: [
      { phase: "prep", label: "Preparation", seconds: 60 },
      { phase: "speaking", label: "Speaking", seconds: 120 },
    ],
  },
  {
    id: "part3",
    label: "Part 3",
    exam: "IELTS",
    badge: "5 min discussion",
    description: "Discuss abstract follow-up topics in depth.",
    tip: "Develop your opinion. Use examples. Aim for 3–4 sentences minimum.",
    totalSeconds: 300,
  },
  {
    id: "toefl-independent",
    label: "TOEFL Task 1",
    exam: "TOEFL",
    badge: "15 sec prep + 45 sec speaking",
    description: "State one clear opinion and support it with one compact example.",
    tip: "Choose your side quickly, give one reason, and close with one short example before time ends.",
    totalSeconds: 60,
    phases: [
      { phase: "prep", label: "Preparation", seconds: 15 },
      { phase: "speaking", label: "Speaking", seconds: 45 },
    ],
  },
  {
    id: "toefl-integrated",
    label: "TOEFL Integrated",
    exam: "TOEFL",
    badge: "30 sec prep + 60 sec speaking",
    description: "Summarize source material with a cleaner note structure and calmer delivery.",
    tip: "Focus on the main point plus two support details. Do not try to repeat every sentence from the source.",
    totalSeconds: 90,
    phases: [
      { phase: "prep", label: "Preparation", seconds: 30 },
      { phase: "speaking", label: "Speaking", seconds: 60 },
    ],
  },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${pad(m)}:${pad(s)}`;
}

export default function SpeakingTimerClient() {
  const [activeMode, setActiveMode] = useState<ModeConfig | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("3");
  const [showCustom, setShowCustom] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          // Check if part2 has next phase
          if (activeMode?.phases && phaseIndex < activeMode.phases.length - 1) {
            const nextIndex = phaseIndex + 1;
            setPhaseIndex(nextIndex);
            setRunning(true);
            return activeMode.phases[nextIndex].seconds;
          } else {
            setRunning(false);
            setFinished(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearTimer();
  }, [running, activeMode, phaseIndex, clearTimer]);

  function selectMode(mode: ModeConfig) {
    clearTimer();
    setActiveMode(mode);
    setPhaseIndex(0);
    setTimeLeft(mode.phases ? mode.phases[0].seconds : mode.totalSeconds);
    setRunning(false);
    setFinished(false);
    setShowCustom(false);
  }

  function startCustom() {
    const mins = parseInt(customMinutes, 10);
    if (!mins || mins < 1 || mins > 60) return;
    const custom: ModeConfig = {
      id: "custom",
      label: "Custom",
      exam: "Custom",
      badge: `${mins} min`,
      description: "Custom practice session.",
      tip: "Set your own pace. Stay focused and speak continuously.",
      totalSeconds: mins * 60,
    };
    clearTimer();
    setActiveMode(custom);
    setPhaseIndex(0);
    setTimeLeft(mins * 60);
    setRunning(false);
    setFinished(false);
    setShowCustom(false);
  }

  function handleStartPause() {
    if (finished) return;
    setRunning((r) => !r);
  }

  function handleReset() {
    clearTimer();
    setRunning(false);
    setFinished(false);
    if (activeMode) {
      setPhaseIndex(0);
      setTimeLeft(activeMode.phases ? activeMode.phases[0].seconds : activeMode.totalSeconds);
    }
  }

  const currentPhase =
    activeMode?.phases ? activeMode.phases[phaseIndex] : null;
  const phaseLabel = currentPhase ? currentPhase.label : activeMode?.label ?? "";

  const totalForProgress = currentPhase
    ? currentPhase.seconds
    : (activeMode?.totalSeconds ?? 1);
  const progressPct = activeMode
    ? Math.max(0, Math.min(100, ((totalForProgress - timeLeft) / totalForProgress) * 100))
    : 0;

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  return (
    <main className="page-shell section">
      <div className="section-head">
        <span className="eyebrow">Speaking Timer</span>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}>
          IELTS and TOEFL speaking practice timer
        </h1>
        <p style={{ color: "var(--muted)" }}>
          Select an IELTS or TOEFL format to start a timed practice session with built-in strategy tips.
        </p>
      </div>

      <div className="card" style={{ padding: "1rem", marginBottom: "1.2rem", display: "grid", gap: "0.65rem" }}>
        <strong>Use this timer for real exam-shaped speaking practice</strong>
        <p style={{ margin: 0, color: "var(--muted)" }}>
          Many visitors land here looking for a quick IELTS or TOEFL timer. Use the correct preset,
          then move into a scored speaking attempt when you want transcript review, AI feedback, and retry guidance.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link className="button button-primary" href="/app/practice">
            Start scored practice
          </Link>
          <Link className="button button-secondary" href="/toefl-speaking-practice">
            Open TOEFL practice page
          </Link>
        </div>
      </div>

      {/* Mode selector */}
      <div className="marketing-grid" style={{ marginBottom: "2rem" }}>
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => selectMode(mode)}
            style={{
              textAlign: "left",
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              width: "100%",
            }}
          >
            <article
              className="card feature-card"
              style={{
                border:
                  activeMode?.id === mode.id
                    ? "2px solid var(--primary)"
                    : "1.5px solid var(--border)",
                transition: "border-color 0.15s",
                height: "100%",
              }}
            >
              <span className="pill" style={{ marginBottom: "0.5rem", display: "inline-block" }}>
                {mode.exam} · {mode.badge}
              </span>
              <h2 style={{ fontSize: "1.3rem", marginTop: 0 }}>{mode.label}</h2>
              <p style={{ color: "var(--muted)", fontSize: "0.95rem", margin: 0 }}>
                {mode.description}
              </p>
            </article>
          </button>
        ))}
      </div>

      {/* Custom time */}
      <div style={{ marginBottom: "2rem" }}>
        {!showCustom ? (
          <button
            className="button button-secondary"
            onClick={() => setShowCustom(true)}
            style={{ fontSize: "0.9rem" }}
          >
            Set custom time
          </button>
        ) : (
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="number"
              min={1}
              max={60}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              style={{
                padding: "0.55rem 0.85rem",
                borderRadius: "var(--radius-md, 10px)",
                border: "1.5px solid var(--border)",
                background: "var(--surface)",
                color: "var(--fg, var(--text))",
                fontSize: "1rem",
                width: 90,
              }}
            />
            <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>minutes</span>
            <button className="button button-primary" onClick={startCustom} style={{ fontSize: "0.9rem" }}>
              Use this time
            </button>
            <button
              onClick={() => setShowCustom(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: "0.9rem",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Timer display */}
      {activeMode && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.75rem",
            padding: "2.5rem 1rem",
          }}
        >
          {/* Phase label */}
          {currentPhase && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              {activeMode.phases!.map((p, i) => (
                <span
                  key={p.phase}
                  className="pill"
                  style={{
                    background: i === phaseIndex ? "var(--primary)" : "var(--surface)",
                    color: i === phaseIndex ? "#fff" : "var(--muted)",
                    border: "1px solid var(--border)",
                    fontSize: "0.82rem",
                    transition: "background 0.2s",
                  }}
                >
                  {p.label}
                </span>
              ))}
            </div>
          )}

          {/* SVG circle timer */}
          <div style={{ position: "relative", width: 220, height: 220 }}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="none"
                stroke="var(--border)"
                strokeWidth="10"
              />
              <circle
                cx="110"
                cy="110"
                r="90"
                fill="none"
                stroke={finished ? "var(--success, #3bb86e)" : "var(--primary)"}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 110 110)"
                style={{ transition: running ? "stroke-dashoffset 1s linear" : "none" }}
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {finished ? (
                <span
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 800,
                    color: "var(--success, #3bb86e)",
                    animation: "pulse 1s ease-in-out infinite",
                  }}
                >
                  Time&apos;s up!
                </span>
              ) : (
                <>
                  <span className="pill" style={{ marginBottom: "0.7rem" }}>
                    {activeMode.exam}
                  </span>
                  <span
                    style={{
                      fontSize: "3.2rem",
                      fontWeight: 800,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: "var(--fg, var(--text))",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatTime(timeLeft)}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                    {phaseLabel}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="button button-primary"
              onClick={handleStartPause}
              disabled={finished}
              style={{ minWidth: 110, opacity: finished ? 0.4 : 1 }}
            >
              {running ? "Pause" : finished ? "Done" : "Start"}
            </button>
            <button className="button button-secondary" onClick={handleReset}>
              Reset
            </button>
          </div>

          {/* Tip */}
          <div
            className="card"
            style={{
              padding: "1.1rem 1.4rem",
              maxWidth: 540,
              width: "100%",
              borderLeft: "3px solid var(--primary)",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--muted)", lineHeight: 1.65 }}>
              <strong style={{ color: "var(--fg, var(--text))" }}>Tip: </strong>
              {activeMode.tip}
            </p>
          </div>

          <div
            className="card"
            style={{
              padding: "1.1rem 1.4rem",
              maxWidth: 540,
              width: "100%",
              display: "grid",
              gap: "0.8rem",
            }}
          >
            <strong>What to do after the timer</strong>
            <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--muted)", lineHeight: 1.65 }}>
              Timing practice helps with pace, but most learners improve faster when they also see
              a transcript, score direction, and retry advice. Run the same topic in SpeakAce right
              after this drill to turn timing into measurable progress.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/app/practice" className="button button-primary">
                Practice with AI feedback
              </Link>
              <Link href="/free-ielts-speaking-test" className="button button-secondary">
                Try a free IELTS test
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <div
        style={{
          marginTop: "2rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <p style={{ color: "var(--muted)", fontSize: "1rem" }}>
          Ready to speak? Get instant AI feedback on a real IELTS or TOEFL-style question.
        </p>
        <Link href="/app/practice" className="button button-primary">
          Practice with AI now
        </Link>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

const questions = [
  {
    text: "How often do you hesitate or say 'um/uh' during your answers?",
    options: [
      "Very often (every few words)",
      "Often (every 30 seconds)",
      "Sometimes (when stuck)",
      "Rarely",
    ],
  },
  {
    text: "How long can you speak on a topic without stopping?",
    options: [
      "Less than 30 seconds",
      "About 1 minute",
      "1–2 minutes",
      "More than 2 minutes",
    ],
  },
  {
    text: "How would you describe your vocabulary?",
    options: [
      "I use basic words mostly",
      "I sometimes use advanced words",
      "I use varied vocabulary",
      "I use precise/nuanced vocabulary naturally",
    ],
  },
  {
    text: "How accurate is your grammar under pressure?",
    options: [
      "Many errors in most sentences",
      "Some errors, occasional mistakes",
      "Mostly correct with minor errors",
      "Consistently accurate",
    ],
  },
  {
    text: "How natural does your pronunciation sound?",
    options: [
      "Often hard to understand",
      "Understandable but with strong accent",
      "Clear with minor accent",
      "Very clear and natural",
    ],
  },
  {
    text: "How well can you develop ideas and give examples?",
    options: [
      "One-line answers only",
      "Short answers with basic examples",
      "Developed answers with some examples",
      "Long, detailed, well-structured answers",
    ],
  },
];

type BandInfo = {
  range: string;
  label: string;
  description: string;
  tips: string[];
};

const bandResults: BandInfo[] = [
  {
    range: "4.0–4.5",
    label: "Band 4.0–4.5",
    description:
      "You can communicate basic ideas but hesitation, limited vocabulary, and grammar errors make it difficult for listeners to follow you consistently.",
    tips: [
      "Practise speaking for at least 2 minutes without stopping on simple topics like your daily routine.",
      "Learn 5 new topic-specific words each day and use them in full sentences.",
      "Record yourself answering Part 1 questions and listen back — notice where you hesitate most.",
    ],
  },
  {
    range: "5.0–5.5",
    label: "Band 5.0–5.5",
    description:
      "You can handle straightforward conversations but struggle with complex topics. Errors are noticeable and your answers often lack detail.",
    tips: [
      "Practise extending answers: after every statement, add 'because' or 'for example' to build longer responses.",
      "Reduce filler words by pausing silently instead of saying 'um' — a short pause sounds more confident.",
      "Study linking phrases like 'on the other hand', 'in addition to this', and 'as a result' to connect ideas smoothly.",
    ],
  },
  {
    range: "6.0–6.5",
    label: "Band 6.0–6.5",
    description:
      "You communicate effectively most of the time. Your answers have some development but inconsistency in fluency and grammar holds you back.",
    tips: [
      "Work on self-correction: when you notice an error mid-sentence, correct it naturally rather than stopping.",
      "Aim for 3-sentence minimum answers in Part 1 and full 2-minute monologues in Part 2.",
      "Vary your sentence structures — mix simple, compound, and complex sentences intentionally.",
    ],
  },
  {
    range: "7.0–7.5",
    label: "Band 7.0–7.5",
    description:
      "You speak fluently with only occasional lapses. You use a good range of vocabulary and grammar with flexibility and accuracy.",
    tips: [
      "Push for more precise vocabulary — replace 'good' with 'beneficial', 'important' with 'critical', 'bad' with 'detrimental'.",
      "Practise abstract Part 3 discussions — these require nuanced opinions and hypothetical thinking.",
      "Focus on cohesion: use discourse markers like 'that said', 'what's more', and 'to put it differently'.",
    ],
  },
  {
    range: "8.0+",
    label: "Band 8.0+",
    description:
      "You speak with great fluency and sophistication. Errors are rare and your answers are well-developed, precise, and engaging.",
    tips: [
      "Fine-tune idiomatic expression — native-sounding phrases and collocations distinguish Band 8 from Band 7.",
      "Practise rapid topic-switching: examiners in Part 3 jump between abstract ideas quickly.",
      "Record mock tests and critique yourself on cohesion, not just fluency — the small connectors matter.",
    ],
  },
];

function getBandInfo(total: number): BandInfo {
  if (total <= 9) return bandResults[0];
  if (total <= 13) return bandResults[1];
  if (total <= 17) return bandResults[2];
  if (total <= 21) return bandResults[3];
  return bandResults[4];
}

export default function BandEstimatorClient() {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const total = answers.reduce((a, b) => a + b, 0);
  const band = done ? getBandInfo(total) : null;
  const progress = (current / questions.length) * 100;

  function handleOptionClick(score: number) {
    setSelected(score);
  }

  function handleNext() {
    if (selected === null) return;
    const next = [...answers, selected];
    setAnswers(next);
    if (current + 1 >= questions.length) {
      setDone(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  function handleRestart() {
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setDone(false);
    setCopied(false);
  }

  function handleShare() {
    const text = `I just estimated my IELTS speaking band: ${band?.label}! Take the free quiz at SpeakAce.`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (done && band) {
    return (
      <main className="page-shell section">
        <div className="section-head" style={{ maxWidth: 640, margin: "0 auto" }}>
          <span className="eyebrow">Your result</span>
          <div
            style={{
              fontSize: "clamp(4rem, 12vw, 7rem)",
              fontWeight: 800,
              lineHeight: 1,
              color: "var(--primary)",
              letterSpacing: "-0.03em",
            }}
          >
            {band.label.split(" ")[1]}
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", marginTop: "0.5rem" }}>
            Estimated {band.label}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.7 }}>
            {band.description}
          </p>
        </div>

        <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gap: "1.2rem" }}>
          <div className="card" style={{ padding: "1.5rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>
              3 tips to improve your score
            </h2>
            <ol style={{ margin: 0, paddingLeft: "1.25rem", display: "grid", gap: "0.75rem" }}>
              {band.tips.map((tip, i) => (
                <li key={i} style={{ fontSize: "0.97rem", lineHeight: 1.65, color: "var(--muted)" }}>
                  {tip}
                </li>
              ))}
            </ol>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <Link href="/app/practice" className="button button-primary">
              Practice with AI to improve your score
            </Link>
            <Link href="/ielts-band-score-guide" className="button button-secondary">
              See what band 7+ looks like
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              flexWrap: "wrap",
              paddingTop: "0.5rem",
            }}
          >
            <button
              className="button button-secondary"
              onClick={handleShare}
              style={{ fontSize: "0.9rem" }}
            >
              {copied ? "Copied to clipboard!" : "Share your result"}
            </button>
            <button
              onClick={handleRestart}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                fontSize: "0.9rem",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Retake quiz
            </button>
          </div>
        </div>
      </main>
    );
  }

  const q = questions[current];

  return (
    <main className="page-shell section">
      <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gap: "2rem" }}>
        <div className="section-head" style={{ margin: 0 }}>
          <span className="eyebrow">IELTS Band Estimator</span>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Estimate your IELTS speaking band
          </h1>
          <p style={{ color: "var(--muted)" }}>
            Answer 6 quick questions to get your estimated score and personalised tips.
          </p>
        </div>

        {/* Progress bar */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.85rem",
              color: "var(--muted)",
              marginBottom: "0.5rem",
            }}
          >
            <span>Question {current + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 999,
              background: "var(--border)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "var(--primary)",
                borderRadius: 999,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1.5rem", lineHeight: 1.4 }}>
            {q.text}
          </h2>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {q.options.map((opt, i) => {
              const score = i + 1;
              const isSelected = selected === score;
              return (
                <button
                  key={i}
                  onClick={() => handleOptionClick(score)}
                  style={{
                    textAlign: "left",
                    padding: "0.85rem 1.1rem",
                    borderRadius: "var(--radius-md, 10px)",
                    border: isSelected
                      ? "2px solid var(--primary)"
                      : "1.5px solid var(--border)",
                    background: isSelected ? "color-mix(in oklch, var(--primary) 8%, transparent)" : "var(--surface)",
                    color: "var(--fg, var(--text))",
                    cursor: "pointer",
                    fontSize: "0.97rem",
                    lineHeight: 1.5,
                    fontWeight: isSelected ? 600 : 400,
                    transition: "border-color 0.15s, background 0.15s",
                    width: "100%",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            className="button button-primary"
            onClick={handleNext}
            disabled={selected === null}
            style={{ opacity: selected === null ? 0.45 : 1, cursor: selected === null ? "not-allowed" : "pointer" }}
          >
            {current + 1 === questions.length ? "See my result" : "Next question"}
          </button>
        </div>
      </div>
    </main>
  );
}

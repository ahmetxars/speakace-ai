"use client";

import type { Route } from "next";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Mic, MicOff, Sparkles, Volume2 } from "lucide-react";
import { trackClientEvent } from "@/lib/analytics-client";

type MiniSpeakingDemoProps = {
  language: "en" | "tr";
  prompt?: string;
  source?: string;
  ctaHref?: Route;
  ctaLabel?: string;
};

type DemoFeedback = {
  score: string;
  headline: string;
  tips: string[];
  fillers: string[];
};

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  [index: number]: { transcript?: string } | undefined;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

const fillerLexicon = ["um", "uh", "like", "you know", "actually", "basically", "ee", "ıı", "yani", "şey"];

function analyzeTranscript(transcript: string, language: "en" | "tr"): DemoFeedback {
  const normalized = transcript.toLowerCase();
  const words = transcript.trim().split(/\s+/).filter(Boolean);
  const fillerHits = fillerLexicon.filter((item) => normalized.includes(item));
  const sentenceCount = transcript.split(/[.!?]/).filter((item) => item.trim().length > 0).length || 1;
  const averageSentenceLength = words.length / sentenceCount;

  let score = 6.0;
  if (words.length >= 35) score += 0.3;
  if (averageSentenceLength >= 10) score += 0.2;
  if (!fillerHits.length) score += 0.2;
  if (words.length < 18) score -= 0.4;
  if (fillerHits.length >= 2) score -= 0.3;

  const tips = language === "tr"
    ? [
        words.length < 20 ? "Cevabı biraz daha geliştir: net bir neden ve kısa bir örnek ekle." : "Uzunluk iyi görünüyor; şimdi örneği biraz daha somutlaştır.",
        fillerHits.length ? `Filler words duyuldu: ${fillerHits.join(", ")}. Sessiz duraklama daha güçlü duyulur.` : "Filler words düşük görünüyor; bu iyi bir akıcılık sinyali.",
        averageSentenceLength < 8 ? "Kısa cümleleri bir bağlaçla birleştirip ritmi yumuşat." : "Cümle ritmi daha dengeli; bir kişisel detay eklemek puanı yukarı taşır."
      ]
    : [
        words.length < 20 ? "Develop the answer a bit more: add one clear reason and one short example." : "The length is workable; now make the example more specific.",
        fillerHits.length ? `Filler words detected: ${fillerHits.join(", ")}. A silent pause usually sounds stronger.` : "Filler words are low, which is a good fluency signal.",
        averageSentenceLength < 8 ? "Link short sentences with one natural connector to smooth the rhythm." : "The rhythm is more stable now; one personal detail would push it higher."
      ];

  return {
    score: score.toFixed(1),
    headline: language === "tr" ? "Hızlı pratik sinyali" : "Quick practice signal",
    tips,
    fillers: fillerHits
  };
}

export function MiniSpeakingDemo({
  language,
  prompt,
  source = "homepage_speaking_demo",
  ctaHref = "/app/practice?quickStart=1&runMode=interview&activation=marketing_demo",
  ctaLabel
}: MiniSpeakingDemoProps) {
  const tr = language === "tr";
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const completionTrackedRef = useRef(false);
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  const feedback = useMemo(
    () => (finalTranscript.trim() ? analyzeTranscript(finalTranscript, language) : null),
    [finalTranscript, language]
  );
  const displayedPrompt = prompt ?? (
    tr
      ? "Yaşadığın yeri senin için özel yapan şey nedir?"
      : "What makes your hometown a good place to live?"
  );
  const fullTestLabel = ctaLabel ?? (
    tr ? "Tam ücretsiz değerlendirmeye geç" : "Continue to the full free assessment"
  );

  const trackDemoEvent = (
    event: "marketing_demo_started" | "marketing_demo_completed" | "marketing_demo_cta_click"
  ) => {
    void trackClientEvent({
      event,
      path: typeof window === "undefined" ? undefined : window.location.pathname,
      source,
      locale: language
    });
  };

  const startRecording = () => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? ((window as SpeechRecognitionWindow).SpeechRecognition
          ?? (window as SpeechRecognitionWindow).webkitSpeechRecognition)
        : null;

    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = tr ? "tr-TR" : "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let interim = "";
      let finalText = "";

      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += `${result[0]?.transcript ?? ""} `;
        } else {
          interim += result[0]?.transcript ?? "";
        }
      }

      setTranscript(interim);
      if (finalText.trim()) {
        setFinalTranscript((current) => `${current} ${finalText}`.trim());
        if (!completionTrackedRef.current) {
          completionTrackedRef.current = true;
          trackDemoEvent("marketing_demo_completed");
        }
      }
    };

    recognition.onerror = () => {
      setRecording(false);
      setSupported(false);
    };

    recognition.onend = () => {
      setRecording(false);
      setTranscript("");
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setSupported(true);
      setRecording(true);
      trackDemoEvent("marketing_demo_started");
    } catch {
      setRecording(false);
      setSupported(false);
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const previewTranscript = finalTranscript || transcript;

  return (
    <div
      className="marketing-demo-card"
      style={{
        background: "linear-gradient(180deg, color-mix(in oklch, var(--card) 95%, white 5%), color-mix(in oklch, var(--surface-strong) 88%, var(--card) 12%))",
        border: "1px solid var(--border)",
        borderRadius: "22px",
        boxShadow: "0 24px 60px oklch(0.22 0.03 250 / 0.08)",
        display: "grid",
        gap: "1rem"
      }}
    >
      <div className="demo-label">{tr ? "Mini demo" : "Mini demo"}</div>
      <div
        style={{
          borderLeft: "3px solid var(--primary)",
          padding: "0.15rem 0 0.15rem 0.85rem",
          display: "grid",
          gap: "0.25rem"
        }}
      >
        <span className="practice-meta">{tr ? "60 saniyelik soru" : "60-second prompt"}</span>
        <strong style={{ fontSize: "1.15rem", lineHeight: 1.45 }}>{displayedPrompt}</strong>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <strong style={{ fontSize: "1.05rem" }}>{tr ? "Mikrofona bas ve kısa bir cevap ver" : "Tap the mic and give a short answer"}</strong>
          <p style={{ margin: "0.35rem 0 0", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
            {tr ? "Tarayıcının konuşma tanımasını kullanır; cevap uzunluğu, filler words ve akış için hızlı bir sinyal verir." : "It uses your browser's speech recognition to give a quick signal for answer length, filler words, and flow."}
          </p>
        </div>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className="button button-primary"
          aria-pressed={recording}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}
        >
          {recording ? <MicOff size={18} /> : <Mic size={18} />}
          {recording ? (tr ? "Kaydı durdur" : "Stop recording") : (tr ? "Mikrofonu aç" : "Start speaking")}
        </button>
      </div>

      {!supported ? (
        <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.08)" }}>
          <strong>{tr ? "Bu tarayıcıda konuşma demosu açılamadı" : "Speech demo is not available in this browser"}</strong>
          <p style={{ margin: "0.45rem 0 0", color: "var(--muted-foreground)", lineHeight: 1.65 }}>
            {tr ? "Chrome veya Safari ile tekrar deneyebilir ya da aşağıdaki bağlantıdan tam ücretsiz speaking testine geçebilirsin." : "Try again in Chrome or Safari, or continue to the full free speaking test below."}
          </p>
        </div>
      ) : null}

      <div
        style={{
          borderRadius: "18px",
          padding: "1rem",
          background: "var(--card)",
          border: "1px solid var(--border)",
          color: "var(--muted-foreground)",
          lineHeight: 1.7,
          minHeight: "110px"
        }}
        aria-live="polite"
      >
        {previewTranscript || (tr ? "Örnek: I think my hometown is special because..." : "Example: I think my hometown is special because...")}
      </div>

      {feedback ? (
        <div style={{ display: "grid", gap: "0.75rem" }} aria-live="polite">
          <div className="card" style={{ padding: "1rem", background: "rgba(47, 125, 75, 0.08)", display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Sparkles size={18} style={{ color: "var(--accent)" }} />
              <div>
                <strong>{feedback.headline}</strong>
                <div className="practice-meta">{tr ? "Cevap kalıbı sinyali · resmi band değil" : "Answer-pattern signal · not an official band"}</div>
              </div>
            </div>
            <strong style={{ fontSize: "1.5rem" }}>{feedback.score}</strong>
          </div>

          {feedback.tips.map((item) => (
            <div key={item} className="card" style={{ padding: "0.9rem", background: "color-mix(in oklch, var(--card) 82%, var(--surface-strong) 18%)", border: "1px solid var(--border)", display: "flex", gap: "0.7rem" }}>
              <Volume2 size={16} style={{ color: "var(--primary)", marginTop: "0.15rem", flexShrink: 0 }} />
              <span style={{ fontSize: "0.92rem", lineHeight: 1.65 }}>{item}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap"
        }}
      >
        <div style={{ maxWidth: "34rem" }}>
          <strong>{tr ? "Transkript ve dört kriter geri bildirimi ister misin?" : "Want a transcript and four-criterion feedback?"}</strong>
          <p style={{ margin: "0.3rem 0 0", color: "var(--muted-foreground)", lineHeight: 1.55, fontSize: "0.9rem" }}>
            {tr ? "Tam test kaydını değerlendirir; bu mini sinyal yalnızca hızlı bir ısınmadır." : "The full test evaluates your recording; this mini signal is only a quick warm-up."}
          </p>
        </div>
        <Link
          className="button button-secondary"
          href={ctaHref}
          onClick={() => trackDemoEvent("marketing_demo_cta_click")}
        >
          {fullTestLabel}
        </Link>
      </div>
    </div>
  );
}

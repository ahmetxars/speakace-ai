"use client";

import { useMemo, useRef, useState } from "react";
import { Mic, MicOff, Sparkles, Volume2 } from "lucide-react";

type MiniSpeakingDemoProps = {
  language: "en" | "tr";
};

type DemoFeedback = {
  score: string;
  headline: string;
  tips: string[];
  fillers: string[];
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
    headline: language === "tr" ? "Mini AI geri bildirim sinyali" : "Mini AI feedback signal",
    tips,
    fillers: fillerHits
  };
}

export function MiniSpeakingDemo({ language }: MiniSpeakingDemoProps) {
  const tr = language === "tr";
  const recognitionRef = useRef<any>(null);
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  const feedback = useMemo(
    () => (finalTranscript.trim() ? analyzeTranscript(finalTranscript, language) : null),
    [finalTranscript, language]
  );

  const startRecording = () => {
    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? ((window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition
          ?? (window as Window & { webkitSpeechRecognition?: any }).webkitSpeechRecognition)
        : null;

    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = tr ? "tr-TR" : "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
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
    setSupported(true);
    setRecording(true);
    recognition.start();
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
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <strong style={{ fontSize: "1.05rem" }}>{tr ? "Mikrofona bas ve kısa bir cevap ver" : "Tap the mic and give a short answer"}</strong>
          <p style={{ margin: "0.35rem 0 0", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
            {tr ? "Demo, cevap uzunluğu, filler words ve akış sinyaline göre anında bir geri bildirim üretir." : "The demo produces an instant feedback signal from answer length, filler words, and response flow."}
          </p>
        </div>
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          className="button button-primary"
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
            {tr ? "Chrome veya Safari ile tekrar deneyebilirsin. Production sürümde bu kutu gerçek speaking test akışına yönlendirme için de kullanılabilir." : "Try again in Chrome or Safari. In production this box can also route learners into the full speaking test flow."}
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
      >
        {previewTranscript || (tr ? "Örnek: I think my hometown is special because..." : "Example: I think my hometown is special because...")}
      </div>

      {feedback ? (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          <div className="card" style={{ padding: "1rem", background: "rgba(47, 125, 75, 0.08)", display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Sparkles size={18} style={{ color: "var(--accent)" }} />
              <div>
                <strong>{feedback.headline}</strong>
                <div className="practice-meta">{tr ? "Tahmini mini band sinyali" : "Estimated mini band signal"}</div>
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
    </div>
  );
}

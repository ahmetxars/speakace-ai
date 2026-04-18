"use client";

import { useEffect, useMemo, useState } from "react";

export function BlogAudioExample({
  title,
  transcript,
  tr
}: {
  title: string;
  transcript: string;
  tr: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const shortTranscript = useMemo(() => transcript.trim(), [transcript]);

  const togglePlayback = () => {
    if (!supported) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(shortTranscript);
    utterance.rate = 0.94;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    setPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section
      className="card"
      style={{
        marginTop: "1.3rem",
        padding: "1.15rem",
        border: "1px solid color-mix(in oklch, var(--primary) 20%, var(--border) 80%)",
        background: "color-mix(in oklch, var(--primary) 5%, var(--card) 95%)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div className="eyebrow">{tr ? "AI sesli örnek" : "AI audio example"}</div>
          <h3 style={{ margin: "0.35rem 0 0" }}>{title}</h3>
        </div>
        <button type="button" className="button button-primary" onClick={togglePlayback} disabled={!supported}>
          {supported ? (playing ? (tr ? "Durdur" : "Stop") : (tr ? "Oynat" : "Play sample")) : (tr ? "Tarayıcı desteklemiyor" : "Browser unsupported")}
        </button>
      </div>
      <p style={{ marginTop: "0.85rem", color: "var(--muted-foreground)", lineHeight: 1.75 }}>{shortTranscript}</p>
    </section>
  );
}

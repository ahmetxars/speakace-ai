"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers";
import { proofStories } from "@/lib/improvement-center";

export function GrowthProofBoard() {
  const { language } = useAppState();
  const tr = language === "tr";

  return (
    <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
      <div>
        <span className="eyebrow">{tr ? "Örnek akışlar" : "Example workflows"}</span>
        <h2 style={{ margin: "0.55rem 0 0.2rem" }}>{tr ? "Farklı hedefler için çalışma modelleri" : "Practice models for different goals"}</h2>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr ? "Bunlar müşteri yorumu değil, SpeakAce'i farklı hedeflerde nasıl kullanabileceğini gösteren örnek senaryolardır." : "These are illustrative scenarios, not customer testimonials. Use them to choose a workflow that fits your goal."}
        </p>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.8rem" }}>
        {proofStories.map((story) => (
          <article key={story.name} className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.45rem" }}>
            <strong>{story.name}</strong>
            <span className="practice-meta">{story.role}</span>
            <div style={{ fontSize: "0.92rem", lineHeight: 1.65 }}>
              <strong>{tr ? "Başlangıç:" : "Starting point:"}</strong> {story.before}
            </div>
            <div style={{ fontSize: "0.92rem", lineHeight: 1.65 }}>
              <strong>{tr ? "Hedef akış:" : "Target workflow:"}</strong> {story.after}
            </div>
            <div style={{ color: "var(--muted)", lineHeight: 1.65 }}>{story.note}</div>
          </article>
        ))}
      </div>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <Link href="/success-stories" className="button button-primary">{tr ? "Success stories sayfasını aç" : "Open success stories"}</Link>
        <Link href="/reviews" className="button button-secondary">{tr ? "Yorumları gör" : "See reviews"}</Link>
      </div>
    </section>
  );
}

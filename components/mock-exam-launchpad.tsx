"use client";

import Link from "next/link";
import { useAppState } from "@/components/providers";

export function MockExamLaunchpad() {
  const { language } = useAppState();
  const tr = language === "tr";

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.85rem" }}>
        <span className="eyebrow">Mock exam</span>
        <h1 style={{ margin: 0 }}>{tr ? "Tam speaking mock exam modu" : "Full speaking mock exam mode"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr
            ? "Gerçek sınav hissi için tam simülasyon çöz, sonra toplu rapor, readiness band ve 1 haftalık çalışma planını gör."
            : "Run a full simulation for a more exam-like feel, then review the summary report, readiness band, and one-week action plan."}
        </p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Mock exam neden önemli?" : "Why mock exam mode matters"}</strong>
          {[
            tr ? "Gerçek sınav ritmini ve enerji yönetimini gösterir." : "Shows your real exam rhythm and pacing under pressure.",
            tr ? "Tek task yerine tüm speaking zincirini birlikte ölçer." : "Measures the whole speaking chain instead of one isolated task.",
            tr ? "Haftalık planı tahmine değil veriye göre kurar." : "Builds the weekly plan from actual performance instead of guesses."
          ].map((item) => (
            <div key={item} className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)" }}>{item}</div>
          ))}
          <Link href="/app/practice" className="button button-primary">{tr ? "Practice konsolunu aç" : "Open practice console"}</Link>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <strong>{tr ? "Simülasyon sonrası akış" : "After the simulation"}</strong>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.45rem" }}>
            <strong>{tr ? "1. Tamamla" : "1. Complete"}</strong>
            <span style={{ color: "var(--muted)", lineHeight: 1.65 }}>{tr ? "IELTS veya TOEFL speaking akışını bitir." : "Finish the IELTS or TOEFL speaking sequence."}</span>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.45rem" }}>
            <strong>{tr ? "2. Mock report" : "2. Mock report"}</strong>
            <span style={{ color: "var(--muted)", lineHeight: 1.65 }}>{tr ? "Ortalama skor, readiness ve görev dağılımını gör." : "Review the average score, readiness, and task breakdown."}</span>
          </div>
          <Link href="/app/mock-results" className="button button-secondary">{tr ? "Son mock raporu aç" : "Open the latest mock report"}</Link>
        </div>
      </section>
    </main>
  );
}

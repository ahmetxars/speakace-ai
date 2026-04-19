"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import { WritingSession, WritingSummary, WritingTaskType } from "@/lib/types";

export function WritingResultView({ session, summary }: { session: WritingSession; summary: WritingSummary }) {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const canExport = Boolean(currentUser && currentUser.plan !== "free");
  const previous = summary.recentSessions.find((item) => item.id !== session.id && item.prompt.id === session.prompt.id && item.report);
  const delta = previous?.report && session.report ? Number((session.report.overall - previous.report.overall).toFixed(1)) : null;
  const comparePairs = useMemo(() => buildParagraphPairs(session.draftText ?? "", session.report?.correctedVersion ?? ""), [session.draftText, session.report?.correctedVersion]);
  const sentenceComments = useMemo(
    () => buildSentenceComments({ draft: session.draftText ?? "", corrected: session.report?.correctedVersion ?? "", taskType: session.taskType, tr }),
    [session.draftText, session.report?.correctedVersion, session.taskType, tr]
  );

  const taskLabel = session.taskType === "ielts-writing-task-1" ? "IELTS Writing Task 1" : "IELTS Writing Task 2";
  const retryPath = session.taskType === "ielts-writing-task-1" ? "/app/writing/task-1" : "/app/writing/task-2";

  const exportPdf = () => {
    if (!session.report || typeof window === "undefined") return;
    if (currentUser?.id) {
      void trackClientEvent({ userId: currentUser.id, event: "writing_pdf_export", path: `/app/writing/results/${session.id}` });
    }
    const win = window.open("", "_blank", "noopener,noreferrer,width=960,height=1200");
    if (!win) return;
    const report = session.report;
    win.document.write(`<!doctype html><html><head><meta charset="utf-8" /><title>${escapeHtml(session.prompt.title)}</title><style>
      body{font-family:Arial,sans-serif;margin:40px;color:#111827}.hero,.card{border:1px solid #d9e3ef;border-radius:16px;padding:20px;margin-bottom:18px}.score{font-size:54px;font-weight:800;color:#2563eb}.row{display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-bottom:1px solid #eef2f7}.row:last-child{border-bottom:none}h1,h2,h3{margin:0 0 10px}p,li{line-height:1.6;font-size:14px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
    </style></head><body>
      <section class="hero"><h1>${escapeHtml(session.prompt.title)}</h1><p>${escapeHtml(taskLabel)} • ${escapeHtml(session.difficulty)}</p><div class="score">${report.overall}</div><p>${escapeHtml(report.scaleLabel)}</p></section>
      <section class="grid"><div class="card"><h2>${tr ? "Kategori skorları" : "Category scores"}</h2>${report.categories.map((item) => `<div class="row"><span>${escapeHtml(item.label)}</span><strong>${item.score}</strong></div>`).join("")}</div><div class="card"><h2>${tr ? "Bir sonraki adım" : "Next step"}</h2><p>${escapeHtml(report.nextExercise)}</p><h3>${tr ? "Retry outline" : "Retry outline"}</h3><ul>${report.outline.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div></section>
      <section class="card"><h2>${tr ? "Sentence comments" : "Sentence comments"}</h2><ul>${sentenceComments.map((item) => `<li><strong>${escapeHtml(item.title)}:</strong> ${escapeHtml(item.comment)}</li>`).join("")}</ul></section>
      <section class="card"><h2>${tr ? "Senin yazın" : "Your writing"}</h2><p>${escapeHtml(session.draftText ?? "")}</p></section>
      <section class="card"><h2>${tr ? "Düzeltilmiş versiyon" : "Corrected version"}</h2><p>${escapeHtml(report.correctedVersion)}</p></section>
    </body></html>`);
    win.document.close();
    win.focus();
    window.setTimeout(() => win.print(), 150);
  };

  if (!session.report) {
    return null;
  }

  return (
    <main className="page-shell section">
      <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gap: "1.4rem" }}>
        <div style={{ textAlign: "center", paddingTop: "0.6rem" }}>
          <div className="eyebrow">{tr ? "Writing result" : "Writing result"}</div>
          <h1 style={{ margin: "0.4rem 0" }}>{session.prompt.title}</h1>
          <p style={{ margin: "0 0 0.45rem", color: "var(--muted-foreground)" }}>{taskLabel}</p>
          <div style={{ fontSize: "4.6rem", lineHeight: 1, fontWeight: 900, color: "var(--primary)" }}>{session.report.overall}</div>
          <p style={{ margin: "0.35rem 0 0", color: "var(--muted-foreground)" }}>{session.report.scaleLabel}</p>
          {delta !== null ? <p style={{ margin: "0.45rem 0 0", fontWeight: 700, color: delta >= 0 ? "oklch(0.55 0.18 165)" : "oklch(0.55 0.2 20)" }}>{delta >= 0 ? `+${delta}` : `${delta}`} {tr ? "aynı task'in son denemesine göre" : "vs your last draft on this task"}</p> : null}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <section className="card" style={{ padding: "1.1rem" }}>
            <strong style={{ display: "block", marginBottom: "0.85rem" }}>{tr ? "Kategori skorları" : "Category scores"}</strong>
            <div style={{ display: "grid", gap: "0.7rem" }}>
              {session.report.categories.map((item) => (
                <div key={item.category} style={{ display: "grid", gap: "0.35rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem" }}>
                    <span>{item.label}</span>
                    <strong>{item.score}</strong>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                    <div style={{ width: `${(item.score / 9) * 100}%`, height: "100%", borderRadius: 999, background: "var(--primary)" }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="card" style={{ padding: "1.1rem", display: "grid", gap: "0.8rem" }}>
            <strong>{tr ? "Retry planı" : "Retry plan"}</strong>
            {session.report.outline.map((item) => (
              <div key={item} style={{ padding: "0.75rem 0.85rem", borderRadius: 12, background: "var(--secondary)", border: "1px solid var(--border)" }}>{item}</div>
            ))}
          </section>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <section className="card" style={{ padding: "1.1rem" }}>
            <strong style={{ display: "block", marginBottom: "0.7rem", color: "oklch(0.45 0.18 165)" }}>{tr ? "Güçlü yönler" : "Strengths"}</strong>
            <ul style={{ margin: 0, paddingLeft: "1.15rem", display: "grid", gap: "0.45rem" }}>
              {session.report.strengths.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
          <section className="card" style={{ padding: "1.1rem" }}>
            <strong style={{ display: "block", marginBottom: "0.7rem", color: "oklch(0.45 0.18 20)" }}>{tr ? "Geliştir" : "Improve next"}</strong>
            <ul style={{ margin: 0, paddingLeft: "1.15rem", display: "grid", gap: "0.45rem" }}>
              {session.report.improvements.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </section>
        </div>

        <section className="card" style={{ padding: "1.1rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <strong>{tr ? "Sentence-level comments" : "Sentence-level comments"}</strong>
            <p style={{ margin: "0.35rem 0 0", color: "var(--muted-foreground)", lineHeight: 1.6 }}>
              {tr ? "Her cümlede geliştirilecek en net noktayı gösterir; böylece bir sonraki denemede neyi değiştireceğin belli olur." : "Shows the clearest improvement target in each sentence so the next retry feels specific, not vague."}
            </p>
          </div>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {sentenceComments.map((item, index) => (
              <div key={`${index}-${item.original}`} style={{ borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
                <div style={{ padding: "0.9rem 1rem", background: "var(--card)", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "0.35rem" }}>{item.title}</div>
                  <p style={{ margin: 0, lineHeight: 1.75 }}>{item.original || "—"}</p>
                </div>
                <div style={{ padding: "0.9rem 1rem", background: "color-mix(in oklch, var(--primary) 6%, var(--card) 94%)", display: "grid", gap: "0.5rem" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--primary)" }}>{item.comment}</div>
                  {item.rewrite ? <p style={{ margin: 0, lineHeight: 1.75 }}>{item.rewrite}</p> : null}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: "1.1rem", display: "grid", gap: "0.9rem" }}>
          <strong>{tr ? "Original vs corrected" : "Original vs corrected"}</strong>
          {comparePairs.map((pair, index) => (
            <div key={index} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: "1rem", background: "var(--card)", borderRight: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted-foreground)", marginBottom: "0.4rem" }}>{tr ? "Senin draft'in" : "Your draft"}</div>
                  <p style={{ margin: 0, lineHeight: 1.75 }}>{pair.original || "—"}</p>
                </div>
                <div style={{ padding: "1rem", background: "color-mix(in oklch, var(--primary) 6%, var(--card) 94%)" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", marginBottom: "0.4rem" }}>{tr ? "Güçlü versiyon" : "Stronger version"}</div>
                  <p style={{ margin: 0, lineHeight: 1.75 }}>{pair.corrected || "—"}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <section className="card" style={{ padding: "1.1rem" }}>
            <strong style={{ display: "block", marginBottom: "0.7rem" }}>{tr ? "Senin yazın" : "Your writing"}</strong>
            <p style={{ margin: 0, lineHeight: 1.85, color: "var(--muted-foreground)" }}>{session.draftText}</p>
          </section>
          <section className="card" style={{ padding: "1.1rem" }}>
            <strong style={{ display: "block", marginBottom: "0.7rem", color: "var(--primary)" }}>{tr ? "Düzeltilmiş versiyon" : "Corrected version"}</strong>
            <p style={{ margin: 0, lineHeight: 1.85 }}>{session.report.correctedVersion}</p>
          </section>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href={`${retryPath}?promptId=${session.prompt.id}&difficulty=${session.difficulty}&retryOf=${session.id}`} className="button button-primary" onClick={() => currentUser?.id ? void trackClientEvent({ userId: currentUser.id, event: "writing_retry", path: "/app/writing/results" }) : undefined}>
            {tr ? "Aynı task'i tekrar dene" : "Retry this task"}
          </Link>
          <Link href="/app/writing" className="button button-secondary">{tr ? "Writing hub" : "Writing hub"}</Link>
          {canExport ? <button type="button" className="button button-secondary" onClick={exportPdf}>{tr ? "PDF raporu indir" : "Download PDF report"}</button> : null}
        </div>
      </div>
    </main>
  );
}

function buildParagraphPairs(original: string, corrected: string) {
  const split = (text: string) => text.split(/\n\s*\n/).map((item) => item.trim()).filter(Boolean);
  const left = split(original);
  const right = split(corrected);
  const max = Math.max(left.length, right.length);
  return Array.from({ length: max }, (_, index) => ({ original: left[index] ?? "", corrected: right[index] ?? "" }));
}

function buildSentenceComments(input: { draft: string; corrected: string; taskType: WritingTaskType; tr: boolean }) {
  const originalSentences = splitSentences(input.draft);
  const correctedSentences = splitSentences(input.corrected);
  const limit = Math.max(1, Math.min(Math.max(originalSentences.length, correctedSentences.length), 6));

  return Array.from({ length: limit }, (_, index) => {
    const original = originalSentences[index] ?? "";
    const rewrite = correctedSentences[index] ?? correctedSentences[correctedSentences.length - 1] ?? "";
    const title = input.tr ? `${index + 1}. cümle` : `Sentence ${index + 1}`;
    return {
      title,
      original,
      rewrite,
      comment: buildSentenceComment({ sentence: original, rewrite, index, taskType: input.taskType, tr: input.tr })
    };
  });
}

function buildSentenceComment(input: { sentence: string; rewrite: string; index: number; taskType: WritingTaskType; tr: boolean }) {
  const sentence = input.sentence.trim();
  const wordCount = sentence ? sentence.split(/\s+/).filter(Boolean).length : 0;
  const lowered = sentence.toLowerCase();

  if (!sentence) {
    return input.tr ? "Bu bölüm eksik kalmış. Sonraki denemede buraya tam bir cümle ekle." : "This part is missing. Add a complete sentence here in the next retry.";
  }

  if (input.taskType === "ielts-writing-task-1") {
    if (input.index === 0 && !/overall|the chart|the graph|the table|the maps|the diagram/i.test(sentence)) {
      return input.tr ? "Açılışı daha rapor gibi yap; görseli tarafsız biçimde tanıt." : "Make the opening sound more like a report by introducing the visual neutrally.";
    }
    if (!/overall|in general|it is clear/i.test(lowered) && wordCount > 8 && input.index <= 1) {
      return input.tr ? "Bu noktada ana trendi tek cümlede özetleyen bir overview eklemek skoru yükseltir." : "Adding a one-sentence overview of the main trend here would raise the score.";
    }
    if (!/%|percent|higher|lower|more|less|rose|fell|increased|decreased|compared|while|whereas|respectively/i.test(lowered)) {
      return input.tr ? "Cümle veri anlatıyor ama karşılaştırma dili zayıf; higher, lower, while, compared with gibi ifadeler ekle." : "The sentence describes data, but the comparison language is weak; add phrases like higher, lower, while, or compared with.";
    }
    if (wordCount > 28) {
      return input.tr ? "Cümle fazla uzun. Ana karşılaştırmayı koruyup iki daha net cümleye böl." : "This sentence is too long. Keep the main comparison, but split it into two cleaner sentences.";
    }
    return input.tr ? "Bu cümle çalışıyor; sadece fiilleri daha net seçip karşılaştırmayı biraz daha keskinleştir." : "This sentence is working; just sharpen the verb choice and make the comparison slightly clearer.";
  }

  if (input.index === 0 && !/i think|i believe|i agree|i disagree|in my opinion/i.test(lowered)) {
    return input.tr ? "Girişte pozisyonunu daha açık söyle; examiner senin duruşunu hemen görmeli." : "State your position more clearly in the opening so the examiner sees your stance immediately.";
  }
  if (!/for example|for instance|because|this means|as a result|therefore|for this reason/i.test(lowered) && wordCount > 8) {
    return input.tr ? "Burada fikir var ama destek zayıf. Bir neden ya da kısa örnek ekleyince cümle daha ikna edici olur." : "There is an idea here, but the support is thin. Add a reason or short example to make it more convincing.";
  }
  if (wordCount > 30) {
    return input.tr ? "Cümle fazla yük taşıyor. Ana iddiayı koruyup devam fikrini ayrı bir cümleye taşı." : "This sentence is carrying too much. Keep the main claim here and move the follow-up idea into a second sentence.";
  }
  return input.tr ? "Bu cümle iyi bir temel sunuyor; şimdi bağlayıcıyı ve örneği biraz daha doğal hale getir." : "This sentence gives you a solid base; now make the linker and example sound a little more natural.";
}

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

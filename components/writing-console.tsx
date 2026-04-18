"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import { listWritingPrompts } from "@/lib/writing-prompts";
import { Difficulty, WritingPromptTemplate, WritingTaskType } from "@/lib/types";

export function WritingConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const initialDifficulty = (searchParams.get("difficulty") as Difficulty | null) ?? "Target";
  const [difficulty, setDifficulty] = useState<Difficulty>(["Starter", "Target", "Stretch"].includes(initialDifficulty) ? initialDifficulty : "Target");
  const [selectedPromptId, setSelectedPromptId] = useState(searchParams.get("promptId") ?? "");
  const [essay, setEssay] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(tr ? "Bir Task 2 konusu seç ve yazmaya başla." : "Pick a Task 2 topic and start writing.");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const prompts = useMemo(() => listWritingPrompts(difficulty), [difficulty]);
  const selectedPrompt = useMemo<WritingPromptTemplate | null>(() => prompts.find((item) => item.id === selectedPromptId) ?? prompts[0] ?? null, [prompts, selectedPromptId]);
  const wordCount = essay.trim() ? essay.trim().split(/\s+/).filter(Boolean).length : 0;

  const startWritingSession = async () => {
    if (!currentUser || !selectedPrompt) return;
    setLoading(true);
    setError(null);
    setStatus(tr ? "Writing oturumu hazırlanıyor..." : "Preparing your writing session...");
    try {
      const response = await fetch("/api/writing/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          taskType: "ielts-writing-task-2" satisfies WritingTaskType,
          difficulty,
          promptId: selectedPrompt.id
        })
      });
      const data = (await response.json()) as { error?: string; session?: { id: string } };
      if (!response.ok || !data.session) {
        setError(data.error ?? (tr ? "Writing oturumu başlatılamadı." : "Could not start writing session."));
        setLoading(false);
        return;
      }
      setSessionId(data.session.id);
      setStartedAt(Date.now());
      setStatus(tr ? "Taslağını yaz ve değerlendirmeye gönder." : "Write your draft and send it for evaluation.");
      void trackClientEvent({ userId: currentUser.id, event: "writing_start", path: "/app/writing/task-2" });
    } catch {
      setError(tr ? "Writing oturumu başlatılamadı." : "Could not start writing session.");
    } finally {
      setLoading(false);
    }
  };

  const evaluateWriting = async () => {
    if (!currentUser || !selectedPrompt) return;
    setLoading(true);
    setError(null);
    try {
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const response = await fetch("/api/writing/session/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUser.id, taskType: "ielts-writing-task-2", difficulty, promptId: selectedPrompt.id })
        });
        const data = (await response.json()) as { session?: { id: string }; error?: string };
        if (!response.ok || !data.session) {
          setError(data.error ?? (tr ? "Writing oturumu başlatılamadı." : "Could not start writing session."));
          setLoading(false);
          return;
        }
        activeSessionId = data.session.id;
        setSessionId(activeSessionId);
        setStartedAt(Date.now());
        void trackClientEvent({ userId: currentUser.id, event: "writing_start", path: "/app/writing/task-2" });
      }

      const minutesSpent = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 60000)) : null;
      setStatus(tr ? "Taslak kaydediliyor..." : "Saving draft...");
      const submitResponse = await fetch(`/api/writing/session/${activeSessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftText: essay, minutesSpent })
      });
      const submitData = (await submitResponse.json()) as { error?: string };
      if (!submitResponse.ok) {
        setError(submitData.error ?? (tr ? "Taslak kaydedilemedi." : "Could not save draft."));
        setLoading(false);
        return;
      }
      void trackClientEvent({ userId: currentUser.id, event: "writing_submitted", path: "/app/writing/task-2" as never });

      setStatus(tr ? "Essay değerlendiriliyor..." : "Evaluating your essay...");
      const evaluateResponse = await fetch(`/api/writing/session/${activeSessionId}/evaluate`, { method: "POST" });
      const evaluateData = (await evaluateResponse.json()) as { error?: string };
      if (!evaluateResponse.ok) {
        setError(evaluateData.error ?? (tr ? "Essay değerlendirilemedi." : "Could not evaluate the essay."));
        setLoading(false);
        return;
      }
      void trackClientEvent({ userId: currentUser.id, event: "writing_evaluated", path: "/app/writing/task-2" as never });
      router.push(`/app/writing/results/${activeSessionId}`);
    } catch {
      setError(tr ? "Writing değerlendirmesi başarısız oldu." : "Writing evaluation failed." );
      setLoading(false);
      return;
    }
  };

  return (
    <main className="page-shell section">
      <div style={{ maxWidth: 920, margin: "0 auto", display: "grid", gap: "1.5rem" }}>
        <div className="section-head" style={{ textAlign: "left" }}>
          <span className="eyebrow">{tr ? "Writing coach" : "Writing coach"}</span>
          <h1 style={{ marginBottom: "0.55rem" }}>{tr ? "IELTS Writing Task 2" : "IELTS Writing Task 2"}</h1>
          <p>{tr ? "Essay yaz, band tahmini al, düzeltilmiş versiyonu gör ve aynı task'i tekrar dene." : "Write an essay, get a band estimate, review a corrected version, and retry the same task."}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: "1rem" }}>
          <section className="card" style={{ padding: "1.1rem", display: "grid", gap: "1rem", alignContent: "start" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
              <strong>{tr ? "Task ayarları" : "Task setup"}</strong>
              <Link href="/app/writing" className="button button-secondary" style={{ padding: "0.45rem 0.8rem", fontSize: "0.82rem" }}>
                {tr ? "Hub'a dön" : "Back to hub"}
              </Link>
            </div>

            <label className="practice-field">
              <span className="practice-field-label">{tr ? "Zorluk" : "Difficulty"}</span>
              <select className="practice-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
                <option value="Starter">{tr ? "Başlangıç" : "Starter"}</option>
                <option value="Target">{tr ? "Hedef" : "Target"}</option>
                <option value="Stretch">{tr ? "Zorlayıcı" : "Stretch"}</option>
              </select>
            </label>

            <div style={{ display: "grid", gap: "0.55rem", maxHeight: "50vh", overflowY: "auto" }}>
              {prompts.map((prompt) => {
                const active = (selectedPrompt?.id ?? "") === prompt.id;
                return (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => setSelectedPromptId(prompt.id)}
                    style={{
                      textAlign: "left",
                      padding: "0.9rem 1rem",
                      borderRadius: 12,
                      border: active ? "1.5px solid var(--primary)" : "1px solid var(--border)",
                      background: active ? "color-mix(in oklch, var(--primary) 8%, var(--card) 92%)" : "var(--card)",
                      color: "var(--foreground)",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontWeight: 700, marginBottom: "0.35rem" }}>{prompt.title}</div>
                    <div style={{ fontSize: "0.82rem", color: "var(--muted-foreground)", lineHeight: 1.5 }}>{prompt.prompt.slice(0, 120)}...</div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="card" style={{ padding: "1.1rem", display: "grid", gap: "1rem" }}>
            <div style={{ display: "grid", gap: "0.65rem" }}>
              <span className="eyebrow">{tr ? "Seçili görev" : "Selected task"}</span>
              <h2 style={{ margin: 0, fontSize: "1.25rem" }}>{selectedPrompt?.title}</h2>
              <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.75 }}>{selectedPrompt?.prompt}</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
              <div className="practice-meta">{tr ? `Önerilen süre: ${selectedPrompt?.recommendedMinutes ?? 40} dk` : `Recommended time: ${selectedPrompt?.recommendedMinutes ?? 40} min`}</div>
              <div className="practice-meta">{tr ? `Kelime: ${wordCount}` : `Words: ${wordCount}`}</div>
            </div>

            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder={tr ? "Introduction, body paragraph 1, body paragraph 2 ve conclusion yapısıyla essay'ini yaz..." : "Write your essay with a clear introduction, body paragraphs, and conclusion..."}
              style={{ minHeight: 360, resize: "vertical", borderRadius: 16, border: "1px solid var(--border)", background: "var(--card)", color: "var(--foreground)", padding: "1rem 1.05rem", fontSize: "0.95rem", lineHeight: 1.8, outline: "none" }}
            />

            <div style={{ display: "grid", gap: "0.65rem" }}>
              <div className="card" style={{ padding: "0.85rem 0.95rem", background: "color-mix(in oklch, var(--surface-strong) 35%, var(--card) 65%)" }}>
                <strong style={{ display: "block", marginBottom: "0.35rem" }}>{tr ? "Hızlı kontrol" : "Quick check"}</strong>
                <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.6 }}>
                  {wordCount < 220
                    ? (tr ? "Task 2 için biraz daha uzun yaz. En az 250 kelime hedefle." : "Write a little more for Task 2. Aim for at least 250 words.")
                    : (tr ? "Uzunluk iyi görünüyor. Şimdi örneklerini ve conclusion kısmını net tut." : "Length looks healthy. Now keep your examples and conclusion clear.")}
                </p>
              </div>
              {error ? <div style={{ padding: "0.85rem 0.95rem", borderRadius: 12, background: "oklch(0.55 0.2 20 / 0.08)", color: "oklch(0.45 0.18 20)" }}>{error}</div> : null}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button type="button" className="button button-secondary" onClick={startWritingSession} disabled={!currentUser || loading || !selectedPrompt}>
                  {tr ? "Oturumu hazırla" : "Prepare session"}
                </button>
                <button type="button" className="button button-primary" onClick={() => void evaluateWriting()} disabled={!currentUser || loading || !selectedPrompt || wordCount < 40}>
                  {loading ? (tr ? "Değerlendiriliyor..." : "Evaluating...") : (tr ? "Essay'i değerlendir" : "Evaluate my writing")}
                </button>
              </div>
              <p style={{ margin: 0, color: "var(--muted-foreground)", fontSize: "0.88rem" }}>{status}</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

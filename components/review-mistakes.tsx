"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, BookOpenCheck, RotateCcw, Sparkles } from "lucide-react";
import { useAppState } from "@/components/providers";
import { ProgressSummary } from "@/lib/types";

const emptySummary: ProgressSummary = {
  totalSessions: 0,
  averageScore: 0,
  streakDays: 0,
  freeSessionsRemaining: 4,
  remainingMinutesToday: 8,
  currentPlan: "free",
  recentSessions: []
};

type RetryQueueItem = {
  promptId: string;
  examType: "IELTS" | "TOEFL";
  taskType: string;
  difficulty: string;
  title: string;
  createdAt: string;
};

type HistoryFilter = "all" | "IELTS" | "TOEFL";

export function ReviewMistakes() {
  const { currentUser, language, signedIn } = useAppState();
  const tr = language === "tr";
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [retryQueue, setRetryQueue] = useState<RetryQueueItem[]>([]);
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!signedIn || !currentUser || currentUser.role === "guest") {
      setLoading(false);
      return;
    }
    let active = true;
    fetch("/api/progress/summary")
      .then((response) => response.json())
      .then((data: ProgressSummary) => {
        if (active) setSummary(data);
      })
      .catch(() => {
        if (active) setSummary(emptySummary);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [currentUser, signedIn]);

  useEffect(() => {
    const raw = window.localStorage.getItem("speakace-retry-queue");
    if (!raw) return;
    try {
      setRetryQueue(JSON.parse(raw) as RetryQueueItem[]);
    } catch {
      setRetryQueue([]);
    }
  }, []);

  const notebook = useMemo(() => {
    const scoredSessions = summary.recentSessions.filter((session) => session.report);
    const improvementCounts = new Map<string, number>();
    const fillerCounts = new Map<string, number>();
    const weakCounts = new Map<string, number>();

    scoredSessions.forEach((session) => {
      session.report?.improvements.forEach((item) => {
        improvementCounts.set(item, (improvementCounts.get(item) ?? 0) + 1);
      });
      session.report?.fillerWords.forEach((item) => {
        if (!item.trim()) return;
        fillerCounts.set(item, (fillerCounts.get(item) ?? 0) + 1);
      });
      const weakest = session.report?.categories.slice().sort((a, b) => a.score - b.score)[0];
      if (weakest) weakCounts.set(weakest.label, (weakCounts.get(weakest.label) ?? 0) + 1);
    });

    return {
      improvements: [...improvementCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
      fillers: [...fillerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5),
      weakAreas: [...weakCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    };
  }, [summary.recentSessions]);

  const filteredSessions = useMemo(
    () => summary.recentSessions.filter((session) => historyFilter === "all" || session.examType === historyFilter),
    [historyFilter, summary.recentSessions]
  );

  if (loading) {
    return (
      <main className="page-shell section inside-page">
        <div className="inside-loading">{tr ? "Sonuç geçmişin hazırlanıyor…" : "Preparing your result history…"}</div>
      </main>
    );
  }

  return (
    <main className="page-shell section inside-page">
      <header className="inside-header">
        <div className="inside-header-main">
          <span className="inside-kicker">{tr ? "Sonuç kütüphanesi" : "Results library"}</span>
          <h1 className="inside-title">{tr ? "Her deneme, bir sonraki hareketi göstermeli." : "Every attempt should reveal the next move."}</h1>
          <p className="inside-lede">
            {tr
              ? "Tüm speaking sonuçların, tekrar eden zayıflıkların ve yeniden cevaplamak için kaydettiğin sorular burada."
              : "All speaking results, repeated patterns, and prompts you saved for another attempt live here."}
          </p>
        </div>
        <div className="inside-actions">
          <Link href="/app/plan" className="button button-secondary">
            <Sparkles size={16} />
            {tr ? "Planı aç" : "Open plan"}
          </Link>
          <Link href="/app/practice" className="button button-primary">
            {tr ? "Yeni deneme" : "New attempt"}
          </Link>
        </div>
      </header>

      <section className="inside-metric-strip" style={{ "--metric-count": 4 } as React.CSSProperties}>
        <ReviewMetric label={tr ? "Toplam deneme" : "Total attempts"} value={`${summary.totalSessions}`} note={tr ? "Kayıtlı speaking oturumu" : "Recorded speaking sessions"} />
        <ReviewMetric label={tr ? "Ortalama skor" : "Average score"} value={summary.averageScore ? summary.averageScore.toFixed(1) : "—"} note={tr ? "Skorlu sonuçlar" : "Across scored results"} />
        <ReviewMetric label={tr ? "Pratik serisi" : "Practice streak"} value={`${summary.streakDays}`} note={tr ? "Gün" : "Days"} />
        <ReviewMetric label={tr ? "Retry kuyruğu" : "Retry queue"} value={`${retryQueue.length}`} note={tr ? "Kaydedilen soru" : "Saved prompts"} />
      </section>

      <div className="inside-layout">
        <section className="inside-section">
          <div className="inside-section-head">
            <div>
              <span className="inside-kicker">{tr ? "Tüm denemeler" : "All attempts"}</span>
              <h2>{tr ? "Sonuç geçmişi" : "Result history"}</h2>
              <p className="inside-section-copy">
                {tr ? `${filteredSessions.length} sonuç gösteriliyor.` : `Showing ${filteredSessions.length} results.`}
              </p>
            </div>
            <div className="inside-filter" aria-label={tr ? "Sınav filtresi" : "Exam filter"}>
              {[
                { key: "all" as const, label: tr ? "Tümü" : "All" },
                { key: "IELTS" as const, label: "IELTS" },
                { key: "TOEFL" as const, label: "TOEFL" }
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={historyFilter === option.key ? "is-active" : ""}
                  aria-pressed={historyFilter === option.key}
                  onClick={() => setHistoryFilter(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {filteredSessions.length ? (
            <div className="inside-row-list">
              {filteredSessions.map((session) => {
                const weakest = session.report?.categories.slice().sort((a, b) => a.score - b.score)[0];
                return (
                  <Link key={session.id} href={`/app/results/${session.id}`} className="inside-row">
                    <div className="inside-row-main">
                      <strong className="inside-row-title">{session.prompt.title}</strong>
                      <div className="inside-row-meta">
                        <span>{new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span>{session.examType} · {humanizeTask(session.taskType, tr)}</span>
                        {weakest ? <span>{tr ? "Odak" : "Focus"}: {tr ? translateCategoryLabel(weakest.label) : weakest.label}</span> : null}
                      </div>
                    </div>
                    <div className="inside-row-side">
                      <strong className="inside-row-score">{session.report?.overall ?? "—"}</strong>
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="inside-empty">
              <BookOpenCheck size={22} aria-hidden="true" />
              <strong>{tr ? "Bu filtrede henüz sonuç yok." : "No results in this filter yet."}</strong>
              <span>{tr ? "İlk denemeni tamamladığında skor ve rapor burada görünür." : "Your score and report will appear here after your first attempt."}</span>
              <Link href="/app/practice" className="button button-primary">{tr ? "İlk denemeyi başlat" : "Start first attempt"}</Link>
            </div>
          )}
        </section>

        <aside className="inside-rail">
          <section className="inside-section is-accent">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Performans örüntüleri" : "Performance patterns"}</span>
                <h3>{tr ? "Tekrar eden sinyaller" : "Repeated signals"}</h3>
              </div>
            </div>
            <PatternGroup
              title={tr ? "Zayıf alanlar" : "Weak areas"}
              items={notebook.weakAreas.map(([text, count]) => ({ text: tr ? translateCategoryLabel(text) : text, count }))}
              empty={tr ? "Birkaç skorlu denemeden sonra görünür." : "Appears after a few scored attempts."}
              tr={tr}
            />
            <PatternGroup
              title={tr ? "Düzeltme notları" : "Improvement notes"}
              items={notebook.improvements.map(([text, count]) => ({ text, count }))}
              empty={tr ? "Tekrarlayan bir not henüz yok." : "No repeated note yet."}
              tr={tr}
            />
            <PatternGroup
              title={tr ? "Filler kelimeler" : "Filler words"}
              items={notebook.fillers.map(([text, count]) => ({ text, count }))}
              empty={tr ? "Tekrarlayan filler kelime görünmüyor." : "No repeated filler words detected."}
              tr={tr}
            />
          </section>
        </aside>
      </div>

      <section className="inside-section">
        <div className="inside-section-head">
          <div>
            <span className="inside-kicker">{tr ? "Retry kuyruğu" : "Retry queue"}</span>
            <h2>{tr ? "İkinci cevap için kaydettiğin sorular" : "Prompts saved for a second answer"}</h2>
            <p className="inside-section-copy">
              {tr ? "Aynı soruyu yeni geri bildirimle tekrar cevaplamak, yeni soruya geçmekten daha öğreticidir." : "Answering the same prompt with one correction is often more useful than switching topics."}
            </p>
          </div>
          <RotateCcw size={20} aria-hidden="true" />
        </div>
        {retryQueue.length ? (
          <div className="inside-row-list">
            {retryQueue.map((item) => (
              <Link
                key={`${item.promptId}-${item.createdAt}`}
                href={{ pathname: "/app/practice", query: { promptId: item.promptId, examType: item.examType, taskType: item.taskType, difficulty: item.difficulty } }}
                className="inside-row"
              >
                <div className="inside-row-main">
                  <strong className="inside-row-title">{item.title}</strong>
                  <div className="inside-row-meta">
                    <span>{item.examType} · {humanizeTask(item.taskType, tr)}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</span>
                  </div>
                </div>
                <span className="inside-row-action">{tr ? "Tekrar aç" : "Open retry"}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="inside-empty">
            <strong>{tr ? "Retry kuyruğun boş." : "Your retry queue is empty."}</strong>
            <span>{tr ? "Bir sonuç ekranında zorlandığın soruyu kaydettiğinde burada görünür." : "Save a difficult prompt from any result screen and it will appear here."}</span>
          </div>
        )}
      </section>
    </main>
  );
}

function PatternGroup({
  title,
  items,
  empty,
  tr
}: {
  title: string;
  items: Array<{ text: string; count: number }>;
  empty: string;
  tr: boolean;
}) {
  return (
    <div style={{ paddingTop: "0.8rem" }}>
      <strong style={{ fontSize: "0.82rem" }}>{title}</strong>
      {items.length ? (
        <div className="inside-row-list" style={{ marginTop: "0.35rem" }}>
          {items.slice(0, 3).map((item) => (
            <div key={`${item.text}-${item.count}`} className="inside-row">
              <span className="inside-row-title" style={{ whiteSpace: "normal" }}>{item.text}</span>
              <span className="inside-status">{tr ? `${item.count} kez` : `${item.count}x`}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="inside-section-copy">{empty}</p>
      )}
    </div>
  );
}

function ReviewMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="inside-metric">
      <span className="inside-metric-label">{label}</span>
      <strong className="inside-metric-value">{value}</strong>
      <span className="inside-metric-note">{note}</span>
    </div>
  );
}

function translateCategoryLabel(label: string) {
  const labels: Record<string, string> = {
    "Fluency and Coherence": "Akıcılık ve tutarlılık",
    "Lexical Resource": "Kelime kullanımı",
    "Grammatical Range and Accuracy": "Dilbilgisi ve doğruluk",
    Pronunciation: "Telaffuz",
    Delivery: "Aktarım",
    "Language Use": "Dil kullanımı",
    "Topic Development": "İçerik gelişimi"
  };
  return labels[label] ?? label;
}

function humanizeTask(taskType: string, tr: boolean) {
  const labels: Record<string, string> = {
    "ielts-part-1": "IELTS Part 1",
    "ielts-part-2": "IELTS Part 2",
    "ielts-part-3": "IELTS Part 3",
    "toefl-task-1": tr ? "TOEFL Görev 1" : "TOEFL Task 1",
    "toefl-task-2": tr ? "TOEFL Görev 2" : "TOEFL Task 2",
    "toefl-task-3": tr ? "TOEFL Görev 3" : "TOEFL Task 3",
    "toefl-task-4": tr ? "TOEFL Görev 4" : "TOEFL Task 4"
  };
  return labels[taskType] ?? taskType;
}

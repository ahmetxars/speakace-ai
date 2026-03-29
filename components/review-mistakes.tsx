"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

export function ReviewMistakes() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [retryQueue, setRetryQueue] = useState<RetryQueueItem[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`/api/progress/summary?userId=${encodeURIComponent(currentUser.id)}`)
      .then((response) => response.json())
      .then((data: ProgressSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem("speakace-retry-queue");
    if (!raw) {
      setRetryQueue([]);
      return;
    }
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
      if (weakest) {
        weakCounts.set(weakest.label, (weakCounts.get(weakest.label) ?? 0) + 1);
      }
    });

    return {
      improvements: [...improvementCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
      fillers: [...fillerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
      weakAreas: [...weakCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
    };
  }, [summary.recentSessions]);

  return (
    <div className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "0.9rem" }}>
        <span className="eyebrow">{tr ? "Review mistakes" : "Review mistakes"}</span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", margin: 0 }}>{tr ? "Hata inceleme panosu" : "Mistake review board"}</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.75, margin: 0 }}>
          {tr
            ? "Burada tekrar eden zayif alanlarini, en cok geri donen duzeltmeleri, filler kelimelerini ve kaydettigin retry sorularini tek yerde gorebilirsin."
            : "Here you can review repeated weak areas, your most common improvement notes, filler words, and the prompts you saved for retry in one place."}
        </p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        <NotebookCard
          title={tr ? "Tekrar eden zayif skill'ler" : "Repeated weak skills"}
          items={notebook.weakAreas.map(([text, count]) => ({ text: tr ? translateCategoryLabel(text) : text, count }))}
          emptyLabel={tr ? "Yeterli veri birikince en zorlandigin skill'ler burada toplanacak." : "Your most repeated weak skills will appear here once more data comes in."}
          tr={tr}
        />
        <NotebookCard
          title={tr ? "Surekli gelen duzeltmeler" : "Repeated improvement notes"}
          items={notebook.improvements.map(([text, count]) => ({ text, count }))}
          emptyLabel={tr ? "Henuz yeterli duzeltme notu yok." : "There are not enough repeated improvement notes yet."}
          tr={tr}
        />
        <NotebookCard
          title={tr ? "Sik filler kelimeler" : "Frequent filler words"}
          items={notebook.fillers.map(([text, count]) => ({ text, count }))}
          emptyLabel={tr ? "Tekrarlayan filler kelime henuz gorunmuyor." : "No repeated filler words yet."}
          tr={tr}
        />
      </section>

      <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <span className="eyebrow">{tr ? "Retry queue" : "Retry queue"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Kaydedilen zor sorular" : "Saved difficult prompts"}</h2>
          </div>
          <span className="pill">{retryQueue.length}</span>
        </div>
        {retryQueue.length ? (
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.85rem" }}>
            {retryQueue.map((item) => (
              <Link
                key={`${item.promptId}-${item.createdAt}`}
                href={{ pathname: "/app/practice", query: { promptId: item.promptId, examType: item.examType, taskType: item.taskType, difficulty: item.difficulty } }}
                className="card"
                style={{ padding: "1rem", display: "grid", gap: "0.55rem", background: "var(--surface-strong)" }}
              >
                <strong>{item.title}</strong>
                <span className="practice-meta">{item.examType} · {humanizeTask(item.taskType, tr)}</span>
                <span style={{ color: "var(--accent-deep)", fontWeight: 700 }}>{tr ? "Tekrar ac" : "Open retry"}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            {tr ? "Sonuc ekranindan bir soruyu retry listesine kaydettiginde burada gorunecek." : "Prompts saved from the result screen will appear here."}
          </p>
        )}
      </section>
    </div>
  );
}

function NotebookCard({
  title,
  items,
  emptyLabel,
  tr
}: {
  title: string;
  items: Array<{ text: string; count: number }>;
  emptyLabel: string;
  tr: boolean;
}) {
  return (
    <div className="card" style={{ padding: "1.1rem", display: "grid", gap: "0.85rem" }}>
      <strong>{title}</strong>
      {items.length ? (
        <div style={{ display: "grid", gap: "0.65rem" }}>
          {items.map((item) => (
            <div key={`${item.text}-${item.count}`} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)", display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "flex-start" }}>
              <span style={{ lineHeight: 1.65 }}>{item.text}</span>
              <span className="pill">{tr ? `${item.count} kez` : `${item.count}x`}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>{emptyLabel}</p>
      )}
    </div>
  );
}

function translateCategoryLabel(label: string) {
  const labels: Record<string, string> = {
    "Fluency and Coherence": "Akicilik ve Tutarlilik",
    "Lexical Resource": "Kelime Kullanimi",
    "Grammatical Range and Accuracy": "Dilbilgisi ve Dogruluk",
    Pronunciation: "Telaffuz",
    Delivery: "Delivery",
    "Language Use": "Dil kullanimi",
    "Topic Development": "Icerik gelisimi"
  };
  return labels[label] ?? label;
}

function humanizeTask(taskType: string, tr: boolean) {
  const labels: Record<string, string> = {
    "ielts-part-1": "IELTS Part 1",
    "ielts-part-2": "IELTS Part 2",
    "ielts-part-3": "IELTS Part 3",
    "toefl-task-1": tr ? "TOEFL Gorev 1" : "TOEFL Task 1",
    "toefl-task-2": tr ? "TOEFL Gorev 2" : "TOEFL Task 2",
    "toefl-task-3": tr ? "TOEFL Gorev 3" : "TOEFL Task 3",
    "toefl-task-4": tr ? "TOEFL Gorev 4" : "TOEFL Task 4"
  };
  return labels[taskType] ?? taskType;
}

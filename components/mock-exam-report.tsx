"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import { ExamType, TaskType } from "@/lib/types";

type StoredMockExamSummary = {
  examType: ExamType;
  average: string;
  completedCount: number;
  totalCount: number;
  readinessLabel: string;
  headline: string;
  body: string;
  gapLabel: string;
  nextStep: string;
  targetScore: string;
  generatedAt: string;
  tasks: Array<{ sessionId: string; taskType: TaskType; title: string; score?: number }>;
};

export function MockExamReport() {
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const storageKey = currentUser ? `speakace-mock-report-${currentUser.id}` : "speakace-mock-report-guest";
  const [report, setReport] = useState<StoredMockExamSummary | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      setReport(JSON.parse(raw) as StoredMockExamSummary);
    } catch {
      setReport(null);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!currentUser?.id || !report) return;
    void trackClientEvent({ userId: currentUser.id, event: "mock_report_view", path: "/app/mock-results" });
  }, [currentUser?.id, report]);

  const scoreMax = report?.examType === "IELTS" ? 9 : 30;
  const generatedLabel = useMemo(() => {
    if (!report?.generatedAt) return tr ? "Bilinmiyor" : "Unknown";
    return new Date(report.generatedAt).toLocaleString(language === "tr" ? "tr-TR" : "en-US");
  }, [language, report?.generatedAt, tr]);
  const readinessBand = useMemo(() => (report ? buildReadinessBand(report.examType, Number(report.average || 0), tr) : null), [report, tr]);
  const weeklyPlan = useMemo(() => (report ? buildWeeklyPlan(report.examType, Number(report.average || 0), tr) : []), [report, tr]);

  if (!report) {
    return (
      <div className="page-shell section">
        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">{tr ? "Mock exam report" : "Mock exam report"}</span>
          <h1 style={{ margin: 0 }}>{tr ? "Kayitli mock raporu bulunamadi" : "No saved mock report found"}</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.75 }}>
            {tr
              ? "Bu sayfa son tamamlanan simülasyon raporunu gösterir. Önce bir IELTS veya TOEFL simülasyonu bitirmen gerekiyor."
              : "This page shows your latest completed simulation report. Finish an IELTS or TOEFL simulation first."}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link href="/app/practice" className="button button-primary">{tr ? "Practice'e don" : "Back to practice"}</Link>
            <Link href="/app" className="button button-secondary">{tr ? "Dashboard" : "Dashboard"}</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-shell section">
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", alignItems: "start" }}>
        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Mock exam report" : "Mock exam report"}</span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", margin: "0.7rem 0 0.4rem" }}>
              {report.examType} {tr ? "tam simulasyon sonucu" : "full simulation result"}
            </h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.75, margin: 0 }}>{report.headline}</p>
          </div>

          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            <StatCard title={tr ? "Ortalama" : "Average"} value={report.average} note={report.examType === "IELTS" ? (tr ? "Tahmini band" : "Estimated band") : (tr ? "Tahmini speaking skoru" : "Estimated speaking score")} />
            <StatCard title={tr ? "Hazirlik seviyesi" : "Readiness"} value={report.readinessLabel} note={report.gapLabel} />
            <StatCard title={tr ? "Tamamlanan gorev" : "Completed tasks"} value={`${report.completedCount}/${report.totalCount}`} note={generatedLabel} />
          </div>

          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>{tr ? "Genel yorum" : "Overall summary"}</strong>
            <p style={{ margin: "0.7rem 0 0", lineHeight: 1.8 }}>{report.body}</p>
          </div>

          {readinessBand ? (
            <div className="card" style={{ padding: "1rem", background: "rgba(47, 125, 75, 0.08)" }}>
              <strong>{tr ? "Overall readiness band" : "Overall readiness band"}</strong>
              <div style={{ fontSize: "1.45rem", fontWeight: 800, marginTop: "0.6rem" }}>{readinessBand.label}</div>
              <p style={{ margin: "0.6rem 0 0", lineHeight: 1.75 }}>{readinessBand.description}</p>
            </div>
          ) : null}

          <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.06)" }}>
            <strong>{tr ? "Bir sonraki net odak" : "One clear next focus"}</strong>
            <p style={{ margin: "0.7rem 0 0", lineHeight: 1.8 }}>{report.nextStep}</p>
          </div>

          <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.6)" }}>
            <strong>{tr ? "1 haftalik calisma plani" : "1-week study plan"}</strong>
            <ul style={{ margin: "0.75rem 0 0", paddingLeft: "1.15rem" }}>
              {weeklyPlan.map((item) => (
                <li key={item} style={{ marginTop: "0.5rem", lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
          <span className="eyebrow">{tr ? "Gorev dagilimi" : "Task breakdown"}</span>
          <div className="grid" style={{ gap: "0.8rem" }}>
            {report.tasks.map((task, index) => (
              <div key={task.sessionId} className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <strong>{index + 1}. {humanizeTaskType(task.taskType, tr)}</strong>
                    <div className="practice-meta" style={{ marginTop: "0.35rem" }}>{task.title}</div>
                  </div>
                  <strong style={{ fontSize: "1.3rem" }}>{task.score?.toFixed(1) ?? "-"}</strong>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: "rgba(29, 111, 117, 0.12)", overflow: "hidden", marginTop: "0.9rem" }}>
                  <div style={{ width: `${Math.max((((task.score ?? 0) / scoreMax) * 100), 8)}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-cool))" }} />
                </div>
                <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap", marginTop: "0.9rem" }}>
                  <Link href={`/app/results/${task.sessionId}`} className="button button-secondary">{tr ? "Task sonucunu ac" : "Open task result"}</Link>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link href="/app/practice" className="button button-primary">{tr ? "Yeni simulasyon baslat" : "Start a new simulation"}</Link>
            <Link href="/app" className="button button-secondary">{tr ? "Dashboard'a don" : "Back to dashboard"}</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.35rem" }}>{title}</div>
      <div style={{ fontSize: "1.8rem", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--muted)", marginTop: "0.35rem", lineHeight: 1.5 }}>{note}</div>
    </div>
  );
}

function humanizeTaskType(taskType: TaskType, tr: boolean) {
  const labels: Record<TaskType, { en: string; tr: string }> = {
    "ielts-part-1": { en: "IELTS Part 1", tr: "IELTS Part 1" },
    "ielts-part-2": { en: "IELTS Part 2", tr: "IELTS Part 2" },
    "ielts-part-3": { en: "IELTS Part 3", tr: "IELTS Part 3" },
    "toefl-task-1": { en: "TOEFL Task 1", tr: "TOEFL Gorev 1" },
    "toefl-task-2": { en: "TOEFL Task 2", tr: "TOEFL Gorev 2" },
    "toefl-task-3": { en: "TOEFL Task 3", tr: "TOEFL Gorev 3" },
    "toefl-task-4": { en: "TOEFL Task 4", tr: "TOEFL Gorev 4" },
    "toefl-independent": { en: "TOEFL Independent", tr: "TOEFL Independent" },
    "toefl-integrated": { en: "TOEFL Integrated", tr: "TOEFL Integrated" }
  };
  return tr ? labels[taskType].tr : labels[taskType].en;
}

function buildReadinessBand(examType: ExamType, average: number, tr: boolean) {
  if (examType === "IELTS") {
    if (average >= 7) {
      return {
        label: tr ? "Band A · Sinava yakin" : "Band A · Near exam-ready",
        description: tr
          ? "Bu ortalama ile sınav seviyesine yakın bir speaking tabanın var. Artık ana iş istikrar, daha rafine örnekler ve küçük akış hatalarını temizlemek."
          : "At this average, you have a base that is close to exam-ready. The main job now is consistency, stronger examples, and cleaning up small flow issues."
      };
    }
    if (average >= 6) {
      return {
        label: tr ? "Band B · Guclu gelisim" : "Band B · Strong progress",
        description: tr
          ? "Temel yapı oturuyor ama skor hâlâ cevap kalitesine göre dalgalanıyor. Doğrudan cevap, neden ve örnek zincirini daha düzenli kurman gerekiyor."
          : "The basic structure is forming, but the score still moves too much with answer quality. You need a more reliable direct answer, reason, and example chain."
      };
    }
    return {
      label: tr ? "Band C · Temel insa" : "Band C · Foundation stage",
      description: tr
        ? "Bu aşamada ilk hedef daha uzun konuşmak değil, net ve tamamlanmış cevaplar vermek. Her cevapta ana fikir, neden ve basit bir örnek yeterli olur."
        : "At this stage, the first goal is not speaking longer but giving clearer, more complete answers. A main idea, one reason, and one simple example are enough."
    };
  }

  if (average >= 24) {
    return {
      label: tr ? "Band A · Sinava yakin" : "Band A · Near exam-ready",
      description: tr
        ? "Integrated task'lerde ana içeriği taşıyabiliyor ve yapıyı koruyorsun. Bundan sonra farkı ayrıntı seçimi ve delivery kalitesi yaratır."
        : "You are carrying the main content and holding the structure well in integrated tasks. From here, detail selection and delivery quality create the difference."
    };
  }
  if (average >= 20) {
    return {
      label: tr ? "Band B · Guclu gelisim" : "Band B · Strong progress",
      description: tr
        ? "Temel TOEFL speaking mantığı oluşmuş durumda. Şimdi source aktarımını daha temiz yapmak ve gereksiz tekrarları azaltmak gerekiyor."
        : "The basic TOEFL speaking structure is already there. Now you need cleaner source transfer and fewer repeated phrases."
    };
  }
  return {
    label: tr ? "Band C · Temel insa" : "Band C · Foundation stage",
    description: tr
      ? "İlk hedefin daha karmaşık görünmek değil, task'i düzgün tamamlamak. Opinion task'te net görüş, integrated task'te temiz özet ilk öncelik olmalı."
      : "The first goal is not sounding complex but completing the task correctly. A clear opinion in independent tasks and a clean summary in integrated tasks should come first."
  };
}

function buildWeeklyPlan(examType: ExamType, average: number, tr: boolean) {
  if (examType === "IELTS") {
    if (average >= 7) {
      return tr
        ? [
            "Haftada 2 kez tam IELTS simulasyonu çöz ve band dalgalanmasını izle.",
            "Part 2 cevaplarında daha güçlü örnek ve daha doğal kapanış cümlesi kur.",
            "Part 3'te opinion + reason + example zincirini daha analitik hale getir."
          ]
        : [
            "Run 2 full IELTS simulations this week and watch score stability.",
            "Use stronger examples and more natural closing lines in Part 2.",
            "Make your Part 3 opinion + reason + example chain sound more analytical."
          ];
    }
    if (average >= 6) {
      return tr
        ? [
            "Haftada 3 kez kısa drill yap: Part 1, Part 2 ve Part 3'ü ayrı ayrı tekrar et.",
            "Her cevapta direkt cevap + neden + örnek iskeletini koru.",
            "Improved answer ile kendi transcript'ini karşılaştırıp bir cümleyi yeniden söyle."
          ]
        : [
            "Do 3 short drills this week: repeat Part 1, Part 2, and Part 3 separately.",
            "Keep a direct answer + reason + example structure in every response.",
            "Compare your transcript with the improved answer and re-say one upgraded sentence."
          ];
    }
    return tr
      ? [
          "İlk hafta hedefin 4 kısa speaking denemesi ve temiz, tamamlanmış cevap üretmek olsun.",
          "Part 1'de kısa ve net cevap, Part 2'de basit hikaye akışı, Part 3'te tek fikir üstünde kal.",
          "Uzun konuşmaya çalışma; anlaşılır yapı daha önemli."
        ]
      : [
          "In the first week, aim for 4 short speaking attempts and focus on complete answers.",
          "Use short direct answers in Part 1, a simple story flow in Part 2, and one clear idea in Part 3.",
          "Do not chase long answers yet; a clear structure matters more."
        ];
  }

  if (average >= 24) {
    return tr
      ? [
          "Haftada 2 tam TOEFL simulasyonu çöz ve integrated task'lerde aynı kaliteyi korumaya çalış.",
          "Task 2-3-4'te source aktarımını daha sıkı özetle; gereksiz yan detayları azalt.",
          "Delivery için haftada 2 kısa tekrar kaydı yap ve ritim/tempo dinle."
        ]
      : [
          "Run 2 full TOEFL simulations this week and aim for steady integrated-task quality.",
          "Summarize source material more tightly in Tasks 2-3-4 and cut extra side details.",
          "Do 2 short repeat recordings for delivery and listen back to your pacing."
        ];
  }
  if (average >= 20) {
    return tr
      ? [
          "Haftada 3 kez Task 2-3-4 ağırlıklı practice yap; source notlarını daha düzenli tut.",
          "Task 1'de ilk cümlede görüşünü net söyle ve tek güçlü örneğe sadık kal.",
          "Her practice sonunda improved answer ile kendi cevabını karşılaştır."
        ]
      : [
          "Practice Tasks 2-3-4 three times this week and organize source notes more clearly.",
          "State your opinion in the first sentence of Task 1 and stay with one strong example.",
          "Compare your own answer with the improved answer after each practice."
        ];
  }
  return tr
    ? [
        "İlk hafta hedefin task formatlarını doğru tamamlamak olsun; özellikle independent ve integrated farkını net öğren.",
        "Opinion task'te net görüş, integrated task'te temiz özet kullan.",
        "Kısa ama düzgün yapı, uzun ama dağınık cevaptan daha değerlidir."
      ]
    : [
        "In the first week, focus on completing each task format correctly, especially the difference between independent and integrated tasks.",
        "Use a clear opinion in independent tasks and a clean summary in integrated tasks.",
        "A short but organized answer is better than a long but scattered one."
      ];
}

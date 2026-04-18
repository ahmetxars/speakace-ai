import type { Route } from "next";
import { ProgressSummary, StudentProfile, TaskType } from "@/lib/types";

export type PlacementAnswerSet = {
  confidence: "low" | "medium" | "high";
  fluency: "hesitant" | "developing" | "steady";
  grammar: "basic" | "mixed" | "strong";
  vocabulary: "basic" | "functional" | "flexible";
  examDateUrgency: "soon" | "planned" | "open";
};

export type PlacementResult = {
  level: string;
  focusSkill: string;
  targetScoreSuggestion: number;
  weeklyGoal: number;
  dailyMinutesGoal: number;
  studyDays: string[];
  summary: string;
};

export type StudyPlanStep = {
  day: string;
  title: string;
  body: string;
  href: Route;
};

export type BandProgressSnapshot = {
  currentEstimate: number;
  targetScore: number | null;
  gap: number | null;
  bestScore: number | null;
  weakestSkill: string;
  recentMomentum: string;
};

export type RetrySuggestion = {
  sessionId: string;
  title: string;
  taskType: TaskType;
  reason: string;
  href: Route;
};

export type ReactivationSignal = {
  title: string;
  body: string;
  level: "good" | "watch" | "urgent";
  href: Route;
};

export type ProofStory = {
  name: string;
  role: string;
  before: string;
  after: string;
  note: string;
};

export function buildPlacementResult(input: PlacementAnswerSet): PlacementResult {
  let score = 0;
  score += input.confidence === "high" ? 2 : input.confidence === "medium" ? 1 : 0;
  score += input.fluency === "steady" ? 2 : input.fluency === "developing" ? 1 : 0;
  score += input.grammar === "strong" ? 2 : input.grammar === "mixed" ? 1 : 0;
  score += input.vocabulary === "flexible" ? 2 : input.vocabulary === "functional" ? 1 : 0;

  if (score >= 7) {
    return {
      level: "Band 6.5 track",
      focusSkill: "Answer expansion and score stability",
      targetScoreSuggestion: 7,
      weeklyGoal: input.examDateUrgency === "soon" ? 6 : 5,
      dailyMinutesGoal: 25,
      studyDays: ["Mon", "Tue", "Thu", "Sat"],
      summary: "You already have a workable speaking base. The fastest win now is more stable structure and stronger examples under time pressure."
    };
  }

  if (score >= 4) {
    return {
      level: "Band 5.5 to 6.0 build",
      focusSkill: "Direct answers, one reason, one example",
      targetScoreSuggestion: 6.5,
      weeklyGoal: input.examDateUrgency === "soon" ? 5 : 4,
      dailyMinutesGoal: 18,
      studyDays: ["Mon", "Wed", "Fri", "Sun"],
      summary: "You are past the beginner stage, but your score will move faster if every answer follows a clean idea -> reason -> example chain."
    };
  }

  return {
    level: "Foundation speaking track",
    focusSkill: "Clear complete answers before complexity",
    targetScoreSuggestion: 6,
    weeklyGoal: input.examDateUrgency === "soon" ? 4 : 3,
    dailyMinutesGoal: 12,
    studyDays: ["Tue", "Thu", "Sat"],
    summary: "The first priority is not long answers. It is building clean, complete responses that sound controlled and easy to follow."
  };
}

export function buildStudyPlan(profile: StudentProfile | null, summary: ProgressSummary, tr: boolean): StudyPlanStep[] {
  const examType = profile?.preferredExamType ?? "IELTS";
  const target = profile?.targetScore;
  const weakest = findWeakestSkill(summary) ?? (tr ? "Temel yapı" : "Core structure");
  const retryHref = summary.recentSessions.find((item) => item.report)
    ? (`/app/results/${summary.recentSessions.find((item) => item.report)?.id}` as Route)
    : "/app/review";

  return [
    {
      day: tr ? "Bugün" : "Today",
      title: tr ? "Yerleştirme ve hedefi netleştir" : "Lock your level and target",
      body: tr
        ? `Mevcut seviye: ${profile?.currentLevel ?? "Building basics"}. Hedefine giden planı netleştirmek için placement ve profil alanını güncelle.`
        : `Current level: ${profile?.currentLevel ?? "Building basics"}. Update placement and profile so the daily plan matches your real level.`,
      href: "/app/placement"
    },
    {
      day: tr ? "Blok 1" : "Block 1",
      title: tr ? "Kısa speaking drill" : "Short speaking drill",
      body: tr
        ? `${examType} için 1 net speaking denemesi aç. Bugünkü ana odak: ${profile?.focusSkill ?? weakest}.`
        : `Open 1 clear ${examType} speaking attempt. Main focus for today: ${profile?.focusSkill ?? weakest}.`,
      href: "/app/practice?quickStart=1"
    },
    {
      day: tr ? "Blok 2" : "Block 2",
      title: tr ? "Hataları ve retry fırsatını kapat" : "Close the mistake and retry loop",
      body: tr
        ? `${weakest} şu an en zayıf alan. Son raporunu aç, improved answer'ı incele ve aynı soruya bir retry yap.`
        : `${weakest} is your weakest area right now. Open the last report, study the improved answer, and retry the same prompt once.`,
      href: retryHref
    },
    {
      day: tr ? "Bu hafta" : "This week",
      title: tr ? "Tam mock exam simülasyonu çöz" : "Run one full mock exam",
      body: tr
        ? `${target ? `Hedef skor ${target}. ` : ""}Haftada en az 1 kez tam simülasyon çözmek gerçek sınav ritmini kurar.`
        : `${target ? `Target score ${target}. ` : ""}One full simulation per week creates a more exam-like rhythm and better decision data.`,
      href: "/app/mock-exam"
    }
  ];
}

export function buildBandProgress(profile: StudentProfile | null, summary: ProgressSummary, tr: boolean): BandProgressSnapshot {
  const targetScore = profile?.targetScore ?? null;
  const bestScore = summary.recentSessions
    .filter((item) => item.report)
    .reduce<number | null>((best, item) => {
      const current = item.report?.overall ?? 0;
      return best === null || current > best ? current : best;
    }, null);
  const currentEstimate = summary.averageScore || 0;
  const weakestSkill = findWeakestSkill(summary) ?? (tr ? "Dengeli profil" : "Balanced profile");
  const gap = targetScore ? Number((targetScore - currentEstimate).toFixed(1)) : null;
  const recent = summary.recentSessions.filter((item) => item.report).slice(0, 4);
  const momentum = recent.length >= 2
    ? (recent[0].report?.overall ?? 0) >= (recent.at(-1)?.report?.overall ?? 0)
      ? tr ? "Son denemelerde yukarı yönlü sinyal var." : "Recent attempts show an upward signal."
      : tr ? "Skor dalgalanıyor; istikrar kazanmak önemli." : "Scores are moving unevenly; consistency matters now."
    : tr ? "Daha net momentum için birkaç deneme daha gerekiyor." : "You need a few more attempts before momentum becomes clear.";

  return {
    currentEstimate,
    targetScore,
    gap,
    bestScore,
    weakestSkill,
    recentMomentum: momentum
  };
}

export function buildRetrySuggestions(summary: ProgressSummary, tr: boolean): RetrySuggestion[] {
  return summary.recentSessions
    .filter((item) => item.report)
    .slice(0, 3)
    .map((item) => ({
      sessionId: item.id,
      title: item.prompt.title,
      taskType: item.taskType,
      reason: tr
        ? item.report?.improvements[0] ?? "Bu soruda bir retry fırsatı var."
        : item.report?.improvements[0] ?? "This prompt still has a good retry opportunity.",
      href: `/app/practice?promptId=${item.prompt.id}&examType=${item.examType}&taskType=${item.taskType}&difficulty=${item.difficulty}` as Route
    }));
}

export function buildReactivationSignals(profile: StudentProfile | null, summary: ProgressSummary, tr: boolean): ReactivationSignal[] {
  const signals: ReactivationSignal[] = [];
  if (summary.totalSessions < 3) {
    signals.push({
      title: tr ? "İlk hafta geri dönüşü kritik" : "First-week comeback matters most",
      body: tr ? "Hoş geldin ve hatırlatma mailleri aktif. İlk 3 denemeyi tamamlamak için notifications sayfasını açık tut." : "Welcome and reminder emails are active. Keep notifications on and finish your first 3 attempts.",
      level: "urgent",
      href: "/app/notifications"
    });
  }
  if ((profile?.weeklyGoal ?? 0) > 0) {
    signals.push({
      title: tr ? "Haftalık hedef açık" : "Weekly target is active",
      body: tr ? `${profile?.weeklyGoal ?? 4} speaking hedefin ve günlük ${profile?.dailyMinutesGoal ?? 15} dakika ritmin var. Kaçırdığın günlerde kısa comeback drill aç.` : `Your ${profile?.weeklyGoal ?? 4}-session weekly target and ${profile?.dailyMinutesGoal ?? 15}-minute rhythm are active. Use a short comeback drill on missed days.`,
      level: "good",
      href: "/app/plan"
    });
  }
  signals.push({
    title: tr ? "Bildirim ve email döngüsü" : "Notification and email loop",
    body: tr ? "Homework, risk ve reactivation nudges Action Center'da toplanır. Bu alan comeback trafiğini sıcak tutar." : "Homework, risk, and reactivation nudges are collected in Action Center. This keeps comeback traffic warm.",
    level: "watch",
    href: "/app/notifications"
  });
  return signals;
}

export const proofStories: ProofStory[] = [
  {
    name: "Aylin",
    role: "IELTS self-study learner",
    before: "Band 5.5 answers sounded vague and underdeveloped.",
    after: "Moved to more stable 6.5-style responses with retry practice.",
    note: "Used short daily drills, transcript review, and one retry after every weak answer."
  },
  {
    name: "Emre",
    role: "TOEFL retake student",
    before: "Integrated answers were too messy and lost key lecture points.",
    after: "Built cleaner summaries and a more exam-like speaking rhythm.",
    note: "Simulation mode plus mistake review created a clearer weekly practice loop."
  },
  {
    name: "North Bridge English",
    role: "Small language school",
    before: "Teachers could not see what students practiced between lessons.",
    after: "Class analytics, homework, and shared study lists created better follow-up.",
    note: "Teacher workflows matter most when the student retry loop is visible."
  }
];

function findWeakestSkill(summary: ProgressSummary) {
  const buckets = new Map<string, { total: number; count: number }>();
  summary.recentSessions.forEach((session) => {
    session.report?.categories.forEach((category) => {
      const current = buckets.get(category.label) ?? { total: 0, count: 0 };
      buckets.set(category.label, { total: current.total + category.score, count: current.count + 1 });
    });
  });

  const sorted = [...buckets.entries()]
    .map(([label, value]) => ({ label, score: value.total / value.count }))
    .sort((a, b) => a.score - b.score);

  return sorted[0]?.label ?? null;
}

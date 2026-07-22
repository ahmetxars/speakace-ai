"use client";

import type { Route } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, CheckCircle2, Flame, LayoutGrid, Mic, PenSquare, Sparkles, Target } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers";
import { TrackedLink } from "@/components/tracked-link";
import { trackClientEvent } from "@/lib/analytics-client";
import {
  buildPlanCheckoutPath,
  commerceNumbers,
  couponCatalog,
  formatUsd,
  getAnnualMonthlyEquivalent
} from "@/lib/commerce";
import { getPracticeMomentum, getUtcPracticeDayKey } from "@/lib/practice-streak";
import { resolveDashboardRole } from "@/lib/roles";
import { AnnouncementItem, HomeworkAssignment, ProgressSummary, SharedClassStudyItem, SpeakingSession, StudentClassMembership, StudentProfile } from "@/lib/types";

const emptySummary: ProgressSummary = {
  totalSessions: 0,
  averageScore: 0,
  streakDays: 0,
  freeSessionsRemaining: 4,
  remainingMinutesToday: 8,
  currentPlan: "free",
  recentSessions: []
};

type DashboardNextAction = {
  icon: "mic" | "book" | "flame" | "target" | "sparkles";
  badge: string;
  headline: string;
  context: string;
  href:
    | Route
    | {
        pathname: Route;
        query: Record<string, string>;
      };
  cta: string;
  variant: "primary" | "streak" | "default";
};

export function Dashboard() {
  const router = useRouter();
  const { signedIn, currentUser, language, signOut } = useAppState();
  const tr = language === "tr";
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [targetScore, setTargetScore] = useState<string>("");
  const [joinedClasses, setJoinedClasses] = useState<StudentClassMembership[]>([]);
  const [joinCode, setJoinCode] = useState("");
  const [joinNotice, setJoinNotice] = useState("");
  const [joinError, setJoinError] = useState("");
  const [homework, setHomework] = useState<HomeworkAssignment[]>([]);
  const [sharedStudyClasses, setSharedStudyClasses] = useState<
    Array<{ classId: string; className: string; teacherName: string; items: SharedClassStudyItem[] }>
  >([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const plusAnnualMonthlyEquivalent = getAnnualMonthlyEquivalent(commerceNumbers.plusAnnualPrice);
  const hasTrackedUpgradePromptRef = useRef(false);

  const dashboardRole = resolveDashboardRole(currentUser);
  const isSchoolMember = Boolean(signedIn && dashboardRole === "school");
  const isTeacherMember = Boolean(signedIn && dashboardRole === "teacher");

  useEffect(() => {
    if (isSchoolMember) {
      router.replace("/app/institution-admin");
      return;
    }
    if (isTeacherMember) {
      router.replace("/app/teacher");
    }
  }, [isSchoolMember, isTeacherMember, router]);

  const currentUserId = currentUser?.id;

  useEffect(() => {
    if (!signedIn || !currentUserId) return;
    const ctrl = new AbortController();
    setLoadingSummary(true);
    fetch("/api/progress/summary", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: ProgressSummary) => { setSummary(data); setLoadingSummary(false); })
      .catch(() => { setSummary(emptySummary); setLoadingSummary(false); });
    return () => ctrl.abort();
  }, [currentUserId, signedIn]);

  useEffect(() => {
    if (!signedIn || !currentUserId || isTeacherMember || isSchoolMember) {
      setJoinedClasses([]);
      return;
    }
    const ctrl = new AbortController();
    fetch("/api/classes/join", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { classes?: StudentClassMembership[] }) => setJoinedClasses(data.classes ?? []))
      .catch(() => setJoinedClasses([]));
    return () => ctrl.abort();
  }, [currentUserId, isSchoolMember, isTeacherMember, signedIn]);

  useEffect(() => {
    if (!signedIn || !currentUserId || isTeacherMember || isSchoolMember) {
      setHomework([]);
      return;
    }
    const ctrl = new AbortController();
    fetch("/api/homework", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { assignments?: HomeworkAssignment[] }) => setHomework(data.assignments ?? []))
      .catch(() => setHomework([]));
    return () => ctrl.abort();
  }, [currentUserId, isSchoolMember, isTeacherMember, signedIn]);

  useEffect(() => {
    if (!signedIn || !currentUserId || isTeacherMember || isSchoolMember) {
      setSharedStudyClasses([]);
      return;
    }
    const ctrl = new AbortController();
    fetch("/api/classes/shared-study", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { classes?: Array<{ classId: string; className: string; teacherName: string; items: SharedClassStudyItem[] }> }) =>
        setSharedStudyClasses(data.classes ?? [])
      )
      .catch(() => setSharedStudyClasses([]));
    return () => ctrl.abort();
  }, [currentUserId, isSchoolMember, isTeacherMember, signedIn]);

  useEffect(() => {
    if (!signedIn || !currentUserId) {
      setAnnouncements([]);
      setProfile(null);
      return;
    }
    const ctrl = new AbortController();
    fetch("/api/announcements", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { announcements?: AnnouncementItem[] }) => setAnnouncements(data.announcements ?? []))
      .catch(() => setAnnouncements([]));
    fetch("/api/profile", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { profile?: StudentProfile }) => {
        setProfile(data.profile ?? null);
      })
      .catch(() => setProfile(null));
    return () => ctrl.abort();
  }, [currentUserId, signedIn]);

  const scoredSessions = useMemo(
    () => summary.recentSessions.filter((s) => s.report),
    [summary.recentSessions]
  );

  const latestExamType = scoredSessions[0]?.examType ?? "IELTS";
  const storageKey = currentUser ? `speakace-target-${currentUser.id}` : "speakace-target-guest";

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (stored !== null) {
      setTargetScore(stored);
      return;
    }
    if (profile?.targetScore != null) {
      const v = String(profile.targetScore);
      setTargetScore(v);
      if (typeof window !== "undefined") window.localStorage.setItem(storageKey, v);
      return;
    }
    setTargetScore("");
  }, [profile?.targetScore, storageKey]);

  const handleTargetScoreChange = (value: string) => {
    setTargetScore(value);
    if (typeof window !== "undefined") {
      if (value) {
        window.localStorage.setItem(storageKey, value);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    }
    setProfile((p) => (p ? { ...p, targetScore: value ? Number(value) : null } : p));
    if (currentUser?.id) {
      void trackClientEvent({ userId: currentUser.id, event: "target_score_updated", path: "/app" });
    }
    if (currentUser?.id && profile) {
      void fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, targetScore: value ? Number(value) : null })
      }).catch(() => undefined);
    }
  };

  const skillProfile = useMemo(() => {
    const buckets = new Map<string, { total: number; count: number }>();
    scoredSessions.forEach((session) => {
      session.report?.categories.forEach((cat) => {
        const current = buckets.get(cat.label) ?? { total: 0, count: 0 };
        buckets.set(cat.label, { total: current.total + cat.score, count: current.count + 1 });
      });
    });
    const averaged = [...buckets.entries()].map(([label, s]) => ({
      label,
      score: Number((s.total / s.count).toFixed(1))
    }));
    if (!averaged.length) {
      return { weakestSkill: null as null | { label: string; score: number }, balanced: false, spread: 0 };
    }
    const sorted = averaged.sort((a, b) => a.score - b.score);
    const spread = Number((sorted.at(-1)!.score - sorted[0].score).toFixed(1));
    const balanced = spread <= 0.4 || sorted.every((item) => item.score >= 6.5);
    return { weakestSkill: balanced ? null : sorted[0], balanced, spread };
  }, [scoredSessions]);

  const weakestSkill = skillProfile.weakestSkill;
  const hasBalancedSkillProfile = skillProfile.balanced;
  const numericTarget = Number(targetScore || 0);
  const scoreGap = numericTarget && summary.averageScore
    ? Number((numericTarget - summary.averageScore).toFixed(1))
    : null;
  const targetLabel = latestExamType === "IELTS"
    ? (tr ? "hedef band" : "target band")
    : tr ? "hedef skor" : "target score";

  const nextStudyFocus = useMemo(() => {
    if (hasBalancedSkillProfile) {
      return tr
        ? "Skor kategorilerin birbirine yakin gorunuyor. Simdi tek bir skill'i zorlamaktan cok daha olgun ornekler, daha dogal baglantilar ve daha temiz cevap ritmi uzerine gitmek daha mantikli."
        : "Your category scores look fairly balanced. Instead of forcing one weak skill, it makes more sense to improve maturity of examples, natural linking, and overall response rhythm.";
    }
    if (!weakestSkill) {
      return tr
        ? "Duzenli speaking yaptikca sistem hangi skill tarafinda daha cok calisman gerektigini daha net gosterecek. Once net, tamamlanmis ve dogal cevaplar vermeye odaklan."
        : "As you complete more speaking attempts, the dashboard will identify the skill that needs the most work. For now, focus on complete, natural, and clearly structured answers.";
    }
    const focusMap: Record<string, { tr: string; en: string }> = {
      "Fluency and Coherence": {
        tr: "Akicilik ve tutarlilik su anda en zayif alanin. Fikirlerini daha temiz baglayip duraksamalari azaltman puani daha hizli yukari ceker.",
        en: "Fluency and coherence is your weakest area right now. Smoother transitions and fewer long pauses will raise your score faster."
      },
      "Lexical Resource": {
        tr: "Kelime kullanimi gelismeli. Ayni kelimeleri tekrar etmek yerine konuya uygun 1-2 daha guclu ifade kullan.",
        en: "Vocabulary range needs work. Replace repeated words with one or two stronger topic-specific expressions."
      },
      "Grammatical Range and Accuracy": {
        tr: "Dilbilgisel dogruluk geride kaliyor. Bir tik daha yavas konusup daha temiz ve kontrollu cumleler kurmak faydali olacak.",
        en: "Grammatical accuracy is lagging. Slow down slightly and build cleaner, more controlled sentences."
      },
      Pronunciation: {
        tr: "Telaffuz tarafinda calisma lazim. Kelime sonlarini, vurgu noktalarini ve anlasilir ritmi daha net vermeye odaklan.",
        en: "Pronunciation needs more work. Focus on clearer word endings, stress, and a more understandable rhythm."
      },
      Delivery: {
        tr: "Delivery seni asagi cekiyor. Ritim, netlik ve nefes kontrolune dikkat ederek daha profesyonel bir duyum yakalayabilirsin.",
        en: "Delivery is pulling your score down. Better pace, clarity, and breath control will make your response sound more polished."
      },
      "Language Use": {
        tr: "Dil kullanimi daha cesitli olmali. Ayni kaliplari tekrar etmek yerine cumlelerini farkli yapilarla genislet.",
        en: "Language use should be more varied. Expand your sentence patterns instead of repeating the same structures."
      },
      "Topic Development": {
        tr: "Icerik gelisimi zayif. Her cevapta net bir ana fikir, bir neden ve bir ornek kullanmaya calis.",
        en: "Topic development is weak. Try to include a clear main idea, one reason, and one supporting example in every answer."
      }
    };
    return tr
      ? focusMap[weakestSkill.label]?.tr ?? "Bir sonraki denemede en zayif skill'ine odaklan."
      : focusMap[weakestSkill.label]?.en ?? "Focus on your weakest skill in the next attempt.";
  }, [hasBalancedSkillProfile, tr, weakestSkill]);

  const roadmap = useMemo(() => {
    const estimatedNumeric = profile?.estimatedLevel
      ? getLevelNumeric(profile.estimatedLevel, latestExamType)
      : null;

    if (!summary.averageScore) {
      if (estimatedNumeric && numericTarget) {
        const estimatedGap = Number((numericTarget - estimatedNumeric).toFixed(1));
        if (estimatedGap <= 0) {
          return tr
            ? `Tahmini seviyene göre hedefine zaten yakınsın. Birkaç deneme sonrası sistem gerçek skorunla yolu netleştirecek.`
            : `Based on your self-assessment, you're already close to your target. A few sessions will let the system refine this with real scores.`;
        }
        if (estimatedGap >= (latestExamType === "IELTS" ? 2.0 : 1.0)) {
          return tr
            ? `Tahmini seviyenle hedefin arasında ciddi bir mesafe var — bu bir maraton. İlk 2 hafta sadece akıcılığa ve cevap yapısına odaklan, skoru sonra kur.`
            : `Your self-assessed level suggests a significant gap to your target — this is a marathon. First 2 weeks: fluency and answer structure only. Score-chasing comes after.`;
        }
        return tr
          ? `Tahmini seviyene göre hedefine birkaç adım kaldı. İlk denemelerini tamamla, sistem ortalamana göre daha isabetli bir plan çıkaracak.`
          : `Your self-assessed level puts you a few steps from your target. Complete your first sessions and the system will map a precise plan.`;
      }
      return tr
        ? "Henüz yeterli speaking denemesi yok. Önce 3-4 farklı task çöz, sonra sistem ortalamana göre daha isabetli bir yol planı çıkarır."
        : "You do not have enough scored attempts yet. Complete 3-4 different tasks first, then the roadmap becomes much more reliable.";
    }
    if (!numericTarget) {
      return tr
        ? "İsteğe bağlı bir hedef band belirledikten sonra sistem ortalama skorun ile hedef arasındaki farka göre daha net bir yol çizecek."
        : "Once you set an optional target score, the dashboard will map your current average against that goal more clearly.";
    }
    if ((scoreGap ?? 0) <= 0) {
      return tr
        ? `Ortalaman şu an ${targetLabel} seviyene çok yakın ya da üstünde. Bundan sonraki aşama istikrarlı kaliteyi sürdürmek: daha net açılış, daha temiz bağlantı ve daha doğal bir ritim.`
        : `Your average is already close to or above your ${targetLabel}. The next phase is consistency: cleaner openings, smoother linking, and a more natural rhythm.`;
    }
    if ((scoreGap ?? 0) >= (latestExamType === "IELTS" ? 1.2 : 0.8)) {
      return tr
        ? `Hedefin ile ortalaman arasında belirgin bir fark var. En hızlı ilerleme için önce cevap iskeletini sabitle, sonra her cevapta reason + example kullan, en son zayıf skill'ini ayrı drill ile güçlendir.`
        : `There is still a meaningful gap between your average and your target. Stabilize your answer structure first, then add a clear reason and example, and finally train your weakest skill separately.`;
    }
    return tr
      ? `Hedefine yaklaşıyorsun. Bu seviyede skoru yukarı taşıyan şey daha olgun örnekler, daha doğal bağlantı kelimeleri ve gereksiz tekrarların azalmasıdır.`
      : `You are getting close to your target. Stronger examples, more natural linking, and fewer repeated phrases will move the score higher.`;
  }, [latestExamType, numericTarget, profile?.estimatedLevel, scoreGap, summary.averageScore, targetLabel, tr]);

  const streakCalendar = useMemo(
    () => buildRecentStreakCalendar(summary.recentSessions),
    [summary.recentSessions]
  );
  const practiceMomentum = useMemo(
    () => getPracticeMomentum(summary.recentSessions),
    [summary.recentSessions]
  );
  const practicedToday = practiceMomentum.practicedToday;

  const nextAction = useMemo<DashboardNextAction>(() => {
    if (!summary.totalSessions) {
      return {
        icon: "mic" as const,
        badge: tr ? "Başlangıç" : "Get started",
        headline: tr ? "İlk speaking pratiğini başlat" : "Start your first speaking practice",
        context: tr
          ? "İlk oturum yaklaşık 5 dakika sürer. Sistem skor ortalamanı ve gelişim alanlarını buradan takip etmeye başlar."
          : "Your first session takes about 5 minutes. The system begins tracking your scores and growth areas from session one.",
        href: "/app/practice",
        cta: tr ? "Pratik başlat →" : "Start practice →",
        variant: "primary" as const,
      };
    }
    const pending = homework.filter((h) => !h.completedAt);
    if (pending.length > 0 && pending[0]) {
      const hw = pending[0];
      const dueStr = hw.dueAt
        ? ` · ${tr ? "Teslim" : "Due"}: ${new Date(hw.dueAt).toLocaleDateString(tr ? "tr-TR" : "en-US", { month: "short", day: "numeric" })}`
        : "";
      return {
        icon: "book" as const,
        badge: tr ? "Ödev" : "Homework",
        headline: hw.title,
        context: tr ? `Öğretmenin atadı${dueStr}` : `Assigned by your teacher${dueStr}`,
        href: hw.promptId
          ? {
              pathname: "/app/practice",
              query: {
                promptId: hw.promptId,
                examType: hw.recommendedTaskType.startsWith("toefl") ? "TOEFL" : "IELTS",
                taskType: hw.recommendedTaskType,
                difficulty: "Target",
              },
            }
          : "/app/practice",
        cta: tr ? "Ödevi başlat →" : "Start homework →",
        variant: "primary" as const,
      };
    }
    if (summary.streakDays > 0 && !practicedToday) {
      return {
        icon: "flame" as const,
        badge: tr ? "Seri riski" : "Streak at risk",
        headline: tr
          ? `${summary.streakDays} günlük serin var — bugün pratiğini yap`
          : `You have a ${summary.streakDays}-day streak — don't break it today`,
        context: tr
          ? "Bugün en az bir speaking oturumu yapman seriyi canlı tutar."
          : "Complete at least one speaking session today to keep your streak alive.",
        href: "/app/practice",
        cta: tr ? "Seriyi koru →" : "Keep streak →",
        variant: "streak" as const,
      };
    }
    if (scoreGap !== null && scoreGap >= (latestExamType === "IELTS" ? 1.2 : 0.8)) {
      return {
        icon: "target" as const,
        badge: tr ? "Hedef açığı" : "Gap to target",
        headline: tr
          ? `Hedefine ${scoreGap} puan uzakta — odaklı pratik gerekiyor`
          : `${scoreGap} points from your ${targetLabel} — focused practice needed`,
        context: weakestSkill
          ? tr
            ? `${translateCategoryLabel(weakestSkill.label)} en zayıf kategorin (${weakestSkill.score}).`
            : `${weakestSkill.label} is your weakest category (${weakestSkill.score}).`
          : tr
            ? "Düzenli pratik bu açığı kapatır."
            : "Consistent targeted practice will close this gap.",
        href: "/app/practice",
        cta: tr ? "Odaklı pratik →" : "Targeted practice →",
        variant: "primary" as const,
      };
    }
    if (weakestSkill) {
      return {
        icon: "sparkles" as const,
        badge: tr ? translateCategoryLabel(weakestSkill.label) : weakestSkill.label,
        headline: tr
          ? `En zayıf alanın: ${translateCategoryLabel(weakestSkill.label)}`
          : `Weakest area: ${weakestSkill.label}`,
        context: tr
          ? `Skor ${weakestSkill.score} · Bu kategoriye odaklanmak ortalamayı daha hızlı yükseltir.`
          : `Score ${weakestSkill.score} · Targeting this category raises your average fastest.`,
        href: "/app/practice",
        cta: tr ? "Bu alanda pratik →" : "Practice this skill →",
        variant: "primary" as const,
      };
    }
    return {
      icon: "mic" as const,
      badge: tr ? "Devam et" : "Keep going",
      headline: tr ? "Bugün bir speaking oturumu daha yap" : "Try another speaking session today",
      context: tr
        ? "Daha fazla oturum, sistemin performans örüntülerini daha net görmesini sağlar."
        : "More sessions help the system surface clearer performance patterns.",
      href: "/app/practice",
      cta: tr ? "Pratik başlat →" : "Start session →",
      variant: "default" as const,
    };
  }, [homework, latestExamType, practicedToday, scoreGap, summary.streakDays, summary.totalSessions, targetLabel, tr, weakestSkill]);

  const needsOnboarding = Boolean(
    signedIn && currentUser && !isTeacherMember && !isSchoolMember && profile && !profile.onboardingComplete
  );
  const shouldUpsellPlus = Boolean(
    signedIn && currentUser && !isTeacherMember && !isSchoolMember && currentUser.plan === "free"
  );
  const isNearDailyLimit = summary.freeSessionsRemaining <= 1 || summary.remainingMinutesToday <= 2;
  const highIntentPrep = (profile?.weeklyGoal ?? 0) >= 4 || (scoreGap ?? 0) >= (latestExamType === "IELTS" ? 1.2 : 0.8);
  const recommendedUpsellBilling = highIntentPrep ? "annual" : "weekly";
  const upsellHeadline = tr
    ? isNearDailyLimit
      ? "Bugunku limiti kaldir ve ivmeyi kaybetme"
      : "Daha hizli ilerleme icin Plus'a gec"
    : isNearDailyLimit
      ? "Remove today's limit and keep the momentum"
      : "Move to Plus for faster improvement";
  const upsellBody = tr
    ? isNearDailyLimit
      ? `Bugun kalan hakkin ${summary.freeSessionsRemaining} session ve ${summary.remainingMinutesToday} dakika. Plus ile ayni gun daha fazla deneme yapip tam geri bildirim alirsin.`
      : `Hedefin ve calisma ritmin, daha duzenli bir practice dongusu gerektiriyor. Plus; daha fazla speaking hacmi, tam feedback ve ayni gun retry imkani verir.`
    : isNearDailyLimit
      ? `You only have ${summary.freeSessionsRemaining} sessions and ${summary.remainingMinutesToday} minutes left today. Plus lets you keep practicing the same day with full feedback.`
      : `Your target and study rhythm suggest a more consistent practice loop. Plus gives you more speaking volume, full feedback, and same-day retries.`;
  const upsellRecommendation = tr
    ? recommendedUpsellBilling === "annual"
      ? `Sana daha uygun teklif: yillik Plus. Aylik maliyet yaklasik ${formatUsd(plusAnnualMonthlyEquivalent)} seviyesine iner.`
      : `Sana daha uygun teklif: haftalik Plus. Ilk odemeyi daha dusuk surtunmeyle test edebilirsin.`
    : recommendedUpsellBilling === "annual"
      ? `Best fit for you: annual Plus. The monthly equivalent drops to about ${formatUsd(plusAnnualMonthlyEquivalent)}.`
      : `Best fit for you: weekly Plus. It is the lower-friction way to test your first paid upgrade.`;

  useEffect(() => {
    if (!shouldUpsellPlus || hasTrackedUpgradePromptRef.current || !currentUser?.id) return;
    hasTrackedUpgradePromptRef.current = true;
    void trackClientEvent({
      userId: currentUser.id,
      event: "upgrade_prompt_view",
      path: `/app/dashboard/upgrade/${recommendedUpsellBilling}`
    });
  }, [currentUser?.id, recommendedUpsellBilling, shouldUpsellPlus]);

  const joinClass = async () => {
    setJoinError("");
    setJoinNotice("");
    const response = await fetch("/api/classes/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode })
    });
    const data = (await response.json()) as {
      error?: string;
      classroom?: { name: string; joinMessage?: string | null };
      status?: "pending" | "approved";
    };
    if (!response.ok) {
      setJoinError(data.error ?? (tr ? "Sinifa katilinamadi." : "Could not join class."));
      return;
    }
    setJoinCode("");
    setJoinNotice(
      data.status === "pending"
        ? tr
          ? `Talebin alindi. Ogretmen onayindan sonra sinif gorunecek.${data.classroom?.joinMessage ? ` ${data.classroom.joinMessage}` : ""}`
          : `Your request was sent. The class will appear after teacher approval.${data.classroom?.joinMessage ? ` ${data.classroom.joinMessage}` : ""}`
        : tr
          ? "Sinifa katilim basarili."
          : "You joined the class."
    );
    const refresh = await fetch("/api/classes/join");
    const refreshData = (await refresh.json()) as { classes?: StudentClassMembership[] };
    setJoinedClasses(refreshData.classes ?? []);
  };

  const completeHomework = async (assignmentId: string) => {
    const response = await fetch("/api/homework", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignmentId })
    });
    const data = (await response.json()) as { assignment?: HomeworkAssignment };
    if (!response.ok || !data.assignment) return;
    setHomework((current) => current.map((item) => (item.id === assignmentId ? data.assignment! : item)));
  };

  if (isSchoolMember || isTeacherMember) return null;

  const firstName = currentUser?.name?.split(" ")[0] ?? "";
  const pendingHomeworkCount = homework.filter((item) => !item.completedAt).length;
  const classCount = joinedClasses.length;
  const heroStatus = summary.totalSessions
    ? tr
      ? `${summary.totalSessions} deneme tamamlandi, seri ${summary.streakDays} gun oldu.`
      : `${summary.totalSessions} sessions completed, and your streak is now ${summary.streakDays} days.`
    : tr
      ? "Bugun ilk denemeni atip dashboardu veriyle doldurmaya baslayabilirsin."
      : "Start your first attempt today and begin filling the dashboard with real data.";
  const isPlusTrial = signedIn && currentUser?.plan === "plus" && currentUser.billingStatus === "on_trial";
  const trialEndsAt = currentUser?.trialEndsAt ? new Date(currentUser.trialEndsAt) : null;
  const hasValidTrialEnd = Boolean(trialEndsAt && !Number.isNaN(trialEndsAt.getTime()));
  const trialHoursRemaining = hasValidTrialEnd
    ? Math.max(0, Math.ceil((trialEndsAt!.getTime() - Date.now()) / (60 * 60 * 1000)))
    : null;
  const trialTimeLabel = trialHoursRemaining === null
    ? (tr ? "3 gunluk deneme aktif" : "3-day trial active")
    : trialHoursRemaining <= 24
      ? tr
        ? `${trialHoursRemaining} saat kaldi`
        : `${trialHoursRemaining} hours left`
      : tr
        ? `${Math.ceil(trialHoursRemaining / 24)} gun kaldi`
        : `${Math.ceil(trialHoursRemaining / 24)} days left`;
  const momentumDays = Math.min(practiceMomentum.activeDays7, 3);
  const momentumComplete = momentumDays >= 3;
  const momentumNextDay = Math.min(momentumDays + 1, 3);
  const showMomentumMission = Boolean(
    !loadingSummary &&
    signedIn &&
    (isPlusTrial || (summary.totalSessions > 0 && momentumDays > 0 && !momentumComplete))
  );
  const momentumPracticeHref = {
    pathname: "/app/practice" as Route,
    query: {
      quickStart: "1",
      runMode: "interview",
      activation: `dashboard_momentum_day_${momentumNextDay}`
    }
  };
  const momentumReviewHref: Route = scoredSessions[0]
    ? (`/app/results/${scoredSessions[0].id}` as Route)
    : "/app/review";

  return (
    <div className="page-shell section db-page">

      {/* THREE-DAY MOMENTUM MISSION */}
      {showMomentumMission ? (
        <section className="db-banner db-momentum-banner card" data-trial={isPlusTrial ? "true" : "false"}>
          <div className="db-momentum-copy">
            <div className="db-banner-body">
              <Sparkles size={16} />
              <div>
                <strong style={{ display: "block", marginBottom: "0.2rem" }}>
                  {isPlusTrial
                    ? tr
                      ? `Plus deneme gorevi · ${trialTimeLabel}`
                      : `Plus trial mission · ${trialTimeLabel}`
                    : tr
                      ? `3 gunluk speaking ivmesi · ${momentumDays}/3 gun`
                      : `3-day speaking momentum · ${momentumDays}/3 days`}
                </strong>
                <p>
                  {momentumComplete
                    ? tr
                      ? "Uc farkli gunde tamamlanmis cevap verdin. Simdi geri bildirimi bir sonraki cevaba tasiyarak bu ritmi koru."
                      : "You completed answers on three different days. Keep the rhythm by carrying one feedback point into your next answer."
                    : practicedToday
                      ? tr
                        ? "Bugunku tamamlanmis cevabin kaydedildi. Yarin tek bir 5 dakikalik cevapla bir sonraki gunu ac."
                        : "Today's completed answer is locked in. Return tomorrow for one five-minute answer to unlock the next day."
                      : tr
                        ? `Bugun bir cevabi tamamla ve ${momentumNextDay}. gunu ac. Ayni gun cok deneme degil, farkli gunlerde geri donmek ivmeyi kurar.`
                        : `Complete one answer today to unlock day ${momentumNextDay}. Returning on different days builds momentum better than stacking sessions on one day.`}
                </p>
              </div>
            </div>
            <div className="db-momentum-progress" aria-label={tr ? "Uc gunluk speaking ilerlemesi" : "Three-day speaking progress"}>
              {[1, 2, 3].map((day) => {
                const done = day <= momentumDays;
                const current = !done && day === momentumNextDay;
                return (
                  <span key={day} className="db-momentum-step" data-done={done ? "true" : "false"} data-current={current ? "true" : "false"}>
                    <span>{done ? <CheckCircle2 size={14} /> : day}</span>
                    <small>{tr ? `Gun ${day}` : `Day ${day}`}</small>
                  </span>
                );
              })}
            </div>
          </div>
          <div className="dashboard-inline-actions">
            {!momentumComplete && !practicedToday ? (
              <TrackedLink
                className="button button-primary"
                href={momentumPracticeHref}
                userId={currentUser?.id}
                analyticsEvent="marketing_cta_click"
                analyticsPath={`/app/momentum/day-${momentumNextDay}${isPlusTrial ? "/trial" : ""}`}
              >
                {tr ? `${momentumNextDay}. gunu baslat →` : `Start day ${momentumNextDay} →`}
              </TrackedLink>
            ) : (
              <Link className="button button-primary" href={momentumReviewHref}>
                {momentumComplete
                  ? tr ? "Gelisim alanlarini ac →" : "Open improvement review →"
                  : tr ? "Bugunku geri bildirimi ac →" : "Review today's feedback →"}
              </Link>
            )}
            <Link className="button button-secondary" href={isPlusTrial ? "/app/billing" : "/app/plan"}>
              {isPlusTrial ? (tr ? "Plan detaylari" : "Plan details") : (tr ? "Calisma plani" : "Study plan")}
            </Link>
          </div>
        </section>
      ) : null}

      {/* ONBOARDING BANNER */}
      {needsOnboarding ? (
        <section className="db-banner card" style={{ background: "rgba(29,111,117,0.07)", border: "1.5px solid rgba(29,111,117,0.2)" }}>
          <div className="db-banner-body">
            <Sparkles size={15} />
            <div>
              <strong style={{ display: "block", marginBottom: "0.2rem" }}>
                {tr ? "İlk ücretsiz AI speaking skorunu al" : "Get your first free AI speaking score"}
              </strong>
              <p style={{ margin: 0, fontSize: "0.87rem", color: "var(--muted)" }}>
                {tr
                  ? "Yaklaşık 5 dakikada ilk cevabını kaydet ve gelişim alanlarını gör. Kişisel programını daha sonra tamamlayabilirsin."
                  : "Record your first answer and see what to improve in about 5 minutes. You can personalize your plan afterwards."}
              </p>
            </div>
          </div>
          <div className="dashboard-inline-actions">
            <TrackedLink
              className="button button-primary"
              href="/app/practice?quickStart=1&runMode=interview"
              userId={currentUser?.id}
              analyticsEvent="marketing_cta_click"
              analyticsPath="/app/activation/first-score"
            >
              {tr ? "İlk skorumu al →" : "Get my first score →"}
            </TrackedLink>
            <Link className="button button-secondary" href="/app/onboarding">
              {tr ? "Önce programı kişiselleştir" : "Personalize my plan first"}
            </Link>
          </div>
        </section>
      ) : null}

      {/* HERO */}
      <section className="db-hero card">
        <div className="db-hero-copy">
          <span className="eyebrow">{tr ? "Ogrenci dashboard" : "Student dashboard"}</span>
          <h1 className="db-hero-name">
            {firstName
              ? tr ? `Merhaba, ${firstName}` : `Hi, ${firstName}`
              : tr ? "Hos geldin" : "Welcome back"}
          </h1>
          <p className="db-hero-status">{heroStatus}</p>
          <div className="db-hero-actions">
            <Link className="button button-primary" href="/app/practice">
              <Mic size={15} />
              {tr ? "Speaking baslat" : "Start practice"}
            </Link>
            <Link className="button button-secondary" href="/app/profile">
              {tr ? "Profil" : "Profile"}
            </Link>
            <button className="button button-secondary" type="button" onClick={signedIn ? signOut : undefined}>
              {signedIn ? (tr ? "Cikis" : "Sign out") : tr ? "Misafir" : "Guest"}
            </button>
          </div>
        </div>
        <div className="db-hero-stats">
          {loadingSummary ? (
            <>
              <div className="db-hero-stat db-hero-stat-primary"><div className="skeleton skeleton-stat" style={{ width: "3rem" }} /></div>
              <div className="db-hero-stat"><div className="skeleton skeleton-stat" style={{ width: "3rem" }} /></div>
              <div className="db-hero-stat"><div className="skeleton skeleton-stat" style={{ width: "3rem" }} /></div>
              <div className="db-hero-stat"><div className="skeleton skeleton-stat" style={{ width: "3rem" }} /></div>
            </>
          ) : (
            <>
              <div className="db-hero-stat db-hero-stat-primary">
                <span className="db-hero-stat-label">{tr ? "ort skor" : "avg score"}</span>
                <strong>{summary.averageScore || "—"}</strong>
                {scoreGap !== null ? (
                  <span className="db-gap-badge" data-positive={scoreGap <= 0 ? "true" : "false"}>
                    {scoreGap <= 0
                      ? (tr ? "hedefte" : "on target")
                      : `−${scoreGap} ${tr ? "hedefe" : "to goal"}`}
                  </span>
                ) : null}
              </div>
              <div className="db-hero-stat">
                <Target size={14} />
                <strong>{targetScore || "—"}</strong>
                <span>{targetLabel}</span>
              </div>
              <div className="db-hero-stat">
                <Flame size={14} />
                <strong>{summary.streakDays}</strong>
                <span>{tr ? "gün seri" : "day streak"}</span>
              </div>
              <div className="db-hero-stat">
                <strong>{summary.totalSessions}</strong>
                <span>{tr ? "toplam" : "sessions"}</span>
              </div>
            </>
          )}
        </div>
      </section>

      {/* DECISION STRIP */}
      {!loadingSummary ? (
        <section className="db-decision-strip card" data-variant={nextAction.variant}>
          <div className="db-decision-badge">
            {nextAction.icon === "flame" ? <Flame size={14} /> :
             nextAction.icon === "book" ? <BookOpenCheck size={14} /> :
             nextAction.icon === "target" ? <Target size={14} /> :
             nextAction.icon === "sparkles" ? <Sparkles size={14} /> :
             <Mic size={14} />}
            <span>{nextAction.badge}</span>
          </div>
          <div className="db-decision-content">
            <strong>{nextAction.headline}</strong>
            <p>{nextAction.context}</p>
          </div>
          <Link className="button button-primary db-decision-cta" href={nextAction.href}>
            {nextAction.cta}
          </Link>
        </section>
      ) : null}

      {/* PERSONALIZED INSIGHT */}
      {profile?.onboardingComplete && (profile?.englishBackground || profile?.biggestChallenge) ? (
        <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.7rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={14} style={{ color: "var(--sa-accent)" }} />
            <span className="eyebrow">{tr ? "Sana özel analiz" : "Your personalized insight"}</span>
          </div>
          <p style={{ margin: 0, lineHeight: 1.75, color: "var(--text)" }}>
            {buildPersonalizedMessage(profile, tr)}
          </p>
          {profile?.biggestChallenge ? (
            <div style={{ padding: "0.8rem 1rem", borderRadius: 12, background: "rgba(29,111,117,0.07)", border: "1px solid rgba(29,111,117,0.15)" }}>
              <strong style={{ fontSize: "0.87rem", color: "var(--sa-accent)" }}>
                {tr ? "Önerilen ilk pratik:" : "Recommended first practice:"}
              </strong>
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.87rem", color: "var(--muted)", lineHeight: 1.6 }}>
                {buildFirstTaskRecommendation(profile.biggestChallenge, profile.preferredExamType, tr)}
              </p>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* PROGRESS & HISTORY */}
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "1rem" }}>
        <div className="dashboard-section-head">
          <span className="eyebrow">{tr ? "Gecmis & ilerleme" : "Progress & history"}</span>
          <Link href="/app/analytics" style={{ fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none" }}>
            {tr ? "Tum gecmis →" : "View all →"}
          </Link>
        </div>
        {summary.recentSessions.length ? (
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {summary.recentSessions.slice(0, 8).map((session) => (
              <SessionRow key={session.id} session={session} tr={tr} />
            ))}
          </div>
        ) : (
          <p className="dashboard-empty-copy" style={{ margin: 0 }}>
            {tr
              ? "İlk oturum yaklaşık 5 dakika sürer. Sistem skor ortalamanı ve gelişim alanlarını birinci oturumdan itibaren takip etmeye başlar."
              : "Your first session takes about 5 minutes. The system begins tracking your scores and growth areas from session one."}
          </p>
        )}
      </section>

      {/* MAIN GRID */}
      <div className="db-body-grid">

        {/* LEFT COLUMN */}
        <div className="db-left-col">

          {/* TODAY'S FOCUS */}
          <div className="db-focus-card card">
            <div className="dashboard-section-head">
              <span className="eyebrow">{tr ? "Bugünkü odak" : "Today's focus"}</span>
              {weakestSkill ? (
                <span className="dashboard-chip db-focus-skill-chip">
                  {tr ? translateCategoryLabel(weakestSkill.label) : weakestSkill.label}
                  <span className="db-focus-skill-score">{weakestSkill.score}</span>
                </span>
              ) : null}
            </div>
            <p className="db-focus-insight">{nextStudyFocus}</p>
            <div className="db-roadmap-block">
              <strong>{tr ? "Yol haritası" : "Your path"}</strong>
              <p>{roadmap}</p>
            </div>
            <Link className="button button-primary" href="/app/practice" style={{ alignSelf: "start" }}>
              {tr ? "Pratiğe git →" : "Go to practice →"}
            </Link>
          </div>

          {/* QUICK ACTIONS */}
          <div className="db-workspace-grid">
            <a href="/app/review" className="db-workspace-card card">
              <div className="db-workspace-icon"><BookOpenCheck size={18} /></div>
              <strong>{tr ? "Review board" : "Review board"}</strong>
              <p>{tr ? "Tekrarlayan zayıf kalıpları tek yerde takip et." : "Track repeated weak patterns in one focused space."}</p>
              <span className="db-workspace-cta">
                {tr ? "Hataya dön" : "Open review"} <ArrowRight size={14} />
              </span>
            </a>
            <a href="/app/writing" className="db-workspace-card card">
              <div className="db-workspace-icon"><PenSquare size={18} /></div>
              <strong>{tr ? "Writing coach" : "Writing coach"}</strong>
              <p>{tr ? "Essay yaz, band tahmini al, düzeltmeleri gör." : "Write an essay, get a band estimate, and review corrections."}</p>
              <span className="db-workspace-cta">
                {tr ? "Writing'e git" : "Open writing"} <ArrowRight size={14} />
              </span>
            </a>
            <a href="/app/study-lists" className="db-workspace-card card">
              <div className="db-workspace-icon"><LayoutGrid size={18} /></div>
              <strong>{tr ? "Çalışma listeleri" : "Study lists"}</strong>
              <p>{tr ? "Kaydedilen promptlar ve öğretmen listeleri." : "Saved prompts and teacher study lists."}</p>
              <span className="db-workspace-cta">
                {tr ? "Listeyi aç" : "Open lists"} <ArrowRight size={14} />
              </span>
            </a>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="db-sidebar">

          {/* TARGET SCORE */}
          <TargetCard
            examType={latestExamType}
            targetScore={targetScore}
            onChange={handleTargetScoreChange}
            tr={tr}
          />

          {/* STREAK CALENDAR */}
          <div className="card db-streak-card">
            <div className="dashboard-section-head">
              <span className="eyebrow">{tr ? "Son 7 gun" : "Last 7 days"}</span>
              <span className="dashboard-chip">{summary.streakDays}d</span>
            </div>
            <div className="db-streak-grid">
              {streakCalendar.map((day) => (
                <div key={day.key} className="db-streak-day">
                  <span>{day.label}</span>
                  <div data-active={day.active ? "true" : "false"}>
                    {day.active ? <CheckCircle2 size={13} /> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CLASS & HOMEWORK */}
          {signedIn && !currentUser?.isTeacher ? (
            <div className="card db-class-card">
              <div className="dashboard-section-head">
                <span className="eyebrow">{tr ? "Sinif ve odevler" : "Class & homework"}</span>
                {(pendingHomeworkCount + classCount) > 0 ? (
                  <span className="dashboard-chip">{pendingHomeworkCount + classCount}</span>
                ) : null}
              </div>

              <div className="db-join-block">
                <strong>{tr ? "Sinifa katil" : "Join a class"}</strong>
                <div className="dashboard-join-row">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder={tr ? "Kod gir" : "Enter code"}
                  />
                  <button type="button" className="button button-primary" onClick={joinClass}>
                    {tr ? "Katil" : "Join"}
                  </button>
                </div>
                {joinNotice ? <p className="dashboard-success-copy">{joinNotice}</p> : null}
                {joinError ? <p className="dashboard-error-copy">{joinError}</p> : null}
                {joinedClasses.length ? (
                  <div className="dashboard-pill-list">
                    {joinedClasses.map((item) => (
                      <div key={`${item.classId}-${item.joinedAt}`} className="dashboard-info-pill">
                        <strong>{item.className}</strong>
                        <span>{item.teacherName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="dashboard-empty-copy">{tr ? "Henuz sinif yok." : "No classes yet."}</p>
                )}
              </div>

              {homework.length > 0 ? (
                <div className="db-hw-block">
                  <strong className="db-block-label">{tr ? "Odevler" : "Homework"}</strong>
                  <div className="dashboard-homework-list">
                    {homework.slice(0, 3).map((item) => (
                      <div key={item.id} className="dashboard-homework-card">
                        <div>
                          <strong>{item.title}</strong>
                          {item.dueAt ? (
                            <span>
                              {tr ? "Teslim" : "Due"}: {new Date(item.dueAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}
                            </span>
                          ) : null}
                        </div>
                        <div className="dashboard-inline-actions">
                          {item.promptId ? (
                            <Link
                              className="button button-secondary"
                              href={{
                                pathname: "/app/practice",
                                query: {
                                  promptId: item.promptId,
                                  examType: item.recommendedTaskType.startsWith("toefl") ? "TOEFL" : "IELTS",
                                  taskType: item.recommendedTaskType,
                                  difficulty: "Target"
                                }
                              }}
                            >
                              {tr ? "Ac" : "Open"}
                            </Link>
                          ) : null}
                          {!item.completedAt ? (
                            <button
                              type="button"
                              className="button button-secondary"
                              onClick={() => completeHomework(item.id)}
                            >
                              {tr ? "Tamamlandi" : "Done"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {sharedStudyClasses.length > 0 ? (
                <div className="db-hw-block">
                  <strong className="db-block-label">{tr ? "Ogretmen listeleri" : "Teacher lists"}</strong>
                  <div className="dashboard-shared-list">
                    {sharedStudyClasses.slice(0, 2).map((entry) => (
                      <div key={entry.classId} className="dashboard-shared-card">
                        <span>{entry.className} · {entry.teacherName}</span>
                        {entry.items.slice(0, 2).map((item) => (
                          <Link
                            key={item.id}
                            className="dashboard-shared-link"
                            href={{
                              pathname: "/app/practice",
                              query: {
                                promptId: item.promptId,
                                examType: item.examType,
                                taskType: item.taskType,
                                difficulty: item.difficulty
                              }
                            }}
                          >
                            <strong>{item.title}</strong>
                            <ArrowRight size={14} />
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {announcements.length > 0 ? (
                <div className="db-hw-block">
                  <strong className="db-block-label">{tr ? "Duyurular" : "Announcements"}</strong>
                  <div className="dashboard-announcement-list">
                    {announcements.slice(0, 3).map((item) => (
                      <article key={item.id} className="dashboard-announcement-card">
                        <strong>{item.title}</strong>
                        <p>{item.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* UPGRADE */}
          {shouldUpsellPlus ? (
            <section className="card db-upgrade-card">
              <span className="eyebrow">{tr ? "Upgrade" : "Upgrade"}</span>
              <strong>{upsellHeadline}</strong>
              <p>{upsellBody}</p>
              <div className="card" style={{ padding: "0.85rem 1rem", background: "rgba(255,255,255,0.72)" }}>
                <strong style={{ display: "block", marginBottom: "0.35rem" }}>{upsellRecommendation}</strong>
                <span style={{ color: "var(--muted)", lineHeight: 1.6 }}>
                  {tr
                    ? `Plus: 35 dk/gun, 18 session ve tam feedback. Ilk checkout'ta ${couponCatalog.LAUNCH20.code} aktif.`
                    : `Plus includes 35 min/day, 18 sessions, and full feedback. ${couponCatalog.LAUNCH20.code} is active on the first checkout.`}
                </span>
              </div>
              <div className="dashboard-inline-actions">
                <TrackedLink
                  className="button button-primary"
                  href={buildPlanCheckoutPath({ billing: recommendedUpsellBilling, coupon: couponCatalog.LAUNCH20.code, campaign: `dashboard_${recommendedUpsellBilling}` })}
                  userId={currentUser?.id}
                  analyticsEvent="checkout_initiated"
                  analyticsPath={`/app/dashboard/upgrade/${recommendedUpsellBilling}`}
                >
                  {tr
                    ? recommendedUpsellBilling === "annual"
                      ? "Onerilen: Plus yillik"
                      : "Onerilen: Plus haftalik"
                    : recommendedUpsellBilling === "annual"
                      ? "Recommended: Plus annual"
                      : "Recommended: Plus weekly"}
                </TrackedLink>
                <TrackedLink
                  className="button button-secondary"
                  href={buildPlanCheckoutPath({
                    billing: recommendedUpsellBilling === "annual" ? "weekly" : "annual",
                    coupon: couponCatalog.LAUNCH20.code,
                    campaign: recommendedUpsellBilling === "annual" ? "dashboard_weekly" : "dashboard_annual"
                  })}
                  userId={currentUser?.id}
                  analyticsEvent="checkout_initiated"
                  analyticsPath={recommendedUpsellBilling === "annual" ? "/app/dashboard/upgrade/weekly" : "/app/dashboard/upgrade/annual"}
                >
                  {tr
                    ? recommendedUpsellBilling === "annual"
                      ? "Daha hafif baslangic: haftalik"
                      : "Daha iyi deger: yillik"
                    : recommendedUpsellBilling === "annual"
                      ? "Lower-friction start: weekly"
                      : "Better long-term value: annual"}
                </TrackedLink>
                <Link className="button button-secondary" href="/pricing">
                  {tr ? "Planlar" : "Plans"}
                </Link>
              </div>
            </section>
          ) : null}

        </div>
      </div>
    </div>
  );
}

function TargetCard({
  examType,
  targetScore,
  onChange,
  tr
}: {
  examType: "IELTS" | "TOEFL";
  targetScore: string;
  onChange: (value: string) => void;
  tr: boolean;
}) {
  const options = examType === "IELTS" ? ["6.0", "6.5", "7.0", "7.5", "8.0"] : ["2.5", "3.0", "3.5", "4.0"];
  return (
    <div className="card" style={{ padding: "1.2rem", background: "var(--surface-strong)", display: "grid", gap: "0.65rem" }}>
      <div style={{ color: "var(--muted)" }}>{tr ? "Hedef skor" : "Target score"}</div>
      <div style={{ fontSize: "2rem", fontWeight: 800 }}>{targetScore || (tr ? "Secilmedi" : "Optional")}</div>
      <select className="practice-select" value={targetScore} onChange={(e) => onChange(e.target.value)}>
        <option value="">{tr ? "Hedef secme" : "No target"}</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <div style={{ color: "var(--muted)", lineHeight: 1.55 }}>
        {tr
          ? "Istersen hedef band belirle; dashboard ortalaman ile farki hesaplayip daha net bir yol plani cikarsin."
          : "Set an optional target so the dashboard can map your average against a clearer improvement plan."}
      </div>
    </div>
  );
}

function SessionRow({ session, tr }: { session: SpeakingSession; tr: boolean }) {
  const date = new Date(session.createdAt).toLocaleDateString(tr ? "tr-TR" : "en-US", {
    month: "short",
    day: "numeric"
  });
  return (
    <Link href={`/app/results/${session.id}`} className="db-session-row">
      <span className="db-session-date">{date}</span>
      <strong className="db-session-title">{session.prompt.title}</strong>
      <span className="pill" style={{ fontSize: "0.78rem" }}>
        {session.examType} · {session.taskType}
      </span>
      <strong className={`db-session-score${session.report ? "" : " is-empty"}`}>
        {session.report ? session.report.overall : "—"}
      </strong>
    </Link>
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

function getLevelNumeric(estimatedLevel: string, examType: "IELTS" | "TOEFL"): number | null {
  const map: Record<string, { ielts: number; toefl: number }> = {
    "A2":  { ielts: 4.0, toefl: 1.5 },
    "B1":  { ielts: 5.0, toefl: 2.0 },
    "B2":  { ielts: 6.0, toefl: 2.5 },
    "C1":  { ielts: 7.0, toefl: 3.0 },
    "C1+": { ielts: 8.0, toefl: 3.5 }
  };
  const entry = map[estimatedLevel];
  if (!entry) return null;
  return examType === "IELTS" ? entry.ielts : entry.toefl;
}

function buildPersonalizedMessage(profile: StudentProfile, tr: boolean): string {
  const backgroundMap: Record<string, { tr: string; en: string }> = {
    abroad:  { tr: "Yurtdışı deneyimin harika bir temel sağlıyor.", en: "Your time abroad gives you a strong foundation." },
    work:    { tr: "Günlük profesyonel İngilizce kullanımın büyük avantaj.", en: "Your daily professional English use is a big advantage." },
    school:  { tr: "Okul İngilizcen sağlam bir altyapı oluşturmuş.", en: "Your school English has built a solid base." },
    self:    { tr: "Kendi kendine öğrenme disiplinin bu yolculukta çok işe yarayacak.", en: "Your self-taught discipline will serve you well on this journey." },
    mixed:   { tr: "Farklı kaynaklardan gelen karma deneyimin çok değerli.", en: "Your diverse learning background is a real asset." }
  };
  const challengeMap: Record<string, { tr: string; en: string }> = {
    vocabulary:    { tr: "Kelime bulmakta zorlandığını biliyoruz — ilk egzersizler kelime zenginliğine odaklanacak.", en: "We know vocabulary is your sticking point — your first exercises will target word range." },
    anxiety:       { tr: "Heyecanı yenmek için kolay, tanıdık konulardan başlayacağız ve güveni adım adım inşa edeceğiz.", en: "To beat the nerves, we'll start with easy familiar topics and build your confidence step by step." },
    grammar:       { tr: "Gramer hataları üzerine yapı odaklı pratikler ve hedefli geri bildirimler sunacağız.", en: "We'll give you structure-focused drills and targeted grammar feedback to eliminate recurring errors." },
    pronunciation: { tr: "Telaffuz için her denemede netlik ve vurgu üzerine özel geri bildirim alacaksın.", en: "For pronunciation, you'll get dedicated clarity and stress feedback on every attempt." },
    fluency:       { tr: "Duraklamaları azaltmak için zamanlı pratikler ve akıcılık egzersizleri sunacağız.", en: "We'll give you timed drills and fluency exercises to reduce pauses and hesitations." },
    structure:     { tr: "Cevap çerçeveleme tekniklerini öğreneceğiz — her cevap net bir ana fikir, neden ve örnekle.", en: "We'll teach you answer-framing techniques — every response with a clear main idea, reason, and example." }
  };
  const bgEntry = backgroundMap[profile.englishBackground ?? ""] ?? null;
  const chEntry = challengeMap[profile.biggestChallenge ?? ""] ?? null;

  if (bgEntry && chEntry) {
    return tr
      ? `${bgEntry.tr} ${chEntry.tr}`
      : `${bgEntry.en} ${chEntry.en}`;
  }
  if (bgEntry) return tr ? bgEntry.tr : bgEntry.en;
  if (chEntry) return tr ? chEntry.tr : chEntry.en;
  return tr
    ? "Dashboard önerilerin profiline göre kişiselleştirildi."
    : "Your dashboard recommendations have been personalized based on your profile.";
}

function buildFirstTaskRecommendation(biggestChallenge: string, examType: "IELTS" | "TOEFL", tr: boolean): string {
  const taskMap: Record<string, { tr: string; en: string }> = {
    anxiety:    {
      tr: `${examType === "IELTS" ? "IELTS Part 1" : "TOEFL Task 1"} — Kişisel konular (hobiler, rutinler). Kolay, tanıdık, baskı az. Güven inşa etmek için mükemmel başlangıç.`,
      en: `${examType === "IELTS" ? "IELTS Part 1" : "TOEFL Task 1"} — Personal topics (hobbies, routines). Easy, familiar, low pressure. Perfect starting point to build confidence.`
    },
    vocabulary: {
      tr: `${examType === "IELTS" ? "IELTS Part 2 (Cue Card)" : "TOEFL Independent Task"} — Zengin kelime gerektiren tanımlama soruları. Vocabulary range'i genişletmek için ideal.`,
      en: `${examType === "IELTS" ? "IELTS Part 2 (Cue Card)" : "TOEFL Independent Task"} — Descriptive questions that demand rich vocabulary. Ideal for expanding your word range.`
    },
    grammar:    {
      tr: `${examType === "IELTS" ? "IELTS Part 1" : "TOEFL Task 1"} — Kısa, kontrollü cevaplar. Yapıyı dikkatli kurman için ideal format.`,
      en: `${examType === "IELTS" ? "IELTS Part 1" : "TOEFL Task 1"} — Short, controlled responses. Ideal format for building careful, accurate sentence structures.`
    },
    pronunciation: {
      tr: `${examType === "IELTS" ? "IELTS Part 1" : "TOEFL Task 1"} — Kısa cevaplarda netlik ve vurgu pratiği yap. Telaffuz için en iyi başlangıç formatı.`,
      en: `${examType === "IELTS" ? "IELTS Part 1" : "TOEFL Task 1"} — Practice clarity and stress on short answers. Best starting format for pronunciation work.`
    },
    fluency:    {
      tr: `${examType === "IELTS" ? "IELTS Part 2 (Cue Card)" : "TOEFL Independent Task"} — 1-2 dakika kesintisiz konuşma pratiği. Akıcılığı zorlamak için en etkili format.`,
      en: `${examType === "IELTS" ? "IELTS Part 2 (Cue Card)" : "TOEFL Independent Task"} — 1-2 minutes of uninterrupted speaking. The most effective format for pushing fluency.`
    },
    structure:  {
      tr: `${examType === "IELTS" ? "IELTS Part 2 (Cue Card)" : "TOEFL Independent Task"} — Cevap iskeletini (ana fikir → neden → örnek) pratiğe dökmek için ideal.`,
      en: `${examType === "IELTS" ? "IELTS Part 2 (Cue Card)" : "TOEFL Independent Task"} — Ideal for practising the answer framework (main idea → reason → example).`
    }
  };
  const entry = taskMap[biggestChallenge] ?? null;
  if (!entry) return tr ? "Pratik bölümünden bir görev seç ve başla." : "Pick a task from the practice section and start.";
  return tr ? entry.tr : entry.en;
}

function buildRecentStreakCalendar(sessions: SpeakingSession[]) {
  const activeDays = new Set(
    sessions
      .filter((session) => session.audioUploaded)
      .map((session) => getUtcPracticeDayKey(session.createdAt))
      .filter((key): key is string => Boolean(key))
  );
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      active: activeDays.has(key)
    };
  });
}

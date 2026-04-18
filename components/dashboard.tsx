"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InstitutionAdminPanel } from "@/components/institution-admin-panel";
import { useAppState } from "@/components/providers";
import { TeacherHub } from "@/components/teacher-hub";
import { trackClientEvent } from "@/lib/analytics-client";
import { AnalyticsSummary } from "@/lib/analytics-store";
import { buildPlanCheckoutPath, couponCatalog } from "@/lib/commerce";
import { dashboardRecommendations } from "@/lib/growth-pack";
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

export function Dashboard() {
  const { signedIn, currentUser, language, signOut } = useAppState();
  const tr = language === "tr";
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [targetScore, setTargetScore] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    totalEvents: 0,
    pageViews: 0,
    practiceStarts: 0,
    uploads: 0,
    simulationsCompleted: 0,
    mockReportViews: 0
  });
  const [weeklyChecklist, setWeeklyChecklist] = useState<Record<string, boolean>>({});
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

  const isSchoolMember = Boolean(signedIn && currentUser?.memberType === "school");
  const isTeacherMember = Boolean(signedIn && currentUser?.memberType === "teacher");

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    fetch(`/api/progress/summary?userId=${encodeURIComponent(currentUser.id)}`)
      .then((response) => response.json())
      .then((data: ProgressSummary) => setSummary(data))
      .catch(() => setSummary(emptySummary));
  }, [currentUser]);

  useEffect(() => {
    if (!signedIn || !currentUser || isTeacherMember || isSchoolMember) {
      setJoinedClasses([]);
      return;
    }

    fetch("/api/classes/join")
      .then((response) => response.json())
      .then((data: { classes?: StudentClassMembership[] }) => setJoinedClasses(data.classes ?? []))
      .catch(() => setJoinedClasses([]));
  }, [currentUser, isSchoolMember, isTeacherMember, signedIn]);

  useEffect(() => {
    if (!signedIn || !currentUser || isTeacherMember || isSchoolMember) {
      setHomework([]);
      return;
    }
    fetch("/api/homework")
      .then((response) => response.json())
      .then((data: { assignments?: HomeworkAssignment[] }) => setHomework(data.assignments ?? []))
      .catch(() => setHomework([]));
  }, [currentUser, isSchoolMember, isTeacherMember, signedIn]);

  useEffect(() => {
    if (!signedIn || !currentUser || isTeacherMember || isSchoolMember) {
      setSharedStudyClasses([]);
      return;
    }
    fetch("/api/classes/shared-study")
      .then((response) => response.json())
      .then((data: { classes?: Array<{ classId: string; className: string; teacherName: string; items: SharedClassStudyItem[] }> }) =>
        setSharedStudyClasses(data.classes ?? [])
      )
      .catch(() => setSharedStudyClasses([]));
  }, [currentUser, isSchoolMember, isTeacherMember, signedIn]);

  useEffect(() => {
    if (!currentUser) {
      setAnalytics({
        totalEvents: 0,
        pageViews: 0,
        practiceStarts: 0,
        uploads: 0,
        simulationsCompleted: 0,
        mockReportViews: 0
      });
      return;
    }

    fetch(`/api/analytics/summary?userId=${encodeURIComponent(currentUser.id)}`)
      .then((response) => response.json())
      .then((data: AnalyticsSummary) => setAnalytics(data))
      .catch(() =>
        setAnalytics({
          totalEvents: 0,
          pageViews: 0,
          practiceStarts: 0,
          uploads: 0,
          simulationsCompleted: 0,
          mockReportViews: 0
        })
      );
  }, [currentUser]);

  useEffect(() => {
    if (!signedIn || !currentUser) {
      setAnnouncements([]);
      setProfile(null);
      return;
    }

    fetch("/api/announcements")
      .then((response) => response.json())
      .then((data: { announcements?: AnnouncementItem[] }) => setAnnouncements(data.announcements ?? []))
      .catch(() => setAnnouncements([]));

    fetch("/api/profile")
      .then((response) => response.json())
      .then((data: { profile?: StudentProfile }) => setProfile(data.profile ?? null))
      .catch(() => setProfile(null));
  }, [currentUser, signedIn]);

  const scoredSessions = useMemo(
    () => summary.recentSessions.filter((session) => session.report),
    [summary.recentSessions]
  );

  const latestExamType = scoredSessions[0]?.examType ?? "IELTS";
  const storageKey = currentUser ? `speakace-target-${currentUser.id}` : "speakace-target-guest";
  const checklistStorageKey = currentUser ? `speakace-weekly-checklist-${currentUser.id}-${getIsoWeekKey(new Date())}` : `speakace-weekly-checklist-guest-${getIsoWeekKey(new Date())}`;

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(storageKey) : null;
    if (stored !== null) {
      setTargetScore(stored);
      return;
    }

    if (profile?.targetScore != null) {
      const profileValue = String(profile.targetScore);
      setTargetScore(profileValue);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(storageKey, profileValue);
      }
      return;
    }

    setTargetScore("");
  }, [profile?.targetScore, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(checklistStorageKey);
    if (!stored) {
      setWeeklyChecklist({});
      return;
    }

    try {
      setWeeklyChecklist(JSON.parse(stored) as Record<string, boolean>);
    } catch {
      setWeeklyChecklist({});
    }
  }, [checklistStorageKey]);

  const handleTargetScoreChange = (value: string) => {
    setTargetScore(value);
    if (typeof window !== "undefined") {
      if (value) {
        window.localStorage.setItem(storageKey, value);
      } else {
        window.localStorage.removeItem(storageKey);
      }
    }
    setProfile((current) =>
      current
        ? {
            ...current,
            targetScore: value ? Number(value) : null
          }
        : current
    );
    if (currentUser?.id) {
      void trackClientEvent({ userId: currentUser.id, event: "target_score_updated", path: "/app" });
    }
    if (currentUser?.id && profile) {
      void fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          targetScore: value ? Number(value) : null
        })
      }).catch(() => undefined);
    }
  };

  const bestScore = useMemo(() => {
    if (!scoredSessions.length) return null;
    return Math.max(...scoredSessions.map((session) => session.report?.overall ?? 0));
  }, [scoredSessions]);

  const skillProfile = useMemo(() => {
    const buckets = new Map<string, { total: number; count: number }>();

    scoredSessions.forEach((session) => {
      session.report?.categories.forEach((category) => {
        const current = buckets.get(category.label) ?? { total: 0, count: 0 };
        buckets.set(category.label, {
          total: current.total + category.score,
          count: current.count + 1
        });
      });
    });

    const averaged = [...buckets.entries()].map(([label, stats]) => ({
      label,
      score: Number((stats.total / stats.count).toFixed(1))
    }));

    if (!averaged.length) {
      return {
        weakestSkill: null as null | { label: string; score: number },
        balanced: false,
        spread: 0
      };
    }

    const sorted = averaged.sort((a, b) => a.score - b.score);
    const spread = Number((sorted.at(-1)!.score - sorted[0].score).toFixed(1));
    const bottom = sorted[0];
    const balanced = spread <= 0.4 || sorted.every((item) => item.score >= 6.5);

    return {
      weakestSkill: balanced ? null : bottom,
      balanced,
      spread
    };
  }, [scoredSessions]);

  const weakestSkill = skillProfile.weakestSkill;
  const hasBalancedSkillProfile = skillProfile.balanced;

  const recentTrend = useMemo(() => scoredSessions.slice(0, 7).reverse(), [scoredSessions]);
  const numericTarget = Number(targetScore || 0);
  const scoreGap = numericTarget && summary.averageScore ? Number((numericTarget - summary.averageScore).toFixed(1)) : null;
  const targetLabel = latestExamType === "IELTS" ? (tr ? "hedef band" : "target band") : tr ? "hedef skor" : "target score";

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
    if (!summary.averageScore) {
      return tr
        ? "Henuz yeterli speaking denemesi yok. Once 3-4 farkli task coz, sonra sistem ortalamana gore daha isabetli bir yol plani cikarir."
        : "You do not have enough scored attempts yet. Complete 3-4 different tasks first, then the roadmap becomes much more reliable.";
    }

    if (!numericTarget) {
      return tr
        ? "Istege bagli bir hedef band belirledikten sonra sistem ortalama skorun ile hedef arasindaki farka gore daha net bir yol cizecek. Simdilik odak, dogal ve tamamlanmis cevaplar vermek olmali."
        : "Once you set an optional target score, the dashboard will map your current average against that goal more clearly. For now, focus on natural and complete responses.";
    }

    if ((scoreGap ?? 0) <= 0) {
      return tr
        ? `Ortalaman su an ${targetLabel} seviyene cok yakin ya da ustunde. Bundan sonraki asama puani korurken istikrarli kaliteyi surdurmek: daha net acilis, daha temiz baglanti ve daha dogal bir ritim.`
        : `Your average is already close to or above your ${targetLabel}. The next phase is consistency: cleaner openings, smoother linking, and a more natural rhythm.`;
    }

    if ((scoreGap ?? 0) >= (latestExamType === "IELTS" ? 1.2 : 0.8)) {
      return tr
        ? `Hedefin ile ortalaman arasinda belirgin bir fark var. En hizli ilerleme icin once cevap iskeletini sabitle, sonra her cevapta reason + example kullan, en son zayif skill'ini ayri drill ile guclendir.`
        : `There is still a meaningful gap between your average and your target. The fastest path is to stabilize your answer structure first, then add a clear reason and example, and finally train your weakest skill separately.`;
    }

    return tr
      ? `Hedefine yaklasiyorsun. Bu seviyede skoru yukari tasiyan sey daha olgun ornekler, daha dogal baglanti kelimeleri ve gereksiz tekrarlarin azalmasidir.`
      : `You are getting close to your target. At this level, stronger examples, more natural linking, and fewer repeated phrases will move the score higher.`;
  }, [latestExamType, numericTarget, scoreGap, summary.averageScore, targetLabel, tr]);

  const strategyTips = useMemo(() => {
    if (latestExamType === "IELTS") {
      return tr
        ? [
            "Hazir kalip cumleleri ezberleyip her soruya yapistirma; examiner bunu hizli fark eder ve cevap dogalligini dusurur.",
            "Part 1'de direkt cevap + 1 neden, Part 2'de giris-gelisme-kapanis, Part 3'te opinion + reason + example kullan.",
            "Dogal baglanti kelimeleri kullan; ama yapay, asiri resmi ve ezber hissi veren kaliplar kullanma.",
            "Ayni soruyu ikinci kez cozup improved answer ile kendi transcript'ini karsilastirman en hizli ilerleme yollarindan biridir."
          ]
        : [
            "Do not glue memorized template sentences onto every answer; examiners notice that quickly and it hurts naturalness.",
            "Use direct answer + 1 reason in Part 1, opening-middle-close in Part 2, and opinion + reason + example in Part 3.",
            "Use natural linking phrases, but avoid sounding scripted or overly formal.",
            "Repeating the same question once more and comparing your transcript with the improved answer is one of the fastest ways to improve."
          ];
    }

    return tr
      ? [
          "TOEFL integrated task'lerde kendi fikrini eklemen gerekmiyorsa source'u temiz ozetle; gereksiz ekstra yorum ekleme.",
          "Notlarini ana konu + speaker/example mantigiyla tut ki cevap verirken dagilma.",
          "Kisa yapisal kalip sozler kullanabilirsin; ama cevabin ana icerigi her zaman task'e ozel olmali.",
          "Ayni task'i tekrar cozup improved answer ile karsilastirmak source tasima becerini hizla guclendirir."
        ]
      : [
          "In TOEFL integrated tasks, summarize the source material cleanly instead of adding extra opinion when it is not needed.",
          "Take notes as main point + speaker/example so your response stays organized.",
          "Short structural phrases are fine, but the core content should always stay task-specific.",
          "Repeating the same task and comparing it with the improved answer quickly improves source-transfer skill."
        ];
  }, [latestExamType, tr]);

  const weeklyPlan = useMemo(() => {
    const weakLabel = hasBalancedSkillProfile
      ? tr ? "daha olgun cevap kalitesi" : "overall answer maturity"
      : weakestSkill ? (tr ? translateCategoryLabel(weakestSkill.label) : weakestSkill.label) : tr ? "temel yapi" : "basic structure";

    if (!summary.totalSessions) {
      return tr
        ? [
            "Bugun 2 farkli speaking task coz ve net, tamamlanmis cevap vermeye odaklan.",
            "Result ekraninda improved answer ile kendi transcript'ini karsilastir.",
            "Henuz hiz degil, anlasilirlik ve yapiyi onceliklendir."
          ]
        : [
            "Complete 2 different speaking tasks today and focus on giving complete answers.",
            "Compare your transcript with the improved answer on the result screen.",
            "Do not chase speed yet; prioritize clarity and structure first."
          ];
    }

    if ((scoreGap ?? 0) > 0.8 || !numericTarget) {
      return tr
        ? [
            "Her practice gununde bir yeni soru ve bir tekrar soru coz.",
            `Ikinci denemede ozellikle ${weakLabel} tarafina odaklan.`,
            "Her cevapta en az bir neden ve bir ornek kullanmadan bitirme."
          ]
        : [
            "On each practice day, do one new prompt and one repeat prompt.",
            `Use the second attempt to focus specifically on ${weakLabel}.`,
            "Do not finish an answer without at least one reason and one example."
          ];
    }

    return tr
      ? [
          "Bu hafta kaliteyi yukari cekmek icin daha dogal acilislar ve daha olgun ornekler kullan.",
          `Her gun kisa bir ${weakLabel} drill'i ekle.`,
          "Ezber kalip yerine esnek, kisa ve dogal baglanti ifadeleri tercih et."
        ]
      : [
          "This week, focus on more natural openings and more mature examples to lift quality.",
          `Add a short daily ${weakLabel} drill.`,
          "Prefer flexible and natural linking phrases over memorized template blocks."
        ];
  }, [hasBalancedSkillProfile, numericTarget, scoreGap, summary.totalSessions, tr, weakestSkill]);

  const dailyMission = useMemo(() => {
    const focusLabel = hasBalancedSkillProfile
      ? tr ? "cevap kalitesi" : "answer quality"
      : weakestSkill ? (tr ? translateCategoryLabel(weakestSkill.label) : weakestSkill.label) : tr ? "temel speaking yapisi" : "basic speaking structure";
    const basePrompt = latestExamType === "IELTS"
      ? tr
        ? "Bir IELTS gorevi sec ve cevabini reason + example ile tamamla."
        : "Choose one IELTS task and complete your answer with a clear reason and example."
      : tr
        ? "Bir TOEFL task sec ve cevabini source point + net summary mantigiyla kur."
        : "Choose one TOEFL task and organize your response around source point plus a clear summary.";

    return {
      title: tr ? "Bugunun mini gorevi" : "Today's mini mission",
      primary: basePrompt,
      secondary: tr
        ? `${focusLabel} tarafinda kisa bir tekrar yap ve improved answer ile kendi cevabini karsilastir.`
        : `Add a short ${focusLabel} drill and compare your response with the improved answer.`
    };
  }, [hasBalancedSkillProfile, latestExamType, tr, weakestSkill]);

  const weeklyChecklistItems = useMemo(
    () =>
      weeklyPlan.slice(0, 3).map((step, index) => ({
        id: `weekly-${index + 1}`,
        text: step,
        done: Boolean(weeklyChecklist[`weekly-${index + 1}`])
      })),
    [weeklyChecklist, weeklyPlan]
  );

  const completedChecklistCount = weeklyChecklistItems.filter((item) => item.done).length;
  const streakCalendar = useMemo(() => buildRecentStreakCalendar(summary.recentSessions), [summary.recentSessions]);

  const targetGapNote = useMemo(() => {
    if (!numericTarget) {
      return tr ? "Istege bagli hedef secilmedi" : "No optional target selected";
    }
    if (!summary.averageScore) {
      return tr ? "Yeterli skor olusunca fark burada gorunecek" : "The gap will appear here once you have enough scored attempts";
    }
    if ((scoreGap ?? 0) <= 0) {
      return tr ? "Hedef band / skor seviyesine ulasildi" : "You are already at or above your target";
    }
    return tr ? `${scoreGap} puanlik fark kapatilacak` : `${scoreGap} points left to close the gap`;
  }, [numericTarget, scoreGap, summary.averageScore, tr]);

  const overdueHomeworkCount = useMemo(
    () => homework.filter((item) => !item.completedAt && item.dueAt && new Date(item.dueAt).getTime() < Date.now()).length,
    [homework]
  );
  const dueSoonHomeworkCount = useMemo(
    () =>
      homework.filter((item) => {
        if (item.completedAt || !item.dueAt) return false;
        const time = new Date(item.dueAt).getTime();
        const now = Date.now();
        return time >= now && time <= now + 1000 * 60 * 60 * 24 * 2;
      }).length,
    [homework]
  );
  const needsOnboarding = Boolean(signedIn && currentUser && !isTeacherMember && !isSchoolMember && profile && !profile.onboardingComplete);
  const shouldUpsellPlus = Boolean(signedIn && currentUser && !isTeacherMember && !isSchoolMember && currentUser.plan === "free");

  const toggleChecklistItem = (id: string) => {
    setWeeklyChecklist((current) => {
      const next = { ...current, [id]: !current[id] };
      if (typeof window !== "undefined") {
        window.localStorage.setItem(checklistStorageKey, JSON.stringify(next));
      }
      return next;
    });
  };

  const joinClass = async () => {
    setJoinError("");
    setJoinNotice("");
    const response = await fetch("/api/classes/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joinCode })
    });
    const data = (await response.json()) as { error?: string; classroom?: { name: string; joinMessage?: string | null }; status?: "pending" | "approved" };
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

  const mistakeNotebook = useMemo(() => {
    const improvementCounts = new Map<string, number>();
    const fillerCounts = new Map<string, number>();

    scoredSessions.forEach((session) => {
      session.report?.improvements.forEach((item) => {
        improvementCounts.set(item, (improvementCounts.get(item) ?? 0) + 1);
      });
      session.report?.fillerWords.forEach((item) => {
        const normalized = item.trim();
        if (!normalized) return;
        fillerCounts.set(normalized, (fillerCounts.get(normalized) ?? 0) + 1);
      });
    });

    const repeatedImprovements = [...improvementCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([text, count]) => ({ text, count }));

    const repeatedFillers = [...fillerCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([text, count]) => ({ text, count }));

    return {
      repeatedImprovements,
      repeatedFillers,
      weakSkillLabel: hasBalancedSkillProfile
        ? tr ? "dengeli profil" : "balanced profile"
        : weakestSkill ? (tr ? translateCategoryLabel(weakestSkill.label) : weakestSkill.label) : null
    };
  }, [hasBalancedSkillProfile, scoredSessions, tr, weakestSkill]);

  const troubleWords = useMemo(() => {
    const buckets = new Map<string, number>();
    const source = [...mistakeNotebook.repeatedFillers];

    scoredSessions.forEach((session) => {
      const transcript = session.rawTranscript || session.transcript || "";
      transcript
        .split(/\s+/)
        .map((item) => item.toLowerCase().replace(/[^a-z']/g, ""))
        .filter((item) => item.length >= 5)
        .forEach((item) => buckets.set(item, (buckets.get(item) ?? 0) + 1));
    });

    source.forEach((item) => buckets.set(item.text.toLowerCase(), (buckets.get(item.text.toLowerCase()) ?? 0) + item.count));

    return [...buckets.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([word, count]) => ({ word, count }));
  }, [mistakeNotebook.repeatedFillers, scoredSessions]);

  const momentumProfile = useMemo(() => {
    const consistency = Math.min(100, summary.streakDays * 12 + Math.min(summary.totalSessions, 8) * 4);
    const control = Math.min(100, Math.round((summary.averageScore || 0) * 12));
    const courage = Math.min(100, Math.min(summary.totalSessions, 12) * 7 + analytics.practiceStarts * 2);
    const refinement = Math.min(100, analytics.mockReportViews * 12 + analytics.uploads * 8);

    const strongest = [
      { label: tr ? "istikrar" : "consistency", value: consistency },
      { label: tr ? "kontrol" : "control", value: control },
      { label: tr ? "cesaret" : "courage", value: courage },
      { label: tr ? "ince ayar" : "refinement", value: refinement }
    ].sort((a, b) => b.value - a.value)[0];

    return {
      consistency,
      control,
      courage,
      refinement,
      strongest
    };
  }, [analytics.mockReportViews, analytics.practiceStarts, analytics.uploads, summary.averageScore, summary.streakDays, summary.totalSessions, tr]);

  const coachSignature = useMemo(() => {
    if (hasBalancedSkillProfile && momentumProfile.consistency >= 55) {
      return {
        title: tr ? "Sabit yukselen profil" : "Steady rising profile",
        body: tr
          ? "Tek bir skill seni asagi cekmiyor. Bundan sonraki farki daha olgun ornekler ve baski altinda temiz kalmak yaratacak."
          : "No single skill is dragging you down. The next jump will come from more mature examples and cleaner control under pressure."
      };
    }

    if ((weakestSkill?.label === "Fluency and Coherence" || weakestSkill?.label === "Delivery") && momentumProfile.courage >= 45) {
      return {
        title: tr ? "Enerji var, sekil verilmeli" : "Strong energy, needs shaping",
        body: tr
          ? "Deneme cesaretin iyi. Simdi cevaplarini daha temiz baglayip ritmini kontrol etmek seni hizla yukari tasir."
          : "You already show practice courage. Cleaner linking and better pacing will move you upward quickly."
      };
    }

    if (weakestSkill?.label === "Topic Development") {
      return {
        title: tr ? "Fikir var, derinlik eksik" : "Ideas exist, depth is missing",
        body: tr
          ? "Bir ana fikir veriyorsun ama cevabi buyutmuyorsun. Bir neden ve bir gercek hayat detayi bu profilde en hizli farki yaratir."
          : "You usually have a main point, but the answer does not fully open up. One reason and one lived-in detail will change this profile fastest."
      };
    }

    return {
      title: tr ? "Temel duzen kuruluyor" : "The base is forming",
      body: tr
        ? "Sistem seni taniyor. Birkac tutarli deneme daha geldikce hangi calisma stilinin sana en iyi gittigi cok daha netlesecek."
        : "The system is still learning your pattern. A few more consistent attempts will make your best study style much clearer."
    };
  }, [hasBalancedSkillProfile, momentumProfile.consistency, momentumProfile.courage, tr, weakestSkill]);

  if (isSchoolMember) {
    return <InstitutionAdminPanel />;
  }

  if (isTeacherMember) {
    return <TeacherHub />;
  }

  return (
    <div className="page-shell section dashboard-page" style={{ display: "grid", gap: "1.4rem" }}>
      {needsOnboarding ? (
        <section className="card" style={{ padding: "1.1rem", display: "grid", gap: "0.75rem", background: "rgba(29, 111, 117, 0.08)" }}>
          <strong>{tr ? "Ilk kurulum eksik" : "Onboarding incomplete"}</strong>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            {tr ? "Hedef skorunu ve calisma profilini netlestirirsen dashboard ve practice onerileri daha dogru hale gelir." : "Finish your target score and study profile to unlock more accurate dashboard and practice guidance."}
          </p>
          <Link className="button button-primary" href="/app/onboarding">
            {tr ? "Onboardingi tamamla" : "Complete onboarding"}
          </Link>
        </section>
      ) : null}

      <section
        className="card dashboard-overview-grid"
        style={{
          padding: "1.6rem",
          display: "grid",
          gap: "1.2rem",
          gridTemplateColumns: "minmax(280px, 1.3fr) repeat(3, minmax(180px, 1fr))"
        }}
      >
        <div>
          <span className="eyebrow">{tr ? "Panel" : "Dashboard"}</span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.4rem)", marginBottom: "0.8rem" }}>{tr ? "Speaking ilerleme panelin" : "Your speaking progress board"}</h1>
          <p style={{ color: "var(--muted)", lineHeight: 1.65 }}>
            {tr
              ? "Burasi artik sadece skor aldigin bir alan degil. Hangi skill'in geride kaldigini, en iyi sonucunu, hedefini ve sonraki calisma odagini buradan gorebilirsin."
              : "This is no longer just a score screen. You can now track your weakest skill, best result, target, and smartest next study focus from one place."}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <Link className="button button-primary" href="/app/practice">
              {tr ? "Pratige basla" : "Start practice"}
            </Link>
            {currentUser?.isTeacher ? (
              <Link className="button button-secondary" href="/app/teacher">
                {tr ? "Ogretmen paneli" : "Teacher panel"}
              </Link>
            ) : (
              <Link className="button button-secondary" href="/app/profile">
                {tr ? "Profilim" : "My profile"}
              </Link>
            )}
            <Link className="button button-secondary" href="/app/billing">
              {tr ? "Planini gor" : "View plan"}
            </Link>
          </div>
        </div>

        <StatCard label={tr ? "Toplam deneme" : "Total attempts"} value={String(summary.totalSessions)} note={tr ? "Tum speaking sessionlarin" : "All speaking sessions so far"} />
        <StatCard label="Best score" value={bestScore === null ? "-" : String(bestScore)} note={tr ? "Son denemelerdeki en iyi sonucun" : "Your best result across recent attempts"} />
        <TargetCard examType={latestExamType} targetScore={targetScore} onChange={handleTargetScoreChange} tr={tr} />
      </section>

      <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "minmax(320px, 1.2fr) minmax(260px, 0.8fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Hızlı aksiyonlar" : "Quick actions"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Bugün ne yapmalısın?" : "What should you do today?"}</h2>
          </div>
          <div className="quick-action-grid">
            <Link className="card quick-action-card" href="/app/improve">
              <strong>{tr ? "Growth OS panelini aç" : "Open the growth OS"}</strong>
              <div className="practice-meta">{tr ? "Tüm gelişim sistemi tek ekranda" : "See the full improvement system in one place"}</div>
            </Link>
            <Link className="card quick-action-card" href="/app/placement">
              <strong>{tr ? "Placement sonucunu yenile" : "Refresh your placement"}</strong>
              <div className="practice-meta">{tr ? "Seviyeni ve ritmini güncelle" : "Update your level and study rhythm"}</div>
            </Link>
            <Link className="card quick-action-card" href="/app/plan">
              <strong>{tr ? "Kişisel planı aç" : "Open your study plan"}</strong>
              <div className="practice-meta">{tr ? "Band açığına göre günlük rota" : "Daily route based on your target gap"}</div>
            </Link>
            <Link className="card quick-action-card" href="/app/practice">
              <strong>{tr ? "Yeni practice başlat" : "Start a new practice"}</strong>
              <div className="practice-meta">{tr ? "Günün ana speaking denemesi" : "Open your main speaking attempt for today"}</div>
            </Link>
            <Link className="card quick-action-card" href="/app/mock-exam">
              <strong>{tr ? "Mock exam moduna gir" : "Enter mock exam mode"}</strong>
              <div className="practice-meta">{tr ? "Tam simülasyon ve mock rapor" : "Full simulation and mock reporting"}</div>
            </Link>
            <Link className="card quick-action-card" href="/app/review">
              <strong>{tr ? "Hataları gözden geçir" : "Review your mistakes"}</strong>
              <div className="practice-meta">{tr ? "Tekrar eden zayıf noktalarını gör" : "See repeated weak patterns and notes"}</div>
            </Link>
            <Link className="card quick-action-card" href="/app/study-lists">
              <strong>{tr ? "Çalışma listelerini aç" : "Open study lists"}</strong>
              <div className="practice-meta">{tr ? "Kaydettiğin sorularla tekrar çalış" : "Return to saved prompts and retry queue"}</div>
            </Link>
            <Link className="card quick-action-card" href="/app/referrals">
              <strong>{tr ? "Referral merkezini aç" : "Open referral center"}</strong>
              <div className="practice-meta">{tr ? "Kişisel davet linkin ve signup takibi" : "Your invite link and referral tracking"}</div>
            </Link>
            <Link className="card quick-action-card" href="/app/profile">
              <strong>{tr ? "Profil ve hedefler" : "Profile and goals"}</strong>
              <div className="practice-meta">{tr ? "Hedef skorunu ve çalışma profilini güncelle" : "Update your target score and study profile"}</div>
            </Link>
          </div>
        </div>

        {shouldUpsellPlus ? (
          <div className="card upgrade-card">
            <span className="eyebrow">{tr ? "Plus önerisi" : "Plus upgrade"}</span>
            <h2 style={{ fontSize: "1.9rem", margin: "0.7rem 0 0.4rem" }}>{tr ? "Daha fazla speaking hacmi aç" : "Unlock more speaking volume"}</h2>
            <p className="practice-copy">
              {tr
                ? "Free plan ile düzen kurmak kolay, ama daha hızlı gelişim için daha fazla günlük süre ve daha derin geri bildirim gerekir."
                : "Free is enough to build the habit, but faster score growth comes from more daily volume and deeper feedback."}
            </p>
            <ul className="compact-list" style={{ margin: 0 }}>
              <li>{tr ? "18 günlük oturum" : "18 daily sessions"}</li>
              <li>{tr ? "35 dakika günlük speaking" : "35 daily speaking minutes"}</li>
              <li>{tr ? "Daha güçlü transcript ve skor içgörüleri" : "Stronger transcript and score insight"}</li>
            </ul>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "dashboard_upgrade" })}>
              {tr ? "Plus'a geç" : "Upgrade to Plus"}
            </a>
            <div className="practice-meta">
              {tr ? `${couponCatalog.LAUNCH20.code} ile lansman indirimi aktif.` : `Launch discount available with ${couponCatalog.LAUNCH20.code}.`}
            </div>
            <Link className="button button-secondary" href="/pricing">
              {tr ? "Plan detaylarini ac" : "Open plan details"}
            </Link>
          </div>
        ) : (
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <span className="eyebrow">{tr ? "Hazırlık seviyesi" : "Readiness"}</span>
            <h2 style={{ fontSize: "1.9rem", margin: "0.7rem 0 0.4rem" }}>{tr ? "Bugünkü odak net" : "Today's focus is clear"}</h2>
            <p className="practice-copy">{nextStudyFocus}</p>
            <Link className="button button-secondary" href="/app/practice">
              {tr ? "Şimdi pratiğe dön" : "Go back to practice"}
            </Link>
          </div>
        )}
      </section>

      {shouldUpsellPlus ? (
        <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem" }}>
          {[
            {
              title: tr ? "Daha derin transcript düzeltmesi" : "Deeper transcript cleanup",
              body: tr
                ? "Free akışı fikri gösterir. Plus ise cevaptaki yapısal kırılmaları ve yeniden deneme fırsatını daha güçlü hissettirir."
                : "Free shows the workflow. Plus makes structure breaks, transcript cleanup, and retry opportunities much clearer."
            },
            {
              title: tr ? "Daha yüksek günlük hacim" : "Higher daily volume",
              body: tr
                ? "Skor artışı çoğu zaman tek denemeden değil, aynı gün içindeki ikinci ve üçüncü daha temiz denemeden gelir."
                : "Score growth rarely comes from one attempt alone. It usually comes from cleaner second and third tries in the same day."
            },
            {
              title: tr ? "Gerçek çalışma ritmi" : "A real study rhythm",
              body: tr
                ? "Daily mission, study list ve retry queue daha yüksek limitlerle birlikte gerçek bir çalışma sistemine dönüşür."
                : "Daily mission, study lists, and retry queues become a real study system when the daily cap is no longer tight."
            }
          ].map((item) => (
            <article key={item.title} className="card feature-card">
              <span className="pill">{tr ? "Plus'ta açılır" : "Unlocked in Plus"}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
        <StatCard label={tr ? "Ortalama tahmin" : "Average estimate"} value={summary.averageScore ? String(summary.averageScore) : tr ? "Skor yok" : "No score"} note={tr ? "Son denemelerin genel ortalamasi" : "Across your recent attempts"} />
        <StatCard
          label={tr ? "Skill odagi" : "Skill focus"}
          value={
            hasBalancedSkillProfile
              ? tr ? "Dengeli profil" : "Balanced profile"
              : weakestSkill ? (tr ? translateCategoryLabel(weakestSkill.label) : weakestSkill.label) : "-"
          }
          note={
            hasBalancedSkillProfile
              ? tr ? "Tek bir skill belirgin sekilde geride degil" : "No single category is clearly lagging behind"
              : tr ? "En cok calisman gereken alan" : "The area that needs the most work"
          }
        />
        <StatCard label="Streak" value={String(summary.streakDays)} note={tr ? "Arka arkaya calisma gunlerin" : "Your current streak in practice days"} />
        <StatCard label={tr ? "Hedef farki" : "Target gap"} value={numericTarget && scoreGap !== null ? (scoreGap <= 0 ? "0" : String(scoreGap)) : "-"} note={targetGapNote} />
      </section>

      <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
        <StatCard label={tr ? "Rapor inceleme" : "Result reviews"} value={String(analytics.mockReportViews)} note={tr ? "Result ve mock rapor ekranlari" : "How often you opened result and mock report views"} />
        <StatCard label={tr ? "Practice baslangici" : "Practice starts"} value={String(analytics.practiceStarts)} note={tr ? "Konusma denemesi baslatma sayin" : "How many times you started practice"} />
        <StatCard label={tr ? "Yuklenen kayit" : "Uploaded recordings"} value={String(analytics.uploads)} note={tr ? "Transcript icin giden ses kayitlari" : "Recordings sent for transcript"} />
        <StatCard label={tr ? "Tamamlanan simulasyon" : "Completed simulations"} value={String(analytics.simulationsCompleted)} note={tr ? "Bitirilen tam mock sinavlar" : "Full mock exams completed"} />
      </section>

      <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "minmax(320px, 1.15fr) minmax(320px, 0.85fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "1rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Momentum profili" : "Momentum profile"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Skorun kadar calisma karakterin de var" : "You have a study character, not just a score"}</h2>
          </div>
          <div className="dashboard-momentum-grid">
            {[
              { label: tr ? "Istikrar" : "Consistency", value: momentumProfile.consistency },
              { label: tr ? "Kontrol" : "Control", value: momentumProfile.control },
              { label: tr ? "Cesaret" : "Courage", value: momentumProfile.courage },
              { label: tr ? "Ince ayar" : "Refinement", value: momentumProfile.refinement }
            ].map((item) => (
              <div key={item.label} className="card" style={{ padding: "0.9rem", background: "var(--surface-strong)" }}>
                <div className="practice-meta">{item.label}</div>
                <strong style={{ fontSize: "1.8rem" }}>{item.value}</strong>
                <div className="dashboard-meter" aria-hidden="true">
                  <span style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="practice-meta">
            {tr ? "Su an en guclu sinyal:" : "Your strongest signal right now:"} <strong>{momentumProfile.strongest.label}</strong>
          </div>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem", background: "rgba(29, 111, 117, 0.08)" }}>
          <div>
            <span className="eyebrow">{tr ? "Koç imzasi" : "Coach signature"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{coachSignature.title}</h2>
          </div>
          <p className="practice-copy">{coachSignature.body}</p>
          <Link className="button button-secondary" href="/app/practice">
            {tr ? "Bu profile gore practice ac" : "Practice with this profile"}
          </Link>
        </div>
      </section>

      <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Gunluk gorev" : "Daily mission"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{dailyMission.title}</h2>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.08)" }}>
            <strong>{dailyMission.primary}</strong>
            <p style={{ margin: "0.55rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>{dailyMission.secondary}</p>
          </div>
          <Link className="button button-primary" href="/app/practice">
            {tr ? "Bugunun practice'ini ac" : "Open today's practice"}
          </Link>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Trouble words" : "Trouble words"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Takildigin kelimeler" : "Words to clean up"}</h2>
          </div>
          {troubleWords.length ? (
            <div style={{ display: "grid", gap: "0.65rem" }}>
              {troubleWords.map((item) => (
                <div key={`${item.word}-${item.count}`} className="card" style={{ padding: "0.85rem", background: "var(--surface-strong)", display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center" }}>
                  <strong>{item.word}</strong>
                  <span className="pill">{tr ? `${item.count} tekrar` : `${item.count} repeats`}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
              {tr ? "Birkac deneme daha geldikce sik tekrar ettigin kelimeler burada toplanacak." : "As more sessions come in, the words you overuse will appear here."}
            </p>
          )}
          <div className="practice-meta">
            {tr
              ? "Amac bunlari tamamen silmek degil; daha cesitli ve dogal kelime secimi kullanmak."
              : "The goal is not to remove them entirely, but to replace overused words with more varied and natural choices."}
          </div>
        </div>
      </section>

      <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Sonraki kaynak" : "Next resource"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Odagina uygun okuma" : "Read something aligned with your focus"}</h2>
          </div>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.75 }}>
            {hasBalancedSkillProfile
              ? tr
                ? "Skill'lerin dengeli gidiyor. Bu noktada daha olgun cevaplar ve daha kaliteli ornekler icin genel bir rehber acmak daha mantikli."
                : "Your skills look fairly balanced. At this point, a broader guide about answer maturity and better examples makes more sense."
              : tr
                ? "En zayif sinyalinle hizli eslesen tek bir guide acmak, sonraki practice denemeni daha verimli yapar."
                : "Opening one guide that matches your weakest signal usually makes the next practice attempt much more efficient."}
          </p>
          <Link
            className="button button-secondary"
            href={((weakestSkill && dashboardRecommendations[weakestSkill.label]?.href) || "/resources") as Route}
          >
            {weakestSkill
              ? (tr ? dashboardRecommendations[weakestSkill.label]?.trLabel : dashboardRecommendations[weakestSkill.label]?.label)
              : tr ? "Kaynaklari ac" : "Open resources"}
          </Link>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Kolay geri donus" : "Easy return"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Bugun kisa bir giris yap" : "Make a lighter entry today"}</h2>
          </div>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.75 }}>
            {tr
              ? "Tam practice acmak istemedigin gunlerde bile daily prompt veya free test sayfasi uzerinden speaking ritmini koruyabilirsin."
              : "Even on days when a full practice feels heavy, you can keep the habit alive through the daily prompt or free test pages."}
          </p>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/daily-ielts-speaking-prompt">
              {tr ? "Gunluk prompt" : "Daily prompt"}
            </Link>
            <Link className="button button-secondary" href="/free-ielts-speaking-test">
              {tr ? "Ucretsiz test" : "Free test"}
            </Link>
          </div>
        </div>
      </section>

      {announcements.length ? (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Duyurular" : "Announcements"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Sinif ve platform akisi" : "Class and platform feed"}</h2>
          </div>
          <div className="grid" style={{ gap: "0.75rem" }}>
            {announcements.slice(0, 4).map((item) => (
              <div key={item.id} className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)" }}>
                <strong>{item.title}</strong>
                <p style={{ margin: "0.45rem 0 0", lineHeight: 1.7 }}>{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "minmax(320px, 1.3fr) minmax(280px, 0.9fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "1rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Trend" : "Trend"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Son 7 deneme trendi" : "Last 7 attempt trend"}</h2>
          </div>

          {recentTrend.length ? (
            <div style={{ display: "grid", gap: "0.7rem" }}>
              {recentTrend.map((session) => {
                const score = session.report?.overall ?? 0;
                const maxScore = session.examType === "IELTS" ? 9 : 4;
                const width = Math.max((score / maxScore) * 100, 8);

                return (
                  <Link
                    key={session.id}
                    href={`/app/results/${session.id}`}
                    className="dashboard-trend-link"
                    style={{ display: "grid", gridTemplateColumns: "150px 1fr 56px", gap: "0.8rem", alignItems: "center", textDecoration: "none", color: "inherit" }}
                  >
                    <span style={{ color: "var(--muted)", fontSize: "0.92rem" }}>{session.prompt.title}</span>
                    <div style={{ height: 12, borderRadius: 999, background: "rgba(29, 111, 117, 0.12)", overflow: "hidden" }}>
                      <div style={{ width: `${width}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--accent-cool))" }} />
                    </div>
                    <strong>{score || "-"}</strong>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--muted)", margin: 0 }}>{tr ? "Trend gostermek icin henuz yeterli deneme yok." : "You need a few more attempts before the trend becomes useful."}</p>
          )}
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Odak" : "Focus"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Next study focus" : "Next study focus"}</h2>
          </div>
          <p style={{ color: "var(--text)", lineHeight: 1.75, margin: 0 }}>{nextStudyFocus}</p>
          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>{tr ? "Yol plani" : "Roadmap"}</strong>
            <p style={{ margin: "0.55rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>{roadmap}</p>
          </div>
        </div>
      </section>

      {signedIn && !currentUser?.isTeacher ? (
        <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "minmax(320px, 0.9fr) minmax(320px, 1.1fr)", gap: "1rem", alignItems: "start" }}>
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
            <div>
              <span className="eyebrow">{tr ? "Sinif katilimi" : "Class join"}</span>
              <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Kod ile sinifa katil" : "Join a class with code"}</h2>
            </div>
            <input
              value={joinCode}
              onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
              placeholder={tr ? "Ornek: AB12CD" : "Example: AB12CD"}
              style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
            />
            <button type="button" className="button button-primary" onClick={joinClass}>
              {tr ? "Sinifa katil" : "Join class"}
            </button>
            {joinNotice ? <p style={{ margin: 0, color: "var(--success)" }}>{joinNotice}</p> : null}
            {joinError ? <p style={{ margin: 0, color: "var(--accent-deep)" }}>{joinError}</p> : null}
            <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
              {tr ? "Ogretmenin verdigi join code ile sinifa baglanip speaking gelisimini kurs paneline tasiyabilirsin." : "Use the teacher's join code to connect your account to a class and share your speaking progress with the course dashboard."}
            </p>
          </div>

          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
            <div>
              <span className="eyebrow">{tr ? "Bagli siniflar" : "Joined classes"}</span>
              <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Kurs baglantilarin" : "Your course links"}</h2>
            </div>
            {joinedClasses.length ? (
              <div className="grid" style={{ gap: "0.75rem" }}>
                {joinedClasses.map((item) => (
                  <div key={`${item.classId}-${item.joinedAt}`} className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
                    <strong>{item.className}</strong>
                    <div className="practice-meta" style={{ marginTop: "0.35rem" }}>
                      {item.teacherName} · {item.teacherEmail}
                    </div>
                    <div style={{ color: "var(--muted)", marginTop: "0.5rem", lineHeight: 1.6 }}>
                      {tr ? `Kod: ${item.joinCode} · Katilim: ${new Date(item.joinedAt).toLocaleDateString("tr-TR")}` : `Code: ${item.joinCode} · Joined: ${new Date(item.joinedAt).toLocaleDateString("en-US")}`}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
                {tr ? "Henuz bagli oldugun bir sinif yok." : "You have not joined a class yet."}
              </div>
            )}
          </div>
        </section>
      ) : null}

      {signedIn && !currentUser?.isTeacher ? (
        <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
            <div>
              <span className="eyebrow">{tr ? "Homework board" : "Homework board"}</span>
              <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Atanmis calismalar" : "Assigned practice"}</h2>
            </div>
            <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.7rem" }}>
              <div className="card" style={{ padding: "0.8rem", background: "rgba(188, 92, 58, 0.08)" }}>
                <div className="practice-meta">{tr ? "Geciken" : "Overdue"}</div>
                <strong>{overdueHomeworkCount}</strong>
              </div>
              <div className="card" style={{ padding: "0.8rem", background: "rgba(196, 147, 58, 0.08)" }}>
                <div className="practice-meta">{tr ? "2 gun icinde" : "Due in 2 days"}</div>
                <strong>{dueSoonHomeworkCount}</strong>
              </div>
            </div>
            {homework.length ? (
              <div className="grid" style={{ gap: "0.75rem" }}>
                {homework.slice(0, 6).map((item) => (
                  <div key={item.id} className="card" style={{ padding: "0.95rem", background: item.completedAt ? "rgba(47, 125, 75, 0.08)" : "var(--surface-strong)", display: "grid", gap: "0.55rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
                      <strong>{item.title}</strong>
                      <span className="pill">
                        {item.completedAt
                          ? tr ? "Tamam" : "Done"
                          : item.dueAt && new Date(item.dueAt).getTime() < Date.now()
                            ? tr ? "Gecikti" : "Overdue"
                            : tr ? "Bekliyor" : "Pending"}
                      </span>
                    </div>
                    <div className="practice-meta">{item.focusSkill}</div>
                    <p style={{ margin: 0, lineHeight: 1.7 }}>{item.instructions}</p>
                    {item.dueAt ? (
                      <div className="practice-meta">
                        {tr ? "Teslim" : "Due"}: {new Date(item.dueAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}
                      </div>
                    ) : null}
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
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
                          {tr ? "Calismayi ac" : "Open practice"}
                        </Link>
                      ) : null}
                      {!item.completedAt ? (
                        <button type="button" className="button button-secondary" onClick={() => completeHomework(item.id)}>
                          {tr ? "Tamamlandi olarak isle" : "Mark complete"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
                {tr ? "Henuz ogretmenden atanmis bir homework yok." : "There is no teacher-assigned homework yet."}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
            <div>
              <span className="eyebrow">{tr ? "Paylasilan study list" : "Shared study list"}</span>
              <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Ogretmenden gelen oneriler" : "Teacher recommendations"}</h2>
            </div>
            {sharedStudyClasses.length ? (
              <div className="grid" style={{ gap: "0.75rem" }}>
                {sharedStudyClasses.map((entry) => (
                  <div key={entry.classId} className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.6rem" }}>
                    <strong>{entry.className}</strong>
                    <div className="practice-meta">{entry.teacherName}</div>
                    <div style={{ display: "grid", gap: "0.55rem" }}>
                      {entry.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="card" style={{ padding: "0.75rem", background: "rgba(29, 111, 117, 0.06)", display: "grid", gap: "0.35rem" }}>
                          <strong style={{ fontSize: "0.96rem" }}>{item.title}</strong>
                          {item.note ? <div className="practice-meta">{item.note}</div> : null}
                          <Link
                            className="button button-secondary"
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
                            {tr ? "Practice'de ac" : "Open in practice"}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
                {tr ? "Ogretmenin henuz sinifin icin ortak bir study list onermedi." : "Your teacher has not shared a class study list yet."}
              </p>
            )}
            <Link className="button button-secondary" href="/app/study-lists">
              {tr ? "Study lists sayfasini ac" : "Open study lists"}
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Weekly checklist" : "Weekly checklist"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Bu haftanin gorevleri" : "This week's tasks"}</h2>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(47, 125, 75, 0.08)" }}>
            <strong>{tr ? "Tamamlanma durumu" : "Completion status"}</strong>
            <p style={{ margin: "0.55rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
              {tr
                ? `${completedChecklistCount}/${weeklyChecklistItems.length} gorev tamamlandi.`
                : `${completedChecklistCount}/${weeklyChecklistItems.length} tasks completed.`}
            </p>
          </div>
          <div style={{ display: "grid", gap: "0.7rem" }}>
            {weeklyChecklistItems.map((item) => (
              <label key={item.id} className="card" style={{ padding: "0.95rem", background: item.done ? "rgba(47, 125, 75, 0.08)" : "var(--surface-strong)", display: "flex", gap: "0.8rem", alignItems: "flex-start", cursor: "pointer" }}>
                <input type="checkbox" checked={item.done} onChange={() => toggleChecklistItem(item.id)} style={{ marginTop: "0.3rem" }} />
                <span style={{ lineHeight: 1.7 }}>{item.text}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Streak tracker" : "Streak tracker"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Son 7 gun" : "Last 7 days"}</h2>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(29, 111, 117, 0.08)" }}>
            <strong>{tr ? "Aktif seri" : "Active streak"}</strong>
            <p style={{ margin: "0.55rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>
              {tr
                ? `${summary.streakDays} gun ust uste practice yaptin.`
                : `You have practiced for ${summary.streakDays} day(s) in a row.`}
            </p>
          </div>
          <div className="dashboard-streak-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "0.6rem" }}>
            {streakCalendar.map((day) => (
              <div key={day.key} className="card" style={{ padding: "0.8rem 0.55rem", textAlign: "center", background: day.active ? "rgba(47, 125, 75, 0.12)" : "var(--surface-strong)" }}>
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.35rem" }}>{day.label}</div>
                <div style={{ width: 12, height: 12, borderRadius: 999, margin: "0 auto 0.35rem", background: day.active ? "var(--success)" : "rgba(29, 111, 117, 0.18)" }} />
                <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{day.active ? (tr ? "Var" : "Done") : (tr ? "Bos" : "Off")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid dashboard-section-grid" style={{ gridTemplateColumns: "minmax(320px, 1fr) minmax(320px, 1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Mistake notebook" : "Mistake notebook"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Tekrar eden hatalar" : "Repeated mistakes"}</h2>
          </div>
          <div className="card" style={{ padding: "1rem", background: "rgba(217, 93, 57, 0.06)" }}>
            <strong>{tr ? "En cok geri donen skill" : "Most repeated weak area"}</strong>
            <p style={{ margin: "0.55rem 0 0", lineHeight: 1.7, color: "var(--muted)" }}>
              {mistakeNotebook.weakSkillLabel ?? (tr ? "Yeterli veri yok" : "Not enough data yet")}
            </p>
          </div>
          <NotebookList
            title={tr ? "Surekli gelen duzeltmeler" : "Repeated improvement notes"}
            items={mistakeNotebook.repeatedImprovements}
            emptyLabel={tr ? "Daha fazla deneme geldikce tekrar eden duzeltmeler burada toplanacak." : "Repeated improvement notes will appear here as more sessions come in."}
            tr={tr}
          />
          <NotebookList
            title={tr ? "Sik filler kelimeler" : "Frequent filler words"}
            items={mistakeNotebook.repeatedFillers}
            emptyLabel={tr ? "Henuz tekrar eden filler kelime gorunmuyor." : "No repeated filler words yet."}
            tr={tr}
          />
          <Link href="/app/review" className="button button-secondary" style={{ width: "fit-content" }}>
            {tr ? "Tum hata panosunu ac" : "Open full review board"}
          </Link>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Koç tavsiyesi" : "Coach advice"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Nasil practice yapmali?" : "How should you practice?"}</h2>
          </div>
          <ul style={{ margin: 0, paddingLeft: "1.15rem" }}>
            {strategyTips.map((tip) => (
              <li key={tip} style={{ marginTop: "0.55rem", lineHeight: 1.7 }}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <div>
            <span className="eyebrow">{tr ? "Haftalik plan" : "Weekly plan"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.6rem 0 0.2rem" }}>{tr ? "Ne yapmaliyim?" : "What should I do next?"}</h2>
          </div>
          <ol style={{ margin: 0, paddingLeft: "1.2rem" }}>
            {weeklyPlan.map((step) => (
              <li key={step} style={{ marginTop: "0.55rem", lineHeight: 1.7 }}>{step}</li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <span className="eyebrow">{tr ? "Son calismalar" : "Recent work"}</span>
            <h2 style={{ fontSize: "2rem", margin: "0.8rem 0 0.4rem" }}>{tr ? "Son sessionlar" : "Latest sessions"}</h2>
          </div>
          <button className="button button-secondary" type="button" onClick={signedIn ? signOut : undefined}>
            {signedIn ? (tr ? "Cikis yap" : "Sign out") : tr ? "Misafir modu aktif" : "Guest mode active"}
          </button>
        </div>

        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", marginTop: "1rem" }}>
          {summary.recentSessions.length ? (
            summary.recentSessions.map((session) => <SessionCard key={session.id} session={session} tr={tr} />)
          ) : (
            <div className="card" style={{ padding: "1.2rem" }}>
              {tr ? "Henuz session yok. IELTS cue card veya TOEFL task ile basla." : "No sessions yet. Start with an IELTS cue card or a TOEFL task."}
            </div>
          )}
        </div>
      </section>
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
      <select className="practice-select" value={targetScore} onChange={(event) => onChange(event.target.value)}>
        <option value="">{tr ? "Hedef secme" : "No target"}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
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

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="card" style={{ padding: "1.2rem", background: "var(--surface-strong)" }}>
      <div style={{ color: "var(--muted)", marginBottom: "0.5rem" }}>{label}</div>
      <div style={{ fontSize: "2rem", fontWeight: 800 }}>{value}</div>
      <div style={{ color: "var(--muted)", marginTop: "0.45rem", lineHeight: 1.55 }}>{note}</div>
    </div>
  );
}

function SessionCard({ session, tr }: { session: SpeakingSession; tr: boolean }) {
  return (
    <Link href={`/app/results/${session.id}`} className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.6rem" }}>
      <span className="pill">
        {session.examType} · {session.taskType}
      </span>
      <strong>{session.prompt.title}</strong>
      <span style={{ color: "var(--muted)" }}>
        {session.report ? `${session.report.scaleLabel}: ${session.report.overall}` : tr ? "Degerlendirme bekleniyor" : "Awaiting evaluation"}
      </span>
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

function NotebookList({
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
    <div className="card" style={{ padding: "1rem" }}>
      <strong>{title}</strong>
      {items.length ? (
        <div style={{ display: "grid", gap: "0.55rem", marginTop: "0.8rem" }}>
          {items.map((item) => (
            <div key={`${item.text}-${item.count}`} style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "flex-start" }}>
              <span style={{ lineHeight: 1.6 }}>{item.text}</span>
              <span className="pill">{tr ? `${item.count} kez` : `${item.count}x`}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ margin: "0.7rem 0 0", color: "var(--muted)", lineHeight: 1.7 }}>{emptyLabel}</p>
      )}
    </div>
  );
}

function getIsoWeekKey(date: Date) {
  const working = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = working.getUTCDay() || 7;
  working.setUTCDate(working.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(working.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((working.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${working.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function buildRecentStreakCalendar(sessions: SpeakingSession[]) {
  const activeDays = new Set(
    sessions.map((session) => new Date(session.createdAt).toISOString().slice(0, 10))
  );

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
      active: activeDays.has(key)
    };
  });
}

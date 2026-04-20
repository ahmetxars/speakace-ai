"use client";

import Link from "next/link";
import { ArrowRight, BellRing, BookOpenCheck, CalendarClock, CheckCircle2, CircleAlert, ClipboardList, Flame, GraduationCap, LayoutGrid, Mic, PenSquare, Sparkles, Target, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { InstitutionAdminPanel } from "@/components/institution-admin-panel";
import { useAppState } from "@/components/providers";
import { TeacherHub } from "@/components/teacher-hub";
import { trackClientEvent } from "@/lib/analytics-client";
import { buildPlanCheckoutPath, couponCatalog } from "@/lib/commerce";
import { AnnouncementItem, HomeworkAssignment, ProgressSummary, SharedClassStudyItem, SpeakingSession, StudentClassMembership, StudentProfile, WritingSummary } from "@/lib/types";

const emptySummary: ProgressSummary = {
  totalSessions: 0,
  averageScore: 0,
  streakDays: 0,
  freeSessionsRemaining: 4,
  remainingMinutesToday: 8,
  currentPlan: "free",
  recentSessions: []
};

const emptyWritingSummary: WritingSummary = {
  totalSessions: 0,
  averageScore: 0,
  latestSession: null,
  recentSessions: [],
  weakestCategory: null
};

export function Dashboard() {
  const { signedIn, currentUser, language, signOut } = useAppState();
  const tr = language === "tr";
  const [summary, setSummary] = useState<ProgressSummary>(emptySummary);
  const [targetScore, setTargetScore] = useState<string>("");
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
  const [writingSummary, setWritingSummary] = useState<WritingSummary>(emptyWritingSummary);

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
    if (!currentUser) {
      setWritingSummary(emptyWritingSummary);
      return;
    }

    fetch(`/api/writing/summary?userId=${encodeURIComponent(currentUser.id)}`)
      .then((response) => response.json())
      .then((data: WritingSummary) => setWritingSummary(data))
      .catch(() => setWritingSummary(emptyWritingSummary));
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


  if (isSchoolMember) {
    return <InstitutionAdminPanel />;
  }

  if (isTeacherMember) {
    return <TeacherHub />;
  }

  const firstName = currentUser?.name?.split(" ")[0] ?? "";
  const pendingHomeworkCount = homework.filter((item) => !item.completedAt).length;
  const classCount = joinedClasses.length;
  const hasAnyStudentSupport = pendingHomeworkCount > 0 || classCount > 0 || announcements.length > 0;
  const recentSession = summary.recentSessions[0] ?? null;
  const heroStatus = summary.totalSessions
    ? tr
      ? `${summary.totalSessions} deneme tamamlandi, seri ${summary.streakDays} gun oldu.`
      : `${summary.totalSessions} sessions completed, and your streak is now ${summary.streakDays} days.`
    : tr
      ? "Bugun ilk denemeni atip dashboardu veriyle doldurmaya baslayabilirsin."
      : "Start your first attempt today and begin filling the dashboard with real data.";
  const momentumCards = [
    {
      title: tr ? "Speaking ivmesi" : "Speaking momentum",
      value: summary.averageScore ? `${summary.averageScore}` : "-",
      note: tr ? "Son session ortalamasi" : "Average across recent attempts",
      icon: Mic,
    },
    {
      title: tr ? "Hedef mesafesi" : "Target gap",
      value: scoreGap !== null ? `${scoreGap > 0 ? "-" : "+"}${Math.abs(scoreGap).toFixed(1)}` : tr ? "Yok" : "Unset",
      note: numericTarget
        ? tr
          ? `${targetLabel} ile mevcut ortalama farki`
          : `Gap between your current average and ${targetLabel}`
        : tr
          ? "Daha net yol plani icin hedef belirle"
          : "Set a target for clearer planning",
      icon: Target,
    },
    {
      title: tr ? "Bu hafta plan" : "Weekly plan",
      value: `${completedChecklistCount}/${weeklyChecklistItems.length}`,
      note: tr ? "Tamamlanan odak maddeleri" : "Checklist items completed",
      icon: CheckCircle2,
    },
    {
      title: tr ? "Destek merkezi" : "Support center",
      value: hasAnyStudentSupport ? `${pendingHomeworkCount + announcements.length + classCount}` : "0",
      note: tr ? "Odev, duyuru ve sinif hareketi" : "Homework, announcements, and class activity",
      icon: BellRing,
    },
  ];
  const workspaceCards = [
    {
      title: tr ? "Speaking practice" : "Speaking practice",
      body: tr ? "Yeni deneme baslat, transcript incele, tekrar et." : "Start a new attempt, review the transcript, and retry with intent.",
      href: "/app/practice",
      cta: tr ? "Pratige git" : "Open practice",
      icon: Mic,
    },
    {
      title: tr ? "Writing coach" : "Writing coach",
      body: tr ? "Essay yaz, band tahmini al, duzeltmeleri gor." : "Write an essay, get an estimated band, and review corrections.",
      href: "/app/writing",
      cta: tr ? "Writing hub" : "Open writing",
      icon: PenSquare,
    },
    {
      title: tr ? "Review board" : "Review board",
      body: tr ? "Tekrarlayan zayif kaliplari tek yerde topla." : "Keep repeated weak patterns in one focused review space.",
      href: "/app/review",
      cta: tr ? "Hataya don" : "Open review",
      icon: BookOpenCheck,
    },
    {
      title: tr ? "Calisma listeleri" : "Study lists",
      body: tr ? "Kayitli promptlar, ogretmen listeleri ve tekrarlar." : "Saved prompts, teacher study lists, and retry work in one place.",
      href: "/app/study-lists",
      cta: tr ? "Listeyi ac" : "Open lists",
      icon: LayoutGrid,
    },
  ];

  return (
    <div className="page-shell section db-page">

      {needsOnboarding ? (
        <section className="db-banner card">
          <div className="db-banner-body">
            <Sparkles size={15} />
            <p>{tr ? "Hedef skorunu ve tercihlerini tamamla; dashboard onerileri daha isabetli hale gelsin." : "Complete your target score and preferences so the dashboard can guide you more precisely."}</p>
          </div>
          <Link className="button button-secondary" href="/app/onboarding">
            {tr ? "Kurulumu tamamla" : "Complete setup"}
          </Link>
        </section>
      ) : null}

      {/* HERO */}
      <section className="db-hero card">
        <div className="db-hero-copy">
          <span className="eyebrow">{tr ? "Ogrenci dashboard" : "Student dashboard"}</span>
          <h1 className="db-hero-name">
            {firstName ? (tr ? `Merhaba, ${firstName}` : `Hi, ${firstName}`) : tr ? "Hos geldin" : "Welcome back"}
          </h1>
          <p className="db-hero-status">{heroStatus}</p>
          <div className="db-hero-actions">
            <Link className="button button-primary" href="/app/practice">
              {tr ? "Speaking baslat" : "Start speaking"}
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
          <div className="db-hero-stat">
            <Mic size={16} />
            <strong>{summary.averageScore || "—"}</strong>
            <span>{tr ? "ort skor" : "avg score"}</span>
          </div>
          <div className="db-hero-stat">
            <Flame size={16} />
            <strong>{summary.streakDays}</strong>
            <span>{tr ? "gun seri" : "day streak"}</span>
          </div>
          <div className="db-hero-stat">
            <CalendarClock size={16} />
            <strong>{summary.remainingMinutesToday}</strong>
            <span>{tr ? "dk kaldi" : "min left"}</span>
          </div>
          <div className="db-hero-stat">
            <GraduationCap size={16} />
            <strong>{summary.currentPlan}</strong>
            <span>{tr ? "plan" : "plan"}</span>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="db-body-grid">

        {/* LEFT COLUMN */}
        <div className="db-left-col">

          {/* TODAY'S FOCUS */}
          <div className="db-focus-card card">
            <div className="dashboard-section-head">
              <span className="eyebrow">{tr ? "Bugunku odak" : "Today's focus"}</span>
              <span className="dashboard-chip">{recentSession ? recentSession.examType : latestExamType}</span>
            </div>
            <p className="db-focus-text">{nextStudyFocus}</p>
            <div className="db-roadmap-block">
              <strong>{tr ? "Yol haritasi" : "Roadmap"}</strong>
              <p>{roadmap}</p>
            </div>
            <div className="dashboard-inline-actions">
              <Link className="button button-primary" href="/app/practice">
                {tr ? "Pratige git" : "Go practice"}
              </Link>
              <Link className="button button-secondary" href="/app/review">
                {tr ? "Review board" : "Review board"}
              </Link>
            </div>
          </div>

          {/* WORKSPACE */}
          <div className="db-workspace-grid">
            {workspaceCards.map(({ title, body, href, cta, icon: Icon }) => (
              <a key={title} href={href} className="db-workspace-card card">
                <div className="db-workspace-icon">
                  <Icon size={18} />
                </div>
                <strong>{title}</strong>
                <p>{body}</p>
                <span className="db-workspace-cta">
                  {cta}
                  <ArrowRight size={14} />
                </span>
              </a>
            ))}
          </div>

          {/* STATS ROW */}
          <div className="db-stats-row">
            <TargetCard examType={latestExamType} targetScore={targetScore} onChange={handleTargetScoreChange} tr={tr} />
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
          </div>

          {/* WEEKLY PLAN + PATTERNS */}
          <div className="db-duo-row">
            <div className="card db-checklist-card">
              <div className="dashboard-section-head">
                <span className="eyebrow">{tr ? "Bu haftanin plani" : "This week's plan"}</span>
                <span className="dashboard-chip">{completedChecklistCount}/{weeklyChecklistItems.length}</span>
              </div>
              <div className="db-checklist">
                {weeklyChecklistItems.map((item) => (
                  <button key={item.id} type="button" onClick={() => toggleChecklistItem(item.id)} className="db-checklist-item">
                    <span data-done={item.done ? "true" : "false"}>
                      {item.done ? <CheckCircle2 size={13} /> : null}
                    </span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="card db-patterns-card">
              <div className="dashboard-section-head">
                <span className="eyebrow">{tr ? "Tekrarlayan kaliplar" : "Repeated patterns"}</span>
                <span className="dashboard-chip">{mistakeNotebook.weakSkillLabel ?? (tr ? "izleniyor" : "tracking")}</span>
              </div>
              {mistakeNotebook.repeatedImprovements.length > 0 ? (
                <NotebookList title={tr ? "Gelisim alanlari" : "Improvement areas"} items={mistakeNotebook.repeatedImprovements} emptyLabel="" tr={tr} />
              ) : null}
              {mistakeNotebook.repeatedFillers.length > 0 ? (
                <NotebookList title={tr ? "Dolgu sozcukler" : "Filler words"} items={mistakeNotebook.repeatedFillers} emptyLabel="" tr={tr} />
              ) : null}
              {mistakeNotebook.repeatedImprovements.length === 0 && mistakeNotebook.repeatedFillers.length === 0 ? (
                <p className="dashboard-empty-copy">{tr ? "Daha fazla session geldikce tekrar eden kaliplar burada toplanacak." : "Repeated patterns appear here as you complete more sessions."}</p>
              ) : null}
              <Link href="/app/review" className="button button-secondary">
                {tr ? "Tum review panosu" : "Open review board"}
              </Link>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="db-sidebar">

          {/* RECENT SESSIONS */}
          <div className="card db-sessions-card">
            <div className="dashboard-section-head">
              <span className="eyebrow">{tr ? "Son sessionlar" : "Recent sessions"}</span>
              <span className="dashboard-chip">{summary.recentSessions.length}</span>
            </div>
            {summary.recentSessions.length ? (
              summary.recentSessions.slice(0, 6).map((session) => <SessionCard key={session.id} session={session} tr={tr} />)
            ) : (
              <p className="dashboard-empty-copy">{tr ? "Henuz session yok. Ilk denemeyi baslat." : "No sessions yet. Start your first attempt."}</p>
            )}
          </div>

          {/* WRITING */}
          <div className="card db-writing-card">
            <div className="dashboard-section-head">
              <span className="eyebrow">{tr ? "Writing coach" : "Writing coach"}</span>
              <span className="dashboard-chip">{writingSummary.totalSessions}</span>
            </div>
            <p>
              {writingSummary.latestSession?.report
                ? tr
                  ? `Son essay: ${writingSummary.latestSession.report.overall}. Devam etmek icin buradan ac.`
                  : `Latest essay: ${writingSummary.latestSession.report.overall}. Continue from here.`
                : tr
                  ? "Speaking pratiginizi writing ile destekleyin."
                  : "Support your speaking practice with writing feedback."}
            </p>
            <div className="dashboard-inline-actions">
              <Link href="/app/writing" className="button button-primary">{tr ? "Writing hub" : "Writing hub"}</Link>
              <Link href="/app/writing/task-2" className="button button-secondary">{tr ? "Yeni essay" : "New essay"}</Link>
            </div>
          </div>

          {/* CLASS & HOMEWORK */}
          {signedIn && !currentUser?.isTeacher ? (
            <div className="card db-class-card">
              <div className="dashboard-section-head">
                <span className="eyebrow">{tr ? "Sinif ve odevler" : "Class & homework"}</span>
                <span className="dashboard-chip">{pendingHomeworkCount + classCount}</span>
              </div>

              <div className="db-join-block">
                <strong>{tr ? "Sinifa katil" : "Join a class"}</strong>
                <div className="dashboard-join-row">
                  <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder={tr ? "Kod gir" : "Enter code"} />
                  <button type="button" className="button button-primary" onClick={joinClass}>{tr ? "Katil" : "Join"}</button>
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
                          {item.dueAt ? <span>{tr ? "Teslim" : "Due"}: {new Date(item.dueAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</span> : null}
                        </div>
                        <div className="dashboard-inline-actions">
                          {item.promptId ? (
                            <Link
                              className="button button-secondary"
                              href={{ pathname: "/app/practice", query: { promptId: item.promptId, examType: item.recommendedTaskType.startsWith("toefl") ? "TOEFL" : "IELTS", taskType: item.recommendedTaskType, difficulty: "Target" } }}
                            >
                              {tr ? "Ac" : "Open"}
                            </Link>
                          ) : null}
                          {!item.completedAt ? (
                            <button type="button" className="button button-secondary" onClick={() => completeHomework(item.id)}>
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
                            href={{ pathname: "/app/practice", query: { promptId: item.promptId, examType: item.examType, taskType: item.taskType, difficulty: item.difficulty } }}
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
              <strong>{tr ? "Gunluk limiti kaldir" : "Remove the daily cap"}</strong>
              <p>{tr ? "Plus: 35 dk/gun, 18 session, daha guclu feedback." : "Plus: 35 min/day, 18 sessions, deeper feedback."}</p>
              <div className="dashboard-inline-actions">
                <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "dashboard_upgrade" })}>
                  {tr ? "Plus'a gec" : "Upgrade to Plus"}
                </a>
                <Link className="button button-secondary" href="/pricing">{tr ? "Planlar" : "Plans"}</Link>
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

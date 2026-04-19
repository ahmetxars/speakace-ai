"use client";

import Link from "next/link";
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
  const overdueHomeworkCount = useMemo(
    () => homework.filter((item) => !item.completedAt && item.dueAt && new Date(item.dueAt).getTime() < Date.now()).length,
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


  if (isSchoolMember) {
    return <InstitutionAdminPanel />;
  }

  if (isTeacherMember) {
    return <TeacherHub />;
  }

  const firstName = currentUser?.name?.split(" ")[0] ?? "";

  return (
    <div className="page-shell section dashboard-page" style={{ display: "grid", gap: "1.25rem" }}>

      {/* ── Onboarding nudge ── */}
      {needsOnboarding ? (
        <section className="card" style={{ padding: "1rem 1.2rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", background: "rgba(29, 111, 117, 0.07)" }}>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
            {tr ? "Hedef skorunu belirleyerek dashboard önerilerini kişiselleştir." : "Set your target score to personalise dashboard guidance."}
          </p>
          <Link className="button button-secondary" href="/app/onboarding">
            {tr ? "Kurulumu tamamla" : "Complete setup"}
          </Link>
        </section>
      ) : null}

      {/* ── Hero ── */}
      <section className="card" style={{ padding: "1.6rem 1.8rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.2rem", flexWrap: "wrap" }}>
        <div>
          <span className="eyebrow">{tr ? "Panel" : "Dashboard"}</span>
          <h1 style={{ fontSize: "clamp(1.7rem, 4vw, 2.6rem)", margin: "0.45rem 0 0.3rem", lineHeight: 1.1 }}>
            {firstName ? (tr ? `Merhaba, ${firstName}` : `Hi, ${firstName}`) : (tr ? "Hoş geldin" : "Welcome back")}
          </h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.97rem" }}>
            {summary.totalSessions
              ? (tr ? `Toplam ${summary.totalSessions} deneme · Seri: ${summary.streakDays} gün` : `${summary.totalSessions} sessions total · ${summary.streakDays}-day streak`)
              : (tr ? "Henüz deneme yok — bugün başla." : "No sessions yet — start today.")}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
          <Link className="button button-primary" href="/app/practice">{tr ? "Pratiğe başla" : "Start practice"}</Link>
          {currentUser?.isTeacher
            ? <Link className="button button-secondary" href="/app/teacher">{tr ? "Öğretmen paneli" : "Teacher panel"}</Link>
            : <Link className="button button-secondary" href="/app/profile">{tr ? "Profilim" : "My profile"}</Link>}
        </div>
      </section>

      {/* ── 4 stat cards ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.9rem" }}>
        <StatCard label={tr ? "Toplam deneme" : "Total sessions"} value={String(summary.totalSessions)} note={tr ? "Tüm speaking sessionların" : "All speaking attempts"} />
        <StatCard label={tr ? "Ortalama skor" : "Average score"} value={summary.averageScore ? String(summary.averageScore) : "-"} note={tr ? "Son denemeler geneli" : "Across recent attempts"} />
        <StatCard label={tr ? "En iyi skor" : "Best score"} value={bestScore !== null ? String(bestScore) : "-"} note={tr ? "Şimdiye kadarki en iyi" : "Your highest scored attempt"} />
        <StatCard label="Streak" value={`${summary.streakDays}d`} note={tr ? "Ardışık çalışma günü" : "Consecutive practice days"} />
      </section>

      {/* ── Two-column: Focus + Recent sessions ── */}
      <section style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1.4fr)", gap: "0.9rem", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "0.9rem" }}>
          {/* Today's focus */}
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Bugünkü odak" : "Today's focus"}</span>
            <p style={{ margin: 0, lineHeight: 1.75, color: "var(--text)" }}>{nextStudyFocus}</p>
            <div className="card" style={{ padding: "0.85rem", background: "var(--surface-strong)", display: "grid", gap: "0.4rem" }}>
              <strong style={{ fontSize: "0.9rem" }}>{tr ? "Yol haritası" : "Roadmap"}</strong>
              <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7, fontSize: "0.92rem" }}>{roadmap}</p>
            </div>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <Link className="button button-primary" href="/app/practice">{tr ? "Pratiğe git" : "Go practice"}</Link>
              <Link className="button button-secondary" href="/app/review">{tr ? "Hatalarım" : "My mistakes"}</Link>
            </div>
          </div>
          {/* Target */}
          <TargetCard examType={latestExamType} targetScore={targetScore} onChange={handleTargetScoreChange} tr={tr} />
          {/* 7-day streak dots */}
          <div className="card" style={{ padding: "1rem 1.1rem" }}>
            <span className="eyebrow" style={{ marginBottom: "0.7rem", display: "block" }}>{tr ? "Son 7 gün" : "Last 7 days"}</span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.4rem" }}>
              {streakCalendar.map((day) => (
                <div key={day.key} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: "0.3rem" }}>{day.label}</div>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", margin: "0 auto", background: day.active ? "var(--accent)" : "var(--surface-strong)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {day.active ? <span style={{ color: "#fff", fontSize: "0.75rem" }}>✓</span> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Son sessionlar" : "Recent sessions"}</span>
            <button className="button button-secondary" style={{ fontSize: "0.8rem", padding: "0.3rem 0.8rem" }} type="button" onClick={signedIn ? signOut : undefined}>
              {signedIn ? (tr ? "Çıkış" : "Sign out") : tr ? "Misafir" : "Guest"}
            </button>
          </div>
          {summary.recentSessions.length ? (
            summary.recentSessions.slice(0, 6).map((session) => <SessionCard key={session.id} session={session} tr={tr} />)
          ) : (
            <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--muted)", lineHeight: 1.7 }}>
              {tr ? "Henüz session yok. Aşağıdan başla." : "No sessions yet. Start below."}
            </div>
          )}
        </div>
      </section>

      {/* ── Quick links ── */}
      <section>
        <span className="eyebrow" style={{ display: "block", marginBottom: "0.8rem" }}>{tr ? "Hızlı bağlantılar" : "Quick links"}</span>
        <div className="quick-action-grid">
          <Link className="card quick-action-card" href="/app/practice">
            <strong>{tr ? "Yeni practice" : "New practice"}</strong>
            <div className="practice-meta">{tr ? "Günün speaking denemesi" : "Start a speaking session"}</div>
          </Link>
          <Link className="card quick-action-card" href="/app/improve">
            <strong>{tr ? "Growth OS" : "Growth OS"}</strong>
            <div className="practice-meta">{tr ? "Tüm gelişim sistemi" : "Full improvement system"}</div>
          </Link>
          <Link className="card quick-action-card" href="/app/plan">
            <strong>{tr ? "Çalışma planım" : "Study plan"}</strong>
            <div className="practice-meta">{tr ? "Hedef bazlı günlük rota" : "Daily route to your target"}</div>
          </Link>
          <Link className="card quick-action-card" href="/app/writing">
            <strong>{tr ? "Writing coach" : "Writing coach"}</strong>
            <div className="practice-meta">IELTS Writing Task 2</div>
          </Link>
          <Link className="card quick-action-card" href="/app/review">
            <strong>{tr ? "Hata defteri" : "Mistake log"}</strong>
            <div className="practice-meta">{tr ? "Tekrar eden zayıf noktalar" : "Repeated weak patterns"}</div>
          </Link>
          <Link className="card quick-action-card" href="/app/study-lists">
            <strong>{tr ? "Çalışma listeleri" : "Study lists"}</strong>
            <div className="practice-meta">{tr ? "Kayıtlı sorular" : "Saved prompts & retry"}</div>
          </Link>
        </div>
      </section>

      {/* ── Writing coach card ── */}
      <section className="card" style={{ padding: "1.2rem 1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.2rem", flexWrap: "wrap" }}>
        <div>
          <span className="eyebrow">{tr ? "Writing coach" : "Writing coach"}</span>
          <strong style={{ display: "block", margin: "0.35rem 0 0.25rem", fontSize: "1.05rem" }}>
            {tr ? "IELTS Writing Task 2 — band tahmini, düzeltme, PDF rapor" : "IELTS Writing Task 2 — band estimate, correction, PDF report"}
          </strong>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.93rem" }}>
            {writingSummary.latestSession?.report
              ? (tr ? `Son essay: ${writingSummary.latestSession.report.overall} band tahmini.` : `Latest essay: estimated ${writingSummary.latestSession.report.overall}.`)
              : (tr ? "Henüz writing denemesi yok." : "No writing attempts yet.")}
            {writingSummary.totalSessions > 0 ? (tr ? ` Toplam ${writingSummary.totalSessions} deneme.` : ` ${writingSummary.totalSessions} total attempts.`) : null}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <Link href="/app/writing" className="button button-primary">{tr ? "Writing hub" : "Writing hub"}</Link>
          <Link href="/app/writing/task-2" className="button button-secondary">{tr ? "Yeni essay" : "New essay"}</Link>
        </div>
      </section>

      {/* ── Weekly checklist + Mistake notebook ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "0.9rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem" }}>
            <span className="eyebrow">{tr ? "Bu haftanın planı" : "This week's plan"}</span>
            <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>{completedChecklistCount}/{weeklyChecklistItems.length} {tr ? "tamamlandı" : "done"}</span>
          </div>
          <div style={{ display: "grid", gap: "0.55rem" }}>
            {weeklyChecklistItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleChecklistItem(item.id)}
                style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", color: "inherit" }}
              >
                <span style={{ flexShrink: 0, marginTop: "0.2rem", width: 18, height: 18, borderRadius: 4, border: "2px solid var(--line)", background: item.done ? "var(--accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {item.done ? <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 800 }}>✓</span> : null}
                </span>
                <span style={{ lineHeight: 1.6, color: item.done ? "var(--muted)" : "var(--text)", textDecoration: item.done ? "line-through" : "none", fontSize: "0.95rem" }}>{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        {scoredSessions.length > 0 && (mistakeNotebook.repeatedImprovements.length > 0 || mistakeNotebook.repeatedFillers.length > 0) ? (
          <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.75rem" }}>
            <span className="eyebrow">{tr ? "Tekrarlayan hatalar" : "Repeated patterns"}</span>
            {mistakeNotebook.repeatedImprovements.length > 0 ? (
              <NotebookList title={tr ? "Gelişim noktaları" : "Improvement areas"} items={mistakeNotebook.repeatedImprovements} emptyLabel="" tr={tr} />
            ) : null}
            {mistakeNotebook.repeatedFillers.length > 0 ? (
              <NotebookList title={tr ? "Dolgu sözcükler" : "Filler words"} items={mistakeNotebook.repeatedFillers} emptyLabel="" tr={tr} />
            ) : null}
            <Link href="/app/review" className="button button-secondary" style={{ width: "fit-content", fontSize: "0.88rem" }}>
              {tr ? "Tüm hata panosunu aç" : "Open full review board"}
            </Link>
          </div>
        ) : null}
      </section>

      {/* ── Homework (only when assigned) ── */}
      {signedIn && !currentUser?.isTeacher && homework.length > 0 ? (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
            <span className="eyebrow">{tr ? "Ödev" : "Homework"}</span>
            {overdueHomeworkCount > 0 ? <span className="pill" style={{ background: "rgba(188,92,58,0.12)", color: "var(--accent-deep)" }}>{overdueHomeworkCount} {tr ? "gecikti" : "overdue"}</span> : null}
          </div>
          <div style={{ display: "grid", gap: "0.65rem" }}>
            {homework.slice(0, 4).map((item) => (
              <div key={item.id} className="card" style={{ padding: "0.9rem", background: item.completedAt ? "rgba(47,125,75,0.07)" : "var(--surface-strong)", display: "grid", gap: "0.4rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
                  <strong>{item.title}</strong>
                  <span className="pill">{item.completedAt ? (tr ? "Tamam" : "Done") : item.dueAt && new Date(item.dueAt).getTime() < Date.now() ? (tr ? "Gecikti" : "Overdue") : (tr ? "Bekliyor" : "Pending")}</span>
                </div>
                {item.dueAt ? <div className="practice-meta">{tr ? "Teslim" : "Due"}: {new Date(item.dueAt).toLocaleDateString(tr ? "tr-TR" : "en-US")}</div> : null}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
                  {item.promptId ? (
                    <Link className="button button-secondary" style={{ fontSize: "0.82rem" }} href={{ pathname: "/app/practice", query: { promptId: item.promptId, examType: item.recommendedTaskType.startsWith("toefl") ? "TOEFL" : "IELTS", taskType: item.recommendedTaskType, difficulty: "Target" } }}>
                      {tr ? "Aç" : "Open"}
                    </Link>
                  ) : null}
                  {!item.completedAt ? (
                    <button type="button" className="button button-secondary" style={{ fontSize: "0.82rem" }} onClick={() => completeHomework(item.id)}>
                      {tr ? "Tamamlandı" : "Mark done"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Class join + joined classes ── */}
      {signedIn && !currentUser?.isTeacher ? (
        <section style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) minmax(260px, 1fr)", gap: "0.9rem", alignItems: "start" }}>
          <div className="card" style={{ padding: "1.1rem", display: "grid", gap: "0.7rem" }}>
            <span className="eyebrow">{tr ? "Sınıfa katıl" : "Join a class"}</span>
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder={tr ? "Kod: AB12CD" : "Code: AB12CD"} style={{ padding: "0.75rem", borderRadius: 12, border: "1px solid var(--line)", background: "var(--background)", color: "var(--text)", font: "inherit" }} />
            <button type="button" className="button button-primary" onClick={joinClass}>{tr ? "Katıl" : "Join"}</button>
            {joinNotice ? <p style={{ margin: 0, color: "var(--success)", fontSize: "0.9em" }}>{joinNotice}</p> : null}
            {joinError ? <p style={{ margin: 0, color: "var(--accent-deep)", fontSize: "0.9em" }}>{joinError}</p> : null}
          </div>
          <div className="card" style={{ padding: "1.1rem", display: "grid", gap: "0.65rem" }}>
            <span className="eyebrow">{tr ? "Bağlı sınıflar" : "Joined classes"}</span>
            {joinedClasses.length ? joinedClasses.map((item) => (
              <div key={`${item.classId}-${item.joinedAt}`} className="card" style={{ padding: "0.8rem", background: "var(--surface-strong)" }}>
                <strong>{item.className}</strong>
                <div className="practice-meta" style={{ marginTop: "0.25rem" }}>{item.teacherName}</div>
              </div>
            )) : <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9em" }}>{tr ? "Henüz sınıf yok." : "No classes yet."}</p>}
          </div>
        </section>
      ) : null}

      {/* ── Shared study list ── */}
      {signedIn && !currentUser?.isTeacher && sharedStudyClasses.length > 0 ? (
        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">{tr ? "Öğretmenden study listesi" : "Teacher's study list"}</span>
          {sharedStudyClasses.slice(0, 2).map((entry) => (
            <div key={entry.classId} style={{ display: "grid", gap: "0.55rem" }}>
              <div className="practice-meta">{entry.className} · {entry.teacherName}</div>
              {entry.items.slice(0, 3).map((item) => (
                <div key={item.id} className="card" style={{ padding: "0.75rem", background: "var(--surface-strong)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "0.95rem" }}>{item.title}</strong>
                  <Link className="button button-secondary" style={{ fontSize: "0.82rem" }} href={{ pathname: "/app/practice", query: { promptId: item.promptId, examType: item.examType, taskType: item.taskType, difficulty: item.difficulty } }}>
                    {tr ? "Aç" : "Open"}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </section>
      ) : null}

      {/* ── Announcements ── */}
      {announcements.length > 0 ? (
        <section className="card" style={{ padding: "1.1rem", display: "grid", gap: "0.7rem" }}>
          <span className="eyebrow">{tr ? "Duyurular" : "Announcements"}</span>
          {announcements.slice(0, 3).map((item) => (
            <div key={item.id} className="card" style={{ padding: "0.85rem", background: "var(--surface-strong)" }}>
              <strong>{item.title}</strong>
              <p style={{ margin: "0.35rem 0 0", lineHeight: 1.65, color: "var(--muted)" }}>{item.body}</p>
            </div>
          ))}
        </section>
      ) : null}

      {/* ── Upsell (free users only, subtle) ── */}
      {shouldUpsellPlus ? (
        <section className="card" style={{ padding: "1.2rem 1.4rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.2rem", flexWrap: "wrap", background: "rgba(217,93,57,0.05)", borderColor: "rgba(217,93,57,0.15)" }}>
          <div>
            <strong style={{ display: "block", marginBottom: "0.3rem" }}>{tr ? "Günlük limiti kaldır" : "Remove the daily limit"}</strong>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.93rem" }}>
              {tr ? "Plus ile günde 18 session, daha derin feedback ve sınırsız tekrar." : "Plus: 18 sessions/day, deeper feedback, unlimited retries."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "dashboard_upgrade" })}>{tr ? "Plus'a geç" : "Upgrade"}</a>
            <Link className="button button-secondary" href="/pricing">{tr ? "Planlar" : "See plans"}</Link>
          </div>
        </section>
      ) : null}
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

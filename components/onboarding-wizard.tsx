"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/providers";
import type { StudentProfile as StudentProfileType } from "@/lib/types";

const TOTAL_STEPS = 5;

type FormState = StudentProfileType & {
  englishBackground: string;
  biggestChallenge: string;
  estimatedLevel: string;
  learningStyle: string;
};

interface OptionCardProps {
  value: string;
  label: string;
  desc?: string;
  selected: boolean;
  onSelect: (value: string) => void;
  microcopy?: string;
}

function OptionCard({ value, label, desc, selected, onSelect, microcopy }: OptionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      style={{
        padding: "0.95rem 1.1rem",
        borderRadius: 14,
        border: selected ? "1.5px solid var(--sa-accent)" : "1px solid var(--line)",
        background: selected ? "rgba(29, 111, 117, 0.1)" : "var(--surface-strong)",
        cursor: "pointer",
        textAlign: "left",
        display: "grid",
        gap: "0.25rem",
        transition: "all 0.15s ease"
      }}
    >
      <strong style={{ fontSize: "0.9rem", color: selected ? "var(--sa-accent)" : "var(--text)" }}>{label}</strong>
      {desc ? <span style={{ color: "var(--muted)", fontSize: "0.82rem", lineHeight: 1.45 }}>{desc}</span> : null}
      {selected && microcopy ? (
        <span style={{ color: "var(--sa-accent)", fontSize: "0.8rem", marginTop: "0.2rem", fontStyle: "italic" }}>
          {microcopy}
        </span>
      ) : null}
    </button>
  );
}

export function OnboardingWizard({ profile }: { profile: StudentProfileType }) {
  const router = useRouter();
  const { language } = useAppState();
  const tr = language === "tr";

  const [form, setForm] = useState<FormState>({
    ...profile,
    studyDays: Array.isArray(profile.studyDays) ? profile.studyDays.map(String) : [],
    englishBackground: profile.englishBackground ?? "",
    biggestChallenge: profile.biggestChallenge ?? "",
    estimatedLevel: profile.estimatedLevel ?? "",
    learningStyle: profile.learningStyle ?? ""
  });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [planReady, setPlanReady] = useState(false);
  const [savedProfile, setSavedProfile] = useState<StudentProfileType | null>(null);

  const steps = [
    { title: tr ? "Hedef belirleme" : "Exam goal" },
    { title: tr ? "Geçmiş ve deneyim" : "Background" },
    { title: tr ? "Zorluklar" : "Challenges" },
    { title: tr ? "Seviye tespiti" : "Your level" },
    { title: tr ? "Çalışma ritmi" : "Study rhythm" }
  ];

  const englishBackgroundOptions = [
    {
      value: "abroad",
      label: tr ? "Yurtdışında yaşadım / okudum" : "I lived or studied abroad",
      desc: tr ? "Yabancı dil ortamında bulundum" : "I've been immersed in an English environment",
      microcopy: tr ? "Harika! Bu altyapı sana çok avantaj sağlayacak." : "Excellent! That immersion gives you a real head start."
    },
    {
      value: "work",
      label: tr ? "İş hayatımda her gün İngilizce kullanıyorum" : "I use English daily at work",
      desc: tr ? "Profesyonel bağlamda aktif kullanıcıyım" : "Active professional English user",
      microcopy: tr ? "Profesyonel deneyim sınav için mükemmel bir temel." : "Professional experience is a fantastic base for exam prep."
    },
    {
      value: "school",
      label: tr ? "Ağırlıklı olarak okulda öğrendim" : "I learned mainly at school",
      desc: tr ? "Resmi eğitim yoluyla edindim" : "Formal education background",
      microcopy: tr ? "Sağlam bir temelimiz var. Şimdi konuşma pratiğine odaklanacağız." : "Solid foundation. We'll focus on turning theory into speaking."
    },
    {
      value: "self",
      label: tr ? "Kendi kendime / online öğrendim" : "I'm self-taught or learned online",
      desc: tr ? "Dizi, uygulama, video gibi kaynaklarla" : "Through apps, shows, videos, and online resources",
      microcopy: tr ? "Öz disiplin çok değerli. Sistematik pratik ekleyeceğiz." : "Self-motivation is powerful. We'll add structured practice on top."
    },
    {
      value: "mixed",
      label: tr ? "Karma bir geçmişim var" : "I have a mixed background",
      desc: tr ? "Birden fazla kaynaktan öğrendim" : "Combination of school, work, and self-study",
      microcopy: tr ? "Çeşitli deneyim avantajlı. Eksik yönleri birlikte kapatacağız." : "Diverse experience is an advantage. We'll target the gaps."
    }
  ];

  const biggestChallengeOptions = [
    {
      value: "vocabulary",
      label: tr ? "Kelime bulamıyorum" : "I run out of words",
      desc: tr ? "Cümle ortasında kelime aklıma gelmiyor" : "Words escape me mid-sentence",
      microcopy: tr ? "Bu çok yaygın! Kelime zenginliğine özel egzersizler önereceğiz." : "Very common! We'll target vocabulary expansion exercises for you."
    },
    {
      value: "anxiety",
      label: tr ? "Heyecanlanıp donuyorum" : "I freeze up under pressure",
      desc: tr ? "Sinir baskısıyla düşüncelerimi toplayamıyorum" : "Nerves take over and I lose my train of thought",
      microcopy: tr ? "Güvenli, kolay konularla başlayıp güven inşa edeceğiz." : "We'll start with comfortable topics to build confidence gradually."
    },
    {
      value: "grammar",
      label: tr ? "Gramer hataları yapıyorum" : "I make grammar mistakes",
      desc: tr ? "Zaman kiplerini ve yapıları karıştırıyorum" : "Tenses and structures trip me up",
      microcopy: tr ? "Yapı odaklı pratiklerle hataları kalıcı olarak azaltacağız." : "Targeted structure drills will make these errors rare over time."
    },
    {
      value: "pronunciation",
      label: tr ? "Aksanım anlaşılmıyor" : "My pronunciation is unclear",
      desc: tr ? "Telaffuz ve vurgu konusunda zorlanıyorum" : "Stress, rhythm, and clarity are challenging",
      microcopy: tr ? "Telaffuza özel geri bildirimler sana en çok yardımcı olacak." : "Pronunciation-focused feedback will be your biggest lever."
    },
    {
      value: "fluency",
      label: tr ? "Çok yavaş / çok duraklıyorum" : "I speak too slowly or pause too much",
      desc: tr ? "Akıcılığım yok, düşünürken sessiz kalıyorum" : "Fluency and filler-free speech are struggles",
      microcopy: tr ? "Akıcılık drilleri ve zamanlı pratiklerle bunu çözeceğiz." : "Fluency drills and timed practice will break this pattern."
    },
    {
      value: "structure",
      label: tr ? "Cevaplarımı organize edemiyorum" : "I can't organize my answers",
      desc: tr ? "Ne söyleyeceğimi bilirim ama nasıl yapılandıracağımı bilemem" : "I have ideas but don't know how to structure them",
      microcopy: tr ? "Cevap çerçeveleme teknikleri tam sana göre!" : "Answer-framing techniques are exactly what you need."
    }
  ];

  const estimatedLevelOptions = [
    {
      value: "A2",
      label: tr ? "A2 – Başlangıç" : "A2 – Beginner",
      desc: tr ? "Temel İngilizce biliyorum ama konuşmak çok zor" : "I know basic English but speaking is very hard",
      microcopy: tr ? "Her şeyin bir başlangıcı var! Sana uygun tempoda ilerliyoruz." : "Everyone starts somewhere. We'll pace this perfectly for you."
    },
    {
      value: "B1",
      label: tr ? "B1 – Orta" : "B1 – Intermediate",
      desc: tr ? "Basit konuşmalar yapabiliyorum ama çok hata yapıyorum" : "I can hold simple conversations but make many mistakes",
      microcopy: tr ? "B1'den hedefe giden yolu birlikte çizeceğiz." : "B1 is a great launchpad. We'll map the path to your target."
    },
    {
      value: "B2",
      label: tr ? "B2 – Orta-İleri" : "B2 – Upper-Intermediate",
      desc: tr ? "Kendimi ifade edebiliyorum ama tam akıcı değilim" : "I can express myself but I'm not fully fluent yet",
      microcopy: tr ? "B2'desin — hedefe birkaç adım kaldı!" : "You're at B2 — just a few focused steps to your target."
    },
    {
      value: "C1",
      label: tr ? "C1 – İleri" : "C1 – Advanced",
      desc: tr ? "Oldukça akıcıyım, sınav taktiklerine odaklanacağım" : "I'm quite fluent, focusing on exam strategies",
      microcopy: tr ? "C1'de ince ayar ve sınav formatı odağımız olacak." : "At C1, fine-tuning and exam format will be our focus."
    },
    {
      value: "C1+",
      label: tr ? "C1+ – Neredeyse Akıcı" : "C1+ – Near-Fluent",
      desc: tr ? "Neredeyse anadil gibi konuşuyorum, sınav formatı öğreneceğim" : "Near-native level, here mainly to learn exam format",
      microcopy: tr ? "Mükemmel seviye! Sadece sınav stratejisi ve format çalışacağız." : "Excellent! Pure exam strategy and format polish from here."
    }
  ];

  const learningStyleOptions = [
    {
      value: "practice-first",
      label: tr ? "Bol pratik yaparak" : "Learning by doing",
      desc: tr ? "Önce dene, sonra hatalardan öğren" : "Jump in and learn from the feedback",
      microcopy: tr ? "Harika! Sana bol pratik fırsatı sunacağız." : "Perfect! We'll keep your sessions action-packed."
    },
    {
      value: "theory-first",
      label: tr ? "Önce teori, sonra pratik" : "Theory first, then practice",
      desc: tr ? "Yapıyı anla, sonra uygula" : "Understand the structure before applying it",
      microcopy: tr ? "Anlaşıldı! Her modülden önce konsepti açıklayacağız." : "Got it! We'll explain the concept before each practice module."
    },
    {
      value: "feedback-driven",
      label: tr ? "Geri bildirimleri analiz ederek" : "Analyzing feedback deeply",
      desc: tr ? "Raporlardan öğren, eksikleri hedefle" : "Study your reports and target specific weaknesses",
      microcopy: tr ? "Detaylı analiz seni hızlı geliştirir. Harika seçim!" : "Deep analysis accelerates progress. Great choice!"
    }
  ];

  const save = async () => {
    setError("");
    setNotice("");
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, onboardingComplete: true })
    });
    const data = (await response.json()) as { profile?: StudentProfileType; error?: string };
    if (!response.ok || !data.profile) {
      setError(data.error ?? (tr ? "Onboarding kaydedilemedi." : "Could not save onboarding."));
      return;
    }
    setSavedProfile(data.profile);
    setPlanReady(true);
  };

  const levelToIeltsScore: Record<string, number> = {
    A2: 4.0, B1: 5.0, B2: 6.5, C1: 7.5, "C1+": 8.5
  };
  const levelToToeflScore: Record<string, number> = {
    A2: 10, B1: 15, B2: 20, C1: 26, "C1+": 29
  };
  const challengeToFocus: Record<string, { en: string; tr: string; taskHint: string }> = {
    vocabulary: { en: "Lexical Resource", tr: "Kelime Zenginliği", taskHint: tr ? "Part 2 kart sorularıyla başla — bol açıklama pratiği yapar." : "Start with Part 2 cue cards — they push you to describe and expand vocabulary." },
    anxiety: { en: "Confidence Building", tr: "Özgüven İnşası", taskHint: tr ? "Part 1 günlük konularla başla — tanıdık sorular korkuyu azaltır." : "Start with Part 1 familiar topics — known subjects lower speaking anxiety quickly." },
    grammar: { en: "Grammar Accuracy", tr: "Dilbilgisi Doğruluğu", taskHint: tr ? "Part 3 tartışma soruları seni karmaşık yapı kurmaya zorlar." : "Try Part 3 discussion questions — they require complex structures you can drill." },
    pronunciation: { en: "Delivery & Clarity", tr: "Telaffuz ve Netlik", taskHint: tr ? "Her partta geri bildirim telaffuz puanını içerir — hepsinde çalış." : "Feedback scores your delivery every session — practice any part consistently." },
    fluency: { en: "Fluency & Flow", tr: "Akıcılık", taskHint: tr ? "Zamanlı Part 1 sorularıyla akıcılık drill'i yap — hız ve ritm gelişir." : "Timed Part 1 drills build rhythm and reduce hesitation fast." },
    structure: { en: "Coherence & Structure", tr: "Yapı ve Tutarlılık", taskHint: tr ? "Part 2 cue card hazırlık süresini yapı planlamak için kullan." : "Use Part 2 prep time to practice structuring your answer before speaking." }
  };

  function calcGap(level: string, target: number | null, examType: "IELTS" | "TOEFL") {
    if (!target || !level) return null;
    const current = examType === "IELTS" ? levelToIeltsScore[level] : levelToToeflScore[level];
    if (!current) return null;
    return { current, gap: Math.max(0, target - current) };
  }

  function weeksToTarget(gap: number, sessionsPerWeek: number, examType: "IELTS" | "TOEFL") {
    if (gap <= 0) return 0;
    const bandValue = examType === "IELTS" ? gap : gap / 3;
    const sessionsPerBand = 40;
    const totalSessions = bandValue * sessionsPerBand;
    return Math.ceil(totalSessions / Math.max(1, sessionsPerWeek));
  }

  function recommendedTask(examType: "IELTS" | "TOEFL", level: string) {
    const easy = ["A2", "B1"].includes(level);
    if (examType === "IELTS") return easy ? "IELTS Part 1 – Starter" : "IELTS Part 2 – Target";
    return easy ? "TOEFL Task 1 – Starter" : "TOEFL Task 2 – Target";
  }

  const studyDays = Array.isArray(form.studyDays) ? form.studyDays : [];

  if (planReady && savedProfile) {
    const p = savedProfile;
    const examType = p.preferredExamType;
    const gapData = calcGap(p.estimatedLevel ?? "", p.targetScore, examType);
    const weeks = gapData ? weeksToTarget(gapData.gap, p.weeklyGoal, examType) : null;
    const challengeFocus = p.biggestChallenge ? challengeToFocus[p.biggestChallenge] : null;
    const firstTask = recommendedTask(examType, p.estimatedLevel ?? "B1");
    const months = weeks ? (weeks >= 4 ? Math.round(weeks / 4.3) : null) : null;
    const timeStr = weeks === 0
      ? (tr ? "Hedefine çok yakınsın!" : "You're very close to your target!")
      : months
        ? (tr ? `~${months} ay` : `~${months} months`)
        : weeks
          ? (tr ? `~${weeks} hafta` : `~${weeks} weeks`)
          : "—";

    return (
      <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
        <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.8rem" }}>
          <span className="eyebrow">{tr ? "Planın hazır" : "Your plan is ready"}</span>
          <h1 style={{ margin: 0 }}>{tr ? "İşte kişisel yol haritanız" : "Here's your personalized roadmap"}</h1>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
            {tr
              ? "Verdiğin cevaplara göre sana özel bir plan oluşturduk. Şimdi ilk oturumuna başlayarak bu planı hayata geçir."
              : "Based on your answers, we've built a plan tailored to you. Start your first session to put it into action."}
          </p>
        </section>

        {gapData && (
          <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
            <strong style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
              {tr ? "Skor Analizi" : "Score Analysis"}
            </strong>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.6rem" }}>
              <div className="card" style={{ padding: "1rem", textAlign: "center", background: "var(--surface-strong)" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--muted)" }}>{gapData.current}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>{tr ? "Tahmini Mevcut" : "Est. Current"}</div>
              </div>
              <div className="card" style={{ padding: "1rem", textAlign: "center", background: "rgba(29,111,117,0.08)", border: "1px solid var(--sa-accent)" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--sa-accent)" }}>{gapData.gap > 0 ? `+${examType === "IELTS" ? gapData.gap.toFixed(1) : Math.round(gapData.gap)}` : "✓"}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--sa-accent)", marginTop: "0.2rem" }}>{tr ? "Kapatılacak Fark" : "Gap to Close"}</div>
              </div>
              <div className="card" style={{ padding: "1rem", textAlign: "center", background: "var(--surface-strong)" }}>
                <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)" }}>{p.targetScore ?? "—"}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "0.2rem" }}>{tr ? "Hedef Skor" : "Target Score"}</div>
              </div>
            </div>
            {weeks !== null && (
              <div style={{ padding: "0.75rem 1rem", background: "rgba(29,111,117,0.06)", borderRadius: 10, border: "1px solid rgba(29,111,117,0.15)" }}>
                <p style={{ margin: 0, fontSize: "0.88rem", lineHeight: 1.65 }}>
                  {tr
                    ? `Haftada ${p.weeklyGoal} oturum ile tahmini süre: `
                    : `At ${p.weeklyGoal} sessions/week, estimated time to target: `}
                  <strong style={{ color: "var(--sa-accent)" }}>{timeStr}</strong>
                </p>
              </div>
            )}
          </section>
        )}

        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <strong style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
            {tr ? "Öncelikli Odak Alanın" : "Your Priority Focus Area"}
          </strong>
          {challengeFocus ? (
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                <span style={{ fontSize: "1.3rem" }}>🎯</span>
                <strong style={{ color: "var(--sa-accent)" }}>{tr ? challengeFocus.tr : challengeFocus.en}</strong>
              </div>
              <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.65 }}>{challengeFocus.taskHint}</p>
            </div>
          ) : (
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.88rem" }}>
              {tr ? "Dengeli gelişim için tüm partlarda pratik yapmanı öneririz." : "We recommend practicing across all parts for balanced improvement."}
            </p>
          )}
        </section>

        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <strong style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
            {tr ? "Önerilen Başlangıç" : "Recommended First Session"}
          </strong>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <span style={{ fontSize: "1.5rem" }}>🎤</span>
            <div>
              <strong style={{ fontSize: "0.95rem" }}>{firstTask}</strong>
              <p style={{ margin: "0.2rem 0 0", color: "var(--muted)", fontSize: "0.83rem" }}>
                {tr
                  ? "Seviyene uygun, güven inşa eden bir başlangıç noktası."
                  : "A confidence-building starting point matched to your level."}
              </p>
            </div>
          </div>
        </section>

        <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.7rem" }}>
          <strong style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
            {tr ? "Haftalık Programın" : "Your Weekly Schedule"}
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            {[
              { label: tr ? "Oturum / hafta" : "Sessions / week", value: p.weeklyGoal },
              { label: tr ? "Günlük dakika" : "Daily minutes", value: p.dailyMinutesGoal ?? 15 },
              { label: tr ? "Sınav tipi" : "Exam type", value: examType },
              { label: tr ? "Öğrenme tercihi" : "Learning style", value: p.learningStyle || "—" }
            ].map((item) => (
              <div key={item.label} style={{ padding: "0.65rem 0.9rem", background: "var(--surface-strong)", borderRadius: 10 }}>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{item.label}</div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", marginTop: "0.15rem" }}>{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="button button-primary"
            onClick={() => router.push("/app/practice")}
            style={{ flex: 1 }}
          >
            {tr ? "İlk oturumu başlat →" : "Start first session →"}
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => router.push("/app")}
          >
            {tr ? "Dashboard'a git" : "Go to dashboard"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>

      {/* HEADER */}
      <section className="card" style={{ padding: "1.4rem", display: "grid", gap: "0.8rem" }}>
        <span className="eyebrow">{tr ? "İlk kurulum" : "First-time setup"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Sana özel programını oluşturalım" : "Let's build your personalized plan"}</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
          {tr
            ? "Sadece 2 dakikanı ayır. Verdiğin cevaplar dashboard önerilerini ve yol haritanı kişiselleştirir."
            : "Just 2 minutes. Your answers personalize your dashboard, recommendations, and roadmap."}
        </p>
      </section>

      {/* PROGRESS BAR */}
      <section className="card" style={{ padding: "1.2rem", display: "grid", gap: "1rem" }}>
        <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
          {steps.map((s, i) => {
            const num = i + 1;
            const done = num < step;
            const active = num === step;
            return (
              <div key={num} style={{ display: "flex", alignItems: "center", flex: active ? 2 : 1, gap: "0.3rem" }}>
                <div
                  style={{
                    width: active ? "auto" : 28,
                    height: 28,
                    minWidth: 28,
                    borderRadius: 99,
                    background: done ? "var(--sa-accent)" : active ? "rgba(29,111,117,0.15)" : "var(--surface-strong)",
                    border: active ? "1.5px solid var(--sa-accent)" : done ? "none" : "1px solid var(--line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    padding: active ? "0 0.75rem" : undefined,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    color: done ? "#fff" : active ? "var(--sa-accent)" : "var(--muted)",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s ease"
                  }}
                >
                  {done ? "✓" : null}
                  {!done && <span>{num}</span>}
                  {active ? <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>{s.title}</span> : null}
                </div>
                {num < TOTAL_STEPS ? (
                  <div style={{ height: 2, flex: 1, background: done ? "var(--sa-accent)" : "var(--line)", borderRadius: 2 }} />
                ) : null}
              </div>
            );
          })}
        </div>

        {/* STEP CONTENT */}
        <div style={{ display: "grid", gap: "0.9rem" }}>

          {/* STEP 1 – EXAM GOAL */}
          {step === 1 ? (
            <>
              <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.58)", display: "grid", gap: "0.35rem" }}>
                <strong>{tr ? "Hangi sınava hazırlanıyorsun?" : "What's your exam goal?"}</strong>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.65, fontSize: "0.88rem" }}>
                  {tr
                    ? "Sınav tipi ve hedef skorun, sana özel sorular ve zorluk seviyeleri seçmemizi sağlar."
                    : "Your exam type and target score let us pick the right questions and difficulty for you."}
                </p>
              </div>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span>{tr ? "Sınav tipi" : "Exam type"}</span>
                <select
                  value={form.preferredExamType}
                  onChange={(e) => setForm((c) => ({ ...c, preferredExamType: e.target.value as "IELTS" | "TOEFL" }))}
                  className="practice-select"
                >
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span>{tr ? "Hedef skor" : "Target score"}</span>
                <input
                  value={form.targetScore ?? ""}
                  onChange={(e) => setForm((c) => ({ ...c, targetScore: e.target.value ? Number(e.target.value) : null }))}
                  type="number"
                  min="1"
                  max={form.preferredExamType === "IELTS" ? "9" : "30"}
                  step="0.1"
                  placeholder={form.preferredExamType === "IELTS" ? "Örn: 7.0" : "Örn: 24"}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span>{tr ? "Sınav tarihi (isteğe bağlı)" : "Exam date (optional)"}</span>
                <input
                  value={form.examDate ?? ""}
                  onChange={(e) => setForm((c) => ({ ...c, examDate: e.target.value }))}
                  placeholder={tr ? "Örn: Haziran 2025" : "Ex: June 2025"}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span>{tr ? "Bu skoru neden istiyorsun?" : "Why do you need this score?"}</span>
                <input
                  value={form.targetReason ?? ""}
                  onChange={(e) => setForm((c) => ({ ...c, targetReason: e.target.value }))}
                  placeholder={tr ? "Üniversite, iş, vize, kişisel hedef…" : "University, job, visa, personal goal…"}
                  style={inputStyle}
                />
              </label>
            </>
          ) : null}

          {/* STEP 2 – ENGLISH BACKGROUND */}
          {step === 2 ? (
            <>
              <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.58)", display: "grid", gap: "0.35rem" }}>
                <strong>{tr ? "İngilizce geçmişin nasıl?" : "What's your English background?"}</strong>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.65, fontSize: "0.88rem" }}>
                  {tr
                    ? "Bu bilgi, sana en uygun egzersiz türlerini ve başlangıç noktasını belirler."
                    : "This helps us match you with the right exercise types and starting point."}
                </p>
              </div>
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {englishBackgroundOptions.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    desc={opt.desc}
                    microcopy={opt.microcopy}
                    selected={form.englishBackground === opt.value}
                    onSelect={(v) => setForm((c) => ({ ...c, englishBackground: v }))}
                  />
                ))}
              </div>
            </>
          ) : null}

          {/* STEP 3 – BIGGEST CHALLENGE */}
          {step === 3 ? (
            <>
              <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.58)", display: "grid", gap: "0.35rem" }}>
                <strong>{tr ? "Konuşurken seni en çok ne zorluyor?" : "What's your biggest speaking challenge?"}</strong>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.65, fontSize: "0.88rem" }}>
                  {tr
                    ? "Dürüst cevap en iyi. Bu seçim, dashboard'un ilk görev önerisini ve odak alanını belirler."
                    : "Be honest — this shapes your first task recommendation and focus area on the dashboard."}
                </p>
              </div>
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {biggestChallengeOptions.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    desc={opt.desc}
                    microcopy={opt.microcopy}
                    selected={form.biggestChallenge === opt.value}
                    onSelect={(v) => setForm((c) => ({ ...c, biggestChallenge: v }))}
                  />
                ))}
              </div>
            </>
          ) : null}

          {/* STEP 4 – LEVEL ESTIMATION */}
          {step === 4 ? (
            <>
              <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.58)", display: "grid", gap: "0.35rem" }}>
                <strong>{tr ? "Mevcut İngilizce seviyeni kendin nasıl değerlendirirsin?" : "How would you rate your current English level?"}</strong>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.65, fontSize: "0.88rem" }}>
                  {tr
                    ? "Bu tahmini seviye, yol haritanı hedefine göre kalibre eder. İlk deneme sonrasında otomatik güncellenir."
                    : "This calibrates your roadmap gap to your target. It will auto-update after your first session."}
                </p>
              </div>
              <div style={{ display: "grid", gap: "0.55rem" }}>
                {estimatedLevelOptions.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    value={opt.value}
                    label={opt.label}
                    desc={opt.desc}
                    microcopy={opt.microcopy}
                    selected={form.estimatedLevel === opt.value}
                    onSelect={(v) => setForm((c) => ({ ...c, estimatedLevel: v }))}
                  />
                ))}
              </div>
            </>
          ) : null}

          {/* STEP 5 – STUDY RHYTHM */}
          {step === 5 ? (
            <>
              <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.58)", display: "grid", gap: "0.35rem" }}>
                <strong>{tr ? "Çalışma ritmin nasıl olacak?" : "How will you study?"}</strong>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.65, fontSize: "0.88rem" }}>
                  {tr
                    ? "Gerçekçi bir plan belirle. Az ama düzenli, çok ama dağınıktan her zaman daha iyidir."
                    : "Set a realistic plan. Consistent and small always beats big and scattered."}
                </p>
              </div>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span>{tr ? "Haftada kaç speaking oturumu?" : "Speaking sessions per week"}</span>
                <input
                  value={form.weeklyGoal}
                  onChange={(e) => setForm((c) => ({ ...c, weeklyGoal: Number(e.target.value) || 4 }))}
                  type="number" min="1" max="14"
                  placeholder={tr ? "Haftalık hedef" : "Weekly goal"}
                  style={inputStyle}
                />
              </label>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span>{tr ? "Günde kaç dakika ayırabilirsin?" : "Minutes of study per day"}</span>
                <input
                  value={form.dailyMinutesGoal ?? 15}
                  onChange={(e) => setForm((c) => ({ ...c, dailyMinutesGoal: Number(e.target.value) || 15 }))}
                  type="number" min="5" max="60"
                  placeholder={tr ? "Günlük dakika" : "Daily minutes"}
                  style={inputStyle}
                />
              </label>
              <div style={{ display: "grid", gap: "0.45rem" }}>
                <span style={{ fontSize: "0.9rem" }}>{tr ? "Hangi günler çalışacaksın?" : "Which days will you study?"}</span>
                <div style={{ display: "flex", gap: "0.45rem", flexWrap: "wrap" }}>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                    const active = studyDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        className="button button-secondary"
                        style={{ background: active ? "rgba(29, 111, 117, 0.12)" : undefined, border: active ? "1px solid var(--sa-accent)" : undefined }}
                        onClick={() =>
                          setForm((c) => ({
                            ...c,
                            studyDays: active ? studyDays.filter((d) => d !== day) : [...studyDays, day]
                          }))
                        }
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: "grid", gap: "0.45rem" }}>
                <span style={{ fontSize: "0.9rem" }}>{tr ? "Nasıl öğrenmeyi tercih edersin?" : "How do you prefer to learn?"}</span>
                <div style={{ display: "grid", gap: "0.5rem" }}>
                  {learningStyleOptions.map((opt) => (
                    <OptionCard
                      key={opt.value}
                      value={opt.value}
                      label={opt.label}
                      desc={opt.desc}
                      microcopy={opt.microcopy}
                      selected={form.learningStyle === opt.value}
                      onSelect={(v) => setForm((c) => ({ ...c, learningStyle: v }))}
                    />
                  ))}
                </div>
              </div>
              <label style={{ display: "grid", gap: "0.35rem" }}>
                <span>{tr ? "En çok odaklanmak istediğin skill" : "Skill you want to focus on most"}</span>
                <input
                  value={form.focusSkill}
                  onChange={(e) => setForm((c) => ({ ...c, focusSkill: e.target.value }))}
                  placeholder={tr ? "Akıcılık, telaffuz, kelime hazinesi, yapı…" : "Fluency, pronunciation, vocabulary, structure…"}
                  style={inputStyle}
                />
              </label>

              {/* SUMMARY */}
              <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.5rem" }}>
                <strong>{tr ? "Planın özeti" : "Your plan summary"}</strong>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7, fontSize: "0.88rem" }}>
                  {tr
                    ? `${form.preferredExamType} · Hedef: ${form.targetScore ?? "—"} · Haftada ${form.weeklyGoal} oturum · Günde ${form.dailyMinutesGoal ?? 15} dk`
                    : `${form.preferredExamType} · Target: ${form.targetScore ?? "—"} · ${form.weeklyGoal} sessions/week · ${form.dailyMinutesGoal ?? 15} min/day`}
                </p>
                {form.estimatedLevel ? (
                  <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6, fontSize: "0.85rem" }}>
                    {tr
                      ? `Tahmini seviye: ${form.estimatedLevel} · Öğrenme tercihi: ${form.learningStyle || "—"}`
                      : `Estimated level: ${form.estimatedLevel} · Learning style: ${form.learningStyle || "—"}`}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

        </div>

        {/* NAVIGATION */}
        <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "0.2rem" }}>
          {step > 1 ? (
            <button type="button" className="button button-secondary" onClick={() => setStep((s) => s - 1)}>
              {tr ? "Geri" : "Back"}
            </button>
          ) : null}
          {step < TOTAL_STEPS ? (
            <button type="button" className="button button-primary" onClick={() => setStep((s) => s + 1)}>
              {tr ? "Devam et →" : "Continue →"}
            </button>
          ) : (
            <button type="button" className="button button-primary" onClick={save}>
              {tr ? "Programımı oluştur" : "Create my plan"}
            </button>
          )}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem" }}
              onClick={() => setStep((s) => s + 1)}
            >
              {tr ? "Bu adımı atla" : "Skip this step"}
            </button>
          ) : null}
        </div>
        {notice ? <p style={{ margin: 0, color: "var(--success)" }}>{notice}</p> : null}
        {error ? <p style={{ margin: 0, color: "var(--accent-deep)" }}>{error}</p> : null}
      </section>
    </main>
  );
}

const inputStyle = {
  padding: "0.9rem",
  borderRadius: 14,
  border: "1px solid var(--line)"
} as const;

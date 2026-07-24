"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { Check, Clock3, Sparkles, Target } from "lucide-react";
import { TrackedLink } from "@/components/tracked-link";
import { useAppState } from "@/components/providers";
import {
  buildPlanCheckoutPath,
  commerceConfig,
  commerceNumbers,
  formatUsd,
  getAnnualMonthlyEquivalent
} from "@/lib/commerce";
import type { StudentProfile as StudentProfileType } from "@/lib/types";

const TOTAL_STEPS = 3;

type FormState = StudentProfileType & {
  englishBackground: string;
  biggestChallenge: string;
  estimatedLevel: string;
  learningStyle: string;
};

type Choice = {
  value: string;
  label: string;
  desc: string;
};

type OnboardingDraft = {
  step: number;
  form: FormState;
  updatedAt: string;
};

function buildInitialForm(profile: StudentProfileType): FormState {
  return {
    ...profile,
    studyDays: Array.isArray(profile.studyDays) ? profile.studyDays.map(String) : [],
    englishBackground: profile.englishBackground ?? "",
    biggestChallenge: profile.biggestChallenge ?? "",
    estimatedLevel: profile.estimatedLevel ?? "",
    learningStyle: profile.learningStyle ?? ""
  };
}

function getDraftKey(userId: string) {
  return `speakace:onboarding:${userId}`;
}

function OptionCard({
  option,
  selected,
  onSelect
}: {
  option: Choice;
  selected: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <button
      type="button"
      className={`inside-choice${selected ? " is-selected" : ""}`}
      aria-pressed={selected}
      onClick={() => onSelect(option.value)}
    >
      <strong>{option.label}</strong>
      <span>{option.desc}</span>
    </button>
  );
}

export function OnboardingWizard({ profile }: { profile: StudentProfileType }) {
  const router = useRouter();
  const { currentUser, language } = useAppState();
  const tr = language === "tr";
  const [form, setForm] = useState<FormState>(() => buildInitialForm(profile));
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [planReady, setPlanReady] = useState(false);
  const [savedProfile, setSavedProfile] = useState<StudentProfileType | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);

  const steps = [
    { title: tr ? "Hedefin" : "Your target" },
    { title: tr ? "Başlangıç noktan" : "Starting point" },
    { title: tr ? "Çalışma ritmin" : "Study rhythm" }
  ];

  const estimatedLevelOptions: Choice[] = [
    {
      value: "A2",
      label: tr ? "A2 · Başlangıç" : "A2 · Beginner",
      desc: tr ? "Temel cümleler kurabiliyorum, konuşmak hâlâ zor." : "I can form basic sentences, but speaking is still hard."
    },
    {
      value: "B1",
      label: tr ? "B1 · Orta" : "B1 · Intermediate",
      desc: tr ? "Basit konuşmaları sürdürüyorum fakat sık hata yapıyorum." : "I can hold simple conversations but still make frequent mistakes."
    },
    {
      value: "B2",
      label: tr ? "B2 · Orta ileri" : "B2 · Upper-intermediate",
      desc: tr ? "Kendimi anlatabiliyorum, akıcılık ve doğruluk eksik." : "I can express ideas, but fluency and accuracy are inconsistent."
    },
    {
      value: "C1",
      label: tr ? "C1 · İleri" : "C1 · Advanced",
      desc: tr ? "Akıcıyım; sınav formatı ve ince ayara ihtiyacım var." : "I am fluent and mainly need exam strategy and fine-tuning."
    },
    {
      value: "C1+",
      label: tr ? "C1+ · Neredeyse akıcı" : "C1+ · Near-fluent",
      desc: tr ? "Hedefim üst band ve sınav performansını kusursuzlaştırmak." : "My goal is a top score and polished exam performance."
    }
  ];

  const biggestChallengeOptions: Choice[] = [
    {
      value: "vocabulary",
      label: tr ? "Kelime bulamıyorum" : "I run out of words",
      desc: tr ? "Cümle ortasında doğru kelime aklıma gelmiyor." : "The right word disappears in the middle of an answer."
    },
    {
      value: "anxiety",
      label: tr ? "Baskı altında donuyorum" : "I freeze under pressure",
      desc: tr ? "Heyecanlandığımda düşüncelerimi toparlayamıyorum." : "Nerves take over and I lose my train of thought."
    },
    {
      value: "grammar",
      label: tr ? "Gramer hataları yapıyorum" : "Grammar breaks down",
      desc: tr ? "Zamanları ve karmaşık yapıları konuşurken karıştırıyorum." : "Tenses and complex structures become unreliable when I speak."
    },
    {
      value: "pronunciation",
      label: tr ? "Telaffuzum net değil" : "My pronunciation is unclear",
      desc: tr ? "Vurgu, ritim veya seslerin anlaşılmasını istiyorum." : "I need clearer sounds, stress, and speaking rhythm."
    },
    {
      value: "fluency",
      label: tr ? "Çok duraklıyorum" : "I pause too often",
      desc: tr ? "Cevabımda sessizlik ve filler kelimeler artıyor." : "Silence and filler words interrupt my answers."
    },
    {
      value: "structure",
      label: tr ? "Cevabımı düzenleyemiyorum" : "My answers lack structure",
      desc: tr ? "Fikrim var fakat net bir başlangıç ve sonuç kuramıyorum." : "I have ideas but struggle to shape a clear beginning and ending."
    }
  ];

  const learningStyleOptions: Choice[] = [
    {
      value: "practice-first",
      label: tr ? "Önce pratik" : "Practice first",
      desc: tr ? "Hemen dener, geri bildirimden öğrenirim." : "I learn fastest by trying first and reviewing feedback."
    },
    {
      value: "theory-first",
      label: tr ? "Önce yöntem" : "Method first",
      desc: tr ? "Çerçeveyi anladıktan sonra uygulamak isterim." : "I prefer understanding the framework before applying it."
    },
    {
      value: "feedback-driven",
      label: tr ? "Derin analiz" : "Deep feedback",
      desc: tr ? "Raporları inceleyip tek bir zayıflığı hedeflerim." : "I like studying reports and targeting one weakness at a time."
    }
  ];

  const save = async () => {
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, onboardingComplete: true })
      });
      const data = (await response.json()) as { profile?: StudentProfileType; error?: string };
      if (!response.ok || !data.profile) {
        setError(data.error ?? (tr ? "Planın kaydedilemedi." : "Could not save your plan."));
        return;
      }
      posthog.capture("onboarding_completed", {
        exam_type: data.profile.preferredExamType,
        target_score: data.profile.targetScore,
        weekly_goal: data.profile.weeklyGoal,
        focus_skill: data.profile.focusSkill,
        biggest_challenge: data.profile.biggestChallenge,
        estimated_level: data.profile.estimatedLevel
      });
      if (currentUser?.id) {
        window.localStorage.removeItem(getDraftKey(currentUser.id));
      }
      setSavedProfile(data.profile);
      setPlanReady(true);
    } catch {
      setError(tr ? "Plan oluşturulurken bağlantı hatası oluştu." : "A connection error occurred while creating your plan.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.id || draftLoaded) return;

    try {
      const rawDraft = window.localStorage.getItem(getDraftKey(currentUser.id));
      if (rawDraft) {
        const draft = JSON.parse(rawDraft) as Partial<OnboardingDraft>;
        const updatedAt = typeof draft.updatedAt === "string" ? Date.parse(draft.updatedAt) : NaN;
        const isRecent =
          Number.isFinite(updatedAt) &&
          Date.now() - updatedAt < 30 * 24 * 60 * 60 * 1000;

        if (isRecent && draft.form && typeof draft.form === "object") {
          setForm({
            ...buildInitialForm(profile),
            ...draft.form,
            studyDays: Array.isArray(draft.form.studyDays) ? draft.form.studyDays.map(String) : []
          });
          if (typeof draft.step === "number") {
            setStep(Math.min(TOTAL_STEPS, Math.max(1, Math.round(draft.step))));
          }
        }
      }
    } catch {
      window.localStorage.removeItem(getDraftKey(currentUser.id));
    } finally {
      setDraftLoaded(true);
    }
  }, [currentUser?.id, draftLoaded, profile]);

  useEffect(() => {
    if (!currentUser?.id || !draftLoaded || planReady) return;

    const draft: OnboardingDraft = {
      step,
      form,
      updatedAt: new Date().toISOString()
    };
    window.localStorage.setItem(getDraftKey(currentUser.id), JSON.stringify(draft));
  }, [currentUser?.id, draftLoaded, form, planReady, step]);

  useEffect(() => {
    if (!planReady || currentUser?.plan !== "free" || !savedProfile) return;
    posthog.capture("upgrade_prompt_view", {
      source: "onboarding_plan_ready",
      weekly_goal: savedProfile.weeklyGoal,
      exam_type: savedProfile.preferredExamType,
      target_score: savedProfile.targetScore
    });
  }, [currentUser?.plan, planReady, savedProfile]);

  useEffect(() => {
    if (planReady) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [planReady]);

  const studyDays = Array.isArray(form.studyDays) ? form.studyDays : [];
  const canContinue =
    step === 1
      ? Boolean(form.preferredExamType && form.targetScore)
      : step === 2
        ? Boolean(form.estimatedLevel && form.biggestChallenge)
        : true;

  if (planReady && savedProfile) {
    return <ReadyPlan profile={savedProfile} tr={tr} currentPlan={currentUser?.plan} onDashboard={() => router.push("/app")} />;
  }

  const stepHeadings = [
    {
      title: tr ? "Önce varış noktasını seç" : "Start with the destination",
      body: tr ? "Hedef skor ve tarih, sana gereksiz içerik değil doğru zorlukta pratik önermemizi sağlar." : "Your score target and date help us recommend the right difficulty instead of generic practice."
    },
    {
      title: tr ? "Bugün nerede olduğunu söyle" : "Tell us where you are today",
      body: tr ? "Kısa bir öz değerlendirme yeterli. İlk skorlu denemenden sonra bu tahmini gerçek verilerle güncelleyeceğiz." : "A quick self-assessment is enough. Your first scored attempt will replace this estimate with real data."
    },
    {
      title: tr ? "Sürdürebileceğin ritmi kur" : "Build a rhythm you can keep",
      body: tr ? "Mükemmel program değil, sınav gününe kadar tekrar edebileceğin küçük bir sistem kuruyoruz." : "We are not building a perfect schedule, just a small system you can repeat until exam day."
    }
  ];
  const currentHeading = stepHeadings[step - 1];

  return (
    <main className="page-shell section inside-page inside-onboarding">
      <div className="inside-onboarding-shell">
        <aside className="inside-onboarding-aside">
          <div>
            <span className="inside-kicker">{tr ? "SpeakAce kurulumu" : "SpeakAce setup"}</span>
            <h1>{tr ? "İlk pratiğini sana göre hazırlayalım." : "Let’s tailor your first practice."}</h1>
          </div>
          <div className="inside-onboarding-steps" aria-label={tr ? "Kurulum adımları" : "Setup steps"}>
            {steps.map((item, index) => {
              const number = index + 1;
              const complete = number < step;
              const active = number === step;
              return (
                <div key={item.title} className={`inside-onboarding-step${active ? " is-active" : complete ? " is-complete" : ""}`}>
                  <span>{complete ? <Check size={14} /> : number}</span>
                  <span>{item.title}</span>
                </div>
              );
            })}
          </div>
          <p className="inside-onboarding-note">
            <Clock3 size={14} style={{ verticalAlign: "middle", marginRight: "0.35rem" }} />
            {tr ? "Yaklaşık 2 dakika. Bütün cevaplarını daha sonra profilden değiştirebilirsin." : "About 2 minutes. You can change every answer later from your profile."}
          </p>
        </aside>

        <section className="inside-onboarding-content">
          <div className="inside-onboarding-head">
            <span className="inside-kicker">{tr ? `Adım ${step} / ${TOTAL_STEPS}` : `Step ${step} of ${TOTAL_STEPS}`}</span>
            <h2>{currentHeading.title}</h2>
            <p>{currentHeading.body}</p>
          </div>

          {step === 1 ? (
            <div className="inside-form-stack">
              <div className="inside-field">
                <span className="inside-field-label">{tr ? "Sınav türü" : "Exam type"}</span>
                <div className="inside-choice-grid">
                  {(["IELTS", "TOEFL"] as const).map((exam) => (
                    <button
                      key={exam}
                      type="button"
                      className={`inside-choice${form.preferredExamType === exam ? " is-selected" : ""}`}
                      aria-pressed={form.preferredExamType === exam}
                      onClick={() => setForm((current) => ({ ...current, preferredExamType: exam }))}
                    >
                      <strong>{exam}</strong>
                      <span>{exam === "IELTS" ? (tr ? "Band 1–9" : "Band scale 1–9") : (tr ? "Speaking task 0–30" : "Speaking task scale 0–30")}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="inside-form-grid">
                <label className="inside-field">
                  <span className="inside-field-label">{tr ? "Hedef skor" : "Target score"}</span>
                  <span className="inside-field-help">{tr ? "Ulaşmak istediğin yaklaşık skor." : "The approximate score you need."}</span>
                  <input
                    value={form.targetScore ?? ""}
                    onChange={(event) => setForm((current) => ({ ...current, targetScore: event.target.value ? Number(event.target.value) : null }))}
                    type="number"
                    min="1"
                    max={form.preferredExamType === "IELTS" ? "9" : "30"}
                    step="0.1"
                    placeholder={form.preferredExamType === "IELTS" ? "6.5" : "24"}
                  />
                </label>
                <label className="inside-field">
                  <span className="inside-field-label">{tr ? "Sınav tarihi" : "Exam date"}</span>
                  <span className="inside-field-help">{tr ? "İsteğe bağlı, yaklaşık tarih olabilir." : "Optional, an approximate date is fine."}</span>
                  <input value={form.examDate ?? ""} onChange={(event) => setForm((current) => ({ ...current, examDate: event.target.value }))} placeholder={tr ? "Örn. Haziran 2026" : "Example: June 2026"} />
                </label>
                <label className="inside-field is-wide">
                  <span className="inside-field-label">{tr ? "Bu skor neden önemli?" : "Why does this score matter?"}</span>
                  <span className="inside-field-help">{tr ? "Bu cevap motivasyon mesajlarını daha anlamlı yapar." : "This makes your progress prompts more relevant."}</span>
                  <input value={form.targetReason ?? ""} onChange={(event) => setForm((current) => ({ ...current, targetReason: event.target.value }))} placeholder={tr ? "Üniversite, iş, vize, kişisel hedef…" : "University, work, visa, personal goal…"} />
                </label>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="inside-form-stack">
              <div className="inside-field">
                <span className="inside-field-label">{tr ? "Tahmini İngilizce seviyen" : "Estimated English level"}</span>
                <span className="inside-field-help">{tr ? "Mükemmel tahmin etmen gerekmiyor." : "It does not need to be exact."}</span>
                <div className="inside-choice-grid">
                  {estimatedLevelOptions.map((option) => (
                    <OptionCard key={option.value} option={option} selected={form.estimatedLevel === option.value} onSelect={(value) => setForm((current) => ({ ...current, estimatedLevel: value }))} />
                  ))}
                </div>
              </div>
              <div className="inside-field">
                <span className="inside-field-label">{tr ? "Konuşurken en büyük engelin" : "Your biggest speaking barrier"}</span>
                <span className="inside-field-help">{tr ? "İlk haftanın ana egzersizini bu seçim belirler." : "This choice sets the main drill for your first week."}</span>
                <div className="inside-choice-grid">
                  {biggestChallengeOptions.map((option) => (
                    <OptionCard key={option.value} option={option} selected={form.biggestChallenge === option.value} onSelect={(value) => setForm((current) => ({ ...current, biggestChallenge: value }))} />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="inside-form-stack">
              <div className="inside-form-grid">
                <label className="inside-field">
                  <span className="inside-field-label">{tr ? "Haftalık speaking denemesi" : "Speaking attempts per week"}</span>
                  <span className="inside-field-help">{tr ? "1–14 arasında gerçekçi bir hedef." : "A realistic target between 1 and 14."}</span>
                  <input value={form.weeklyGoal} onChange={(event) => setForm((current) => ({ ...current, weeklyGoal: Number(event.target.value) || 4 }))} type="number" min="1" max="14" />
                </label>
                <label className="inside-field">
                  <span className="inside-field-label">{tr ? "Günlük dakika" : "Minutes per day"}</span>
                  <span className="inside-field-help">{tr ? "5 dakika bile iyi bir başlangıç." : "Even 5 minutes is a useful start."}</span>
                  <input value={form.dailyMinutesGoal ?? 15} onChange={(event) => setForm((current) => ({ ...current, dailyMinutesGoal: Number(event.target.value) || 15 }))} type="number" min="5" max="60" />
                </label>
              </div>
              <div className="inside-field">
                <span className="inside-field-label">{tr ? "Çalışacağın günler" : "Your study days"}</span>
                <div className="inside-day-picker">
                  {[
                    { key: "Mon", tr: "Pzt" },
                    { key: "Tue", tr: "Sal" },
                    { key: "Wed", tr: "Çar" },
                    { key: "Thu", tr: "Per" },
                    { key: "Fri", tr: "Cum" },
                    { key: "Sat", tr: "Cmt" },
                    { key: "Sun", tr: "Paz" }
                  ].map((day) => {
                    const active = studyDays.includes(day.key);
                    return (
                      <button
                        key={day.key}
                        type="button"
                        className={`inside-day${active ? " is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => setForm((current) => ({ ...current, studyDays: active ? studyDays.filter((item) => item !== day.key) : [...studyDays, day.key] }))}
                      >
                        {tr ? day.tr : day.key}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="inside-field">
                <span className="inside-field-label">{tr ? "Nasıl öğrenmek istersin?" : "How do you prefer to learn?"}</span>
                <div className="inside-choice-grid">
                  {learningStyleOptions.map((option) => (
                    <OptionCard key={option.value} option={option} selected={form.learningStyle === option.value} onSelect={(value) => setForm((current) => ({ ...current, learningStyle: value }))} />
                  ))}
                </div>
              </div>
              <label className="inside-field">
                <span className="inside-field-label">{tr ? "Özel bir odak ekle" : "Add a custom focus"}</span>
                <span className="inside-field-help">{tr ? "Boş bırakırsan en büyük engeline göre otomatik seçeriz." : "Leave it blank and we will infer it from your biggest barrier."}</span>
                <input value={form.focusSkill} onChange={(event) => setForm((current) => ({ ...current, focusSkill: event.target.value }))} placeholder={tr ? "Akıcılık, telaffuz, yapı…" : "Fluency, pronunciation, structure…"} />
              </label>
              <div className="inside-callout">
                <strong>{tr ? "Plan özeti" : "Plan summary"}</strong>
                <p>
                  {tr
                    ? `${form.preferredExamType} · Hedef ${form.targetScore ?? "—"} · Haftada ${form.weeklyGoal} deneme · Günde ${form.dailyMinutesGoal ?? 15} dakika`
                    : `${form.preferredExamType} · Target ${form.targetScore ?? "—"} · ${form.weeklyGoal} attempts/week · ${form.dailyMinutesGoal ?? 15} minutes/day`}
                </p>
              </div>
            </div>
          ) : null}

          {error ? <p className="inside-feedback is-error">{error}</p> : null}

          <div className="inside-onboarding-actions">
            {step > 1 ? (
              <button type="button" className="button button-secondary" onClick={() => setStep((current) => current - 1)}>
                {tr ? "Geri" : "Back"}
              </button>
            ) : (
              <span />
            )}
            {step < TOTAL_STEPS ? (
              <button type="button" className="button button-primary" disabled={!canContinue} onClick={() => setStep((current) => current + 1)}>
                {tr ? "Devam et" : "Continue"}
              </button>
            ) : (
              <button type="button" className="button button-primary" onClick={save} disabled={saving}>
                <Sparkles size={16} />
                {saving ? (tr ? "Plan oluşturuluyor…" : "Creating plan…") : (tr ? "Planımı oluştur" : "Create my plan")}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function ReadyPlan({
  profile,
  tr,
  currentPlan,
  onDashboard
}: {
  profile: StudentProfileType;
  tr: boolean;
  currentPlan?: string;
  onDashboard: () => void;
}) {
  const levelToIeltsScore: Record<string, number> = { A2: 4, B1: 5, B2: 6.5, C1: 7.5, "C1+": 8.5 };
  const levelToToeflScore: Record<string, number> = { A2: 10, B1: 15, B2: 20, C1: 26, "C1+": 29 };
  const level = profile.estimatedLevel ?? "";
  const current = profile.preferredExamType === "IELTS" ? levelToIeltsScore[level] : levelToToeflScore[level];
  const gap = current && profile.targetScore ? Math.max(0, profile.targetScore - current) : null;
  const normalizedGap = profile.preferredExamType === "IELTS" ? gap : gap === null ? null : gap / 3;
  const weeks = normalizedGap === null ? null : normalizedGap <= 0 ? 0 : Math.ceil((normalizedGap * 40) / Math.max(1, profile.weeklyGoal));
  const shouldRecommendAnnual = (weeks !== null && weeks >= 10) || profile.weeklyGoal >= 4;
  const recommendedBilling = shouldRecommendAnnual ? "annual" : "weekly";
  const recommendedCheckoutPath = buildPlanCheckoutPath({
    plan: "plus",
    billing: recommendedBilling,
    campaign: `onboarding_plan_ready_${recommendedBilling}`
  });
  const annualMonthlyEquivalent = getAnnualMonthlyEquivalent(commerceNumbers.plusAnnualPrice);
  const focusLabels: Record<string, { tr: string; en: string; hintTr: string; hintEn: string }> = {
    vocabulary: { tr: "Kelime zenginliği", en: "Lexical resource", hintTr: "Bir fikri neden ve örnekle genişlet.", hintEn: "Expand one idea with a reason and example." },
    anxiety: { tr: "Özgüven", en: "Confidence", hintTr: "Tanıdık konularda kısa cevaplarla başla.", hintEn: "Start with short answers on familiar topics." },
    grammar: { tr: "Dilbilgisi doğruluğu", en: "Grammar accuracy", hintTr: "Her cevapta tek bir karmaşık yapıyı hedefle.", hintEn: "Target one complex structure in each answer." },
    pronunciation: { tr: "Telaffuz ve netlik", en: "Delivery and clarity", hintTr: "Kaydından tek bir cümleyi daha net tekrar et.", hintEn: "Replay and repeat one sentence more clearly." },
    fluency: { tr: "Akıcılık", en: "Fluency", hintTr: "Kısa zamanlı tekrarlarla duraklamayı azalt.", hintEn: "Use short timed retries to reduce pauses." },
    structure: { tr: "Yapı ve tutarlılık", en: "Structure and coherence", hintTr: "Cevaptan önce üç maddelik iskelet çıkar.", hintEn: "Create a three-point outline before answering." }
  };
  const focus = focusLabels[profile.biggestChallenge ?? ""] ?? {
    tr: profile.focusSkill || "Dengeli gelişim",
    en: profile.focusSkill || "Balanced improvement",
    hintTr: "İlk skorundan sonra odağın otomatik güncellenecek.",
    hintEn: "Your focus will update after your first scored attempt."
  };
  const firstTask = profile.preferredExamType === "IELTS"
    ? ["A2", "B1"].includes(level) ? "IELTS Part 1 · Starter" : "IELTS Part 2 · Target"
    : ["A2", "B1"].includes(level) ? "TOEFL Task 1 · Starter" : "TOEFL Task 2 · Target";
  const timeLabel = weeks === null
    ? "—"
    : weeks === 0
      ? (tr ? "Hedefe yakın" : "Near target")
      : weeks >= 4
        ? (tr ? `~${Math.round(weeks / 4.3)} ay` : `~${Math.round(weeks / 4.3)} months`)
        : (tr ? `~${weeks} hafta` : `~${weeks} weeks`);

  return (
    <main className="page-shell section inside-page inside-onboarding">
      <header className="inside-header inside-plan-hero">
        <div className="inside-header-main">
          <span className="inside-kicker">{tr ? "Planın hazır" : "Your plan is ready"}</span>
          <h1 className="inside-title">{tr ? "İlk haftan tek bir net odakla başlıyor." : "Your first week starts with one clear focus."}</h1>
          <p className="inside-lede">
            {tr ? `${firstTask} ile başlangıç skorunu al. Sonraki görevler tahmine değil gerçek performansına göre güncellenecek.` : `Use ${firstTask} to establish your baseline. Every task after that will adapt to real performance, not estimates.`}
          </p>
        </div>
        <div className="inside-actions">
          <button type="button" className="button button-secondary" onClick={onDashboard}>
            {tr ? "Dashboard" : "Dashboard"}
          </button>
          <TrackedLink className="button button-primary" href="/app/practice" analyticsEvent="marketing_cta_click" analyticsPath="/app/onboarding/first-practice">
            {tr ? "İlk pratiği başlat" : "Start first practice"}
          </TrackedLink>
        </div>
      </header>

      <section className="inside-metric-strip" style={{ "--metric-count": 4 } as React.CSSProperties}>
        <ReadyMetric label={tr ? "Tahmini seviye" : "Estimated level"} value={level || "—"} note={current ? `${tr ? "Yaklaşık skor" : "Approx. score"} ${current}` : (tr ? "İlk denemede ölçülecek" : "Measured in first attempt")} />
        <ReadyMetric label={tr ? "Hedef" : "Target"} value={profile.targetScore?.toString() ?? "—"} note={profile.preferredExamType} />
        <ReadyMetric label={tr ? "Kapanacak fark" : "Gap to close"} value={gap === null ? "—" : gap <= 0 ? "0" : profile.preferredExamType === "IELTS" ? gap.toFixed(1) : Math.round(gap).toString()} note={tr ? "İlk sonuçtan sonra netleşir" : "Refines after first result"} />
        <ReadyMetric label={tr ? "Tahmini ritim" : "Estimated rhythm"} value={timeLabel} note={`${profile.weeklyGoal} ${tr ? "deneme / hafta" : "attempts / week"}`} />
      </section>

      <div className="inside-layout">
        <div className="inside-main">
          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "7 günlük başlangıç" : "7-day launch"}</span>
                <h2>{tr ? "İlk üç hareketin" : "Your first three moves"}</h2>
              </div>
              <Target size={20} aria-hidden="true" />
            </div>
            <div className="inside-timeline">
              {[
                {
                  day: tr ? "Bugün" : "Today",
                  title: firstTask,
                  body: tr ? "İlk cevabını kaydet ve başlangıç skorunu oluştur." : "Record one answer and establish your baseline score."
                },
                {
                  day: tr ? "Sonraki" : "Next",
                  title: tr ? "Aynı soruyu bir kez daha cevapla" : "Retry the same prompt once",
                  body: tr ? "Rapordaki tek bir öneriyi seçip ikinci cevapta uygula." : "Choose one recommendation from the report and apply it in the second answer."
                },
                {
                  day: tr ? "Bu hafta" : "This week",
                  title: tr ? `${profile.weeklyGoal} kısa oturumu tamamla` : `Complete ${profile.weeklyGoal} short sessions`,
                  body: tr ? `Her gün yaklaşık ${profile.dailyMinutesGoal ?? 15} dakika yeterli.` : `About ${profile.dailyMinutesGoal ?? 15} minutes on each study day is enough.`
                }
              ].map((item) => (
                <div key={item.day} className="inside-timeline-item">
                  <span className="inside-timeline-day">{item.day}</span>
                  <div className="inside-row-main">
                    <strong className="inside-row-title">{item.title}</strong>
                    <span className="inside-row-meta">{item.body}</span>
                  </div>
                  <Check size={17} aria-hidden="true" />
                </div>
              ))}
            </div>
          </section>

          {currentPlan === "free" ? (
            <section className="inside-section is-accent">
              <div className="inside-section-head">
                <div>
                  <span className="inside-kicker">{tr ? "İsteğe bağlı hızlandırıcı" : "Optional accelerator"}</span>
                  <h2>{tr ? "Daha fazla tekrar gerektiğinde Plus" : "Plus when you need more repetitions"}</h2>
                  <p className="inside-section-copy">
                    {tr
                      ? "Önce ücretsiz ilk skorunu alabilirsin. Aynı gün daha çok deneme ve tam geri bildirim istediğinde bu öneri hazır."
                      : "You can get your first score for free. This option is ready when you want more same-day attempts and full feedback."}
                  </p>
                </div>
                <Sparkles size={20} aria-hidden="true" />
              </div>
              <div className="inside-plan-focus">
                <div className="inside-callout">
                  <strong>
                    {shouldRecommendAnnual
                      ? (tr ? `${commerceConfig.plusAnnualPrice}/yıl · yaklaşık ${formatUsd(annualMonthlyEquivalent)}/ay` : `${commerceConfig.plusAnnualPrice}/year · about ${formatUsd(annualMonthlyEquivalent)}/month`)
                      : (tr ? `${commerceConfig.plusMonthlyPrice} ile düşük ilk ödeme` : `${commerceConfig.plusMonthlyPrice} with a lower first payment`)}
                  </strong>
                  <p>
                    {recommendedBilling === "weekly"
                      ? (tr ? "Bugün $0; 3 günlük deneme sonrasında iptal edilmezse haftalık $3.99." : "$0 today; then $3.99/week after the 3-day trial unless cancelled.")
                      : (tr ? "Yıllık ücret checkout sırasında tek seferde alınır." : "The annual price is charged once at checkout.")}
                  </p>
                </div>
                <TrackedLink
                  className="button button-primary"
                  href={recommendedCheckoutPath}
                  analyticsEvent="checkout_initiated"
                  analyticsPath={`/app/onboarding/${recommendedBilling}`}
                  onClick={() => {
                    posthog.capture("checkout_initiated", {
                      source: "onboarding_plan_ready",
                      plan: "plus",
                      billing: recommendedBilling,
                      weekly_goal: profile.weeklyGoal,
                      estimated_weeks_to_target: weeks
                    });
                  }}
                >
                  {tr ? "Plus seçeneğini aç" : "Open Plus option"}
                </TrackedLink>
              </div>
            </section>
          ) : null}
        </div>

        <aside className="inside-rail">
          <section className="inside-section is-accent">
            <span className="inside-kicker">{tr ? "Ana odağın" : "Primary focus"}</span>
            <h2 style={{ margin: "0.45rem 0 0" }}>{tr ? focus.tr : focus.en}</h2>
            <p className="inside-section-copy">{tr ? focus.hintTr : focus.hintEn}</p>
          </section>
          <section className="inside-section">
            <div className="inside-section-head">
              <div>
                <span className="inside-kicker">{tr ? "Çalışma sözü" : "Practice commitment"}</span>
                <h3>{tr ? "Küçük, düzenli, ölçülebilir" : "Small, consistent, measurable"}</h3>
              </div>
              <Clock3 size={19} aria-hidden="true" />
            </div>
            <div className="inside-row-list">
              <div className="inside-row">
                <span className="inside-row-title">{tr ? "Haftalık deneme" : "Weekly attempts"}</span>
                <strong>{profile.weeklyGoal}</strong>
              </div>
              <div className="inside-row">
                <span className="inside-row-title">{tr ? "Günlük süre" : "Daily time"}</span>
                <strong>{profile.dailyMinutesGoal ?? 15} min</strong>
              </div>
              <div className="inside-row">
                <span className="inside-row-title">{tr ? "Seçilen gün" : "Selected days"}</span>
                <strong>{profile.studyDays.length}</strong>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function ReadyMetric({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="inside-metric">
      <span className="inside-metric-label">{label}</span>
      <strong className="inside-metric-value">{value}</strong>
      <span className="inside-metric-note">{note}</span>
    </div>
  );
}

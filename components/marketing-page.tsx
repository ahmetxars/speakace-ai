"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  TrendingUp,
  BookOpen,
  ChevronDown,
  Mic,
  FileText,
  Sparkles,
  GraduationCap,
  Briefcase,
  School
} from "lucide-react";
import { useAppState } from "@/components/providers";
import { AdSenseUnit } from "@/components/adsense-unit";

type MarketingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  focus: string;
  ctaHref: Route | string;
  variant?: "default" | "minimal";
};

const sectionCopy = {
  en: {
    badge: "AI-powered speaking practice",
    badgeLive: "1,000+ learners practicing today",
    trusted: "Trusted by learners in 50+ countries.",
    cta: "Start Speaking Free",
    ctaFree: "Try Free",
    demo: "See how it works",
    trustBar: "✓ No signup required   ✓ Free forever   ✓ 1,000+ active learners",
    scoreLabel: "Band score improved",
    demoEyebrow: "Interactive demo",
    demoTitle: "See the exact learning loop before you commit",
    demoSubtitle: "Pick a real user goal and watch how SpeakAce turns one answer into a stronger retry.",
    demoTabs: [
      {
        id: "first-session",
        label: "First practice",
        title: "One short practice becomes a concrete next step",
        score: "6.0",
        scoreDelta: "+0.5 after retry",
        metricLabel: "Estimated band after first pass",
        transcriptLabel: "What the learner sees",
        transcript:
          "I think studying abroad is helpful because students can improve their language skills and become more independent.",
        points: [
          "Fluency note: answer starts clearly but needs more development.",
          "Coach fix: add one specific example and one personal reason.",
          "Retry prompt: explain how living alone changes confidence."
        ]
      },
      {
        id: "band-push",
        label: "Band 6 to 7",
        title: "A targeted retry loop for learners chasing a higher score",
        score: "6.5",
        scoreDelta: "Band 7 path visible",
        metricLabel: "What improves next",
        transcriptLabel: "Weak pattern spotted",
        transcript:
          "The answer is relevant, but it stays too general. The learner needs clearer support, more connected linking, and less repetition.",
        points: [
          "Structure fix: answer, reason, example, reflection.",
          "Vocabulary fix: replace repeated basic adjectives.",
          "Speaking habit: retry the same prompt immediately while feedback is fresh."
        ]
      },
      {
        id: "teacher-view",
        label: "Teacher workflow",
        title: "Teachers see who needs help before the next live lesson",
        score: "12 students",
        scoreDelta: "4 need fluency support",
        metricLabel: "Classroom signal",
        transcriptLabel: "What the teacher sees",
        transcript:
          "Fluency is the weakest shared pattern this week. Most low-scoring attempts break down when students try to extend ideas in Part 2 and Part 3.",
        points: [
          "Assign one focused retry task to the whole class.",
          "Track which students completed the repeat attempt.",
          "Use the dashboard before class instead of guessing what to review."
        ]
      }
    ],
    segmentEyebrow: "Built for real use cases",
    segmentTitle: "Not just a speaking bot. A workflow for the kind of learner you are.",
    segmentSubtitle: "SpeakAce adapts better when the page explains exactly where you fit.",
    segments: [
      {
        icon: GraduationCap,
        title: "Self-study learners",
        body: "Use one prompt, one transcript, and one retry to build a daily habit without waiting for a tutor.",
        outcome: "Best for consistency and score-focused self practice.",
        href: "/for-students",
        cta: "For students"
      },
      {
        icon: Briefcase,
        title: "Band 6 to 7 push",
        body: "Spot the weak pattern behind your stuck score and get a cleaner structure for the next attempt.",
        outcome: "Best for learners close to test day who need sharper retries.",
        href: "/improve-ielts-speaking-score",
        cta: "Improve faster"
      },
      {
        icon: School,
        title: "Teachers and schools",
        body: "Turn weak speaking patterns into homework, follow-up tasks, and clearer student progress.",
        outcome: "Best for classes that need visibility between lessons.",
        href: "/for-schools",
        cta: "School workflows"
      }
    ],
    proofEyebrow: "Why this converts",
    proofTitle: "The page now answers the three questions serious learners ask first",
    proofCards: [
      {
        title: "Will this feel like my exam?",
        body: "The demo shows test-shaped prompts, transcript review, and band-style signals instead of vague AI chat."
      },
      {
        title: "Will I know what to do next?",
        body: "Every preview path ends with a concrete retry instruction so the product feels actionable, not abstract."
      },
      {
        title: "Is this built for someone like me?",
        body: "Student, score-improvement, and school paths make the product fit clearer before the first click."
      }
    ],
    whyEyebrow: "Why SpeakAce",
    whyTitle: "Why learners choose SpeakAce",
    whySubtitle: "Everything you need to improve your speaking score, powered by intelligent AI feedback.",
    whyCards: [
      {
        icon: Zap,
        title: "AI-Powered Feedback",
        body: "Get detailed analysis on every session. Our AI evaluates fluency, pronunciation, grammar, and coherence just like a real examiner."
      },
      {
        icon: TrendingUp,
        title: "Track Your Progress",
        body: "Watch your band score improve over time. See a band-style score, transcript, and clearer next steps after every attempt."
      },
      {
        icon: BookOpen,
        title: "500+ Real Questions",
        body: "Practice with authentic IELTS and TOEFL questions. Retry the same answer, compare improvement, and build a daily rhythm."
      }
    ],
    howEyebrow: "How it works",
    howTitle: "Three steps to a better band score",
    howSubtitle: "Simple, focused practice that fits your schedule.",
    howCards: [
      { step: 1, title: "Pick your exam and task", body: "Start with IELTS or TOEFL, then choose the speaking task you want to practice right now." },
      { step: 2, title: "Record one focused answer", body: "Use one real question, one clear answer, and one attempt to see how your speaking holds up." },
      { step: 3, title: "Review, fix, and retry", body: "Check the transcript, estimated score, and improvement notes, then record again with more control." }
    ],
    howCtaTitle: "Ready to see your score?",
    howCtaMeta: "Free session · No account needed · Results in 60 seconds",
    featureEyebrow: "Platform fit",
    featureTitle: "Everything speaks the same language: score improvement",
    featureCards: [
      { title: "Guided practice flows", body: "IELTS and TOEFL tasks with real exam structure and timed prompts.", tag: "Practice" },
      { title: "Transcript review", body: "See exactly what you said, spot filler words, and find stronger retry direction.", tag: "Feedback" },
      { title: "Teacher & class tools", body: "Visibility when you need structure — assign homework, track attempts.", tag: "Teachers" },
      { title: "Daily practice hooks", body: "Tools, prompts, and habits that keep you speaking consistently.", tag: "Habits" }
    ],
    testEyebrow: "Results",
    testTitle: "Loved by learners worldwide",
    testSubtitle: "Join thousands of students who improved their IELTS speaking score",
    statsRow: [
      { value: "50+", label: "Countries" },
      { value: "1,000+", label: "Daily learners" },
      { value: "7.2", label: "Avg. band score" },
      { value: "89%", label: "Satisfaction rate" }
    ],
    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        q: "How accurate is the AI band score estimate?",
        a: "SpeakAce gives an estimated IELTS band score based on fluency, pronunciation, structure, and idea support. It is designed to show progress across attempts, not replace an official examiner."
      },
      {
        q: "Do I need to create an account to start?",
        a: "No. You can start a free speaking session without signing up. Creating an account helps you save history, track scores, and keep a daily rhythm."
      },
      {
        q: "Can I use SpeakAce for TOEFL preparation?",
        a: "Yes. SpeakAce includes TOEFL-style speaking tasks alongside IELTS, using the same core feedback areas: fluency, pronunciation, structure, and coherence."
      },
      {
        q: "How is SpeakAce different from general AI tools?",
        a: "General tools respond to text. SpeakAce is built specifically for spoken English scoring, transcript review, and exam-focused improvement."
      },
      {
        q: "Can teachers use SpeakAce with students?",
        a: "Yes. Teachers can create classes, assign speaking homework, track attempts, and see progress from a single panel."
      }
    ],
    ctaFinalTitle: "Ready to improve your IELTS score?",
    ctaFinalBody: "Start with our free plan today. No credit card required. Upgrade anytime.",
    ctaFinalButton: "Get Started Free"
  },
  tr: {
    badge: "Yapay zekâ destekli speaking practice",
    badgeLive: "Bugün 1.000+ öğrenci pratik yapıyor",
    trusted: "50+ ülkedeki öğrenciler tarafından kullanılıyor.",
    cta: "Hemen Konuşmaya Başla",
    ctaFree: "Ücretsiz Dene",
    demo: "Nasıl çalıştığını gör",
    trustBar: "✓ Kayıt gerektirmez   ✓ Ücretsiz   ✓ 1.000+ aktif öğrenci",
    scoreLabel: "Band skoru gelişti",
    demoEyebrow: "Etkileşimli demo",
    demoTitle: "Ürünü kullanmadan önce öğrenme döngüsünü gör",
    demoSubtitle: "Gerçek bir kullanıcı hedefi seç ve SpeakAce’in tek cevabı nasıl daha güçlü bir tekrar denemesine çevirdiğini izle.",
    demoTabs: [
      {
        id: "first-session",
        label: "İlk pratik",
        title: "Kısa bir deneme net bir sonraki adıma dönüşür",
        score: "6.0",
        scoreDelta: "Tekrardan sonra +0.5",
        metricLabel: "İlk deneme tahmini band",
        transcriptLabel: "Öğrencinin gördüğü",
        transcript:
          "I think studying abroad is helpful because students can improve their language skills and become more independent.",
        points: [
          "Akıcılık notu: cevap net başlıyor ama yeterince gelişmiyor.",
          "Koç düzeltmesi: bir somut örnek ve bir kişisel neden ekle.",
          "Retry yönü: yalnız yaşamanın özgüveni nasıl etkilediğini açıkla."
        ]
      },
      {
        id: "band-push",
        label: "Band 6'dan 7'ye",
        title: "Daha yüksek skor isteyen öğrenci için hedefli retry döngüsü",
        score: "6.5",
        scoreDelta: "Band 7 yolu net",
        metricLabel: "Sırada ne gelişecek",
        transcriptLabel: "Bulunan zayıf desen",
        transcript:
          "Cevap ilgili ama fazla genel kalıyor. Öğrencinin daha güçlü destek, daha bağlı geçişler ve daha az tekrar kullanması gerekiyor.",
        points: [
          "Yapı düzeltmesi: cevap, neden, örnek, yorum.",
          "Kelime düzeltmesi: tekrarlanan temel sıfatları değiştir.",
          "Konuşma alışkanlığı: geri bildirim tazeyken aynı soruyu hemen tekrar dene."
        ]
      },
      {
        id: "teacher-view",
        label: "Öğretmen görünümü",
        title: "Öğretmenler dersten önce kimin desteğe ihtiyacı olduğunu görür",
        score: "12 öğrenci",
        scoreDelta: "4 öğrencide akıcılık sorunu",
        metricLabel: "Sınıf sinyali",
        transcriptLabel: "Öğretmenin gördüğü",
        transcript:
          "Bu hafta ortak en zayıf alan akıcılık. Düşük skorlu denemelerin çoğu öğrenciler fikirleri uzatmaya çalışırken Part 2 ve Part 3'te dağılıyor.",
        points: [
          "Tüm sınıfa tek odaklı bir retry ödevi ver.",
          "Tekrar denemesini kimin tamamladığını takip et.",
          "Dersten önce neyi tekrar edeceğini tahmin etmek yerine paneli kullan."
        ]
      }
    ],
    segmentEyebrow: "Gerçek kullanım senaryoları",
    segmentTitle: "Sadece bir speaking bot değil. Senin çalışma biçimine uyan bir akış.",
    segmentSubtitle: "Sayfa hangi kullanıcıya nasıl uyduğunu net anlattığında dönüşüm daha kolay olur.",
    segments: [
      {
        icon: GraduationCap,
        title: "Kendi çalışan öğrenciler",
        body: "Günlük düzen kurmak için bir soru, bir transcript ve bir retry döngüsü kullan.",
        outcome: "Tutarlılık ve skor odaklı bireysel çalışma için en uygun akış.",
        href: "/for-students",
        cta: "Öğrenciler için"
      },
      {
        icon: Briefcase,
        title: "Band 6'dan 7'ye çıkmak isteyenler",
        body: "Takılı kalan skorun arkasındaki zayıf deseni bul ve bir sonraki cevap için daha temiz yapı kur.",
        outcome: "Sınava yakın dönemde daha keskin retry isteyen kullanıcılar için uygun.",
        href: "/improve-ielts-speaking-score",
        cta: "Daha hızlı geliş"
      },
      {
        icon: School,
        title: "Öğretmenler ve okullar",
        body: "Zayıf speaking desenlerini ödeve, takip görevine ve net öğrenci ilerlemesine çevir.",
        outcome: "Ders aralarında görünürlük isteyen sınıflar için uygun.",
        href: "/for-schools",
        cta: "Okul akışı"
      }
    ],
    proofEyebrow: "Neden dönüştürür",
    proofTitle: "Sayfa artık ciddi kullanıcıların ilk sorduğu üç soruya cevap veriyor",
    proofCards: [
      {
        title: "Bu gerçekten sınava benziyor mu?",
        body: "Demo, belirsiz AI sohbeti yerine sınav tarzı soru, transcript incelemesi ve band sinyallerini gösteriyor."
      },
      {
        title: "Sonraki adımım net olacak mı?",
        body: "Her önizleme yolu somut bir retry yönüyle bittiği için ürün daha uygulanabilir hissettiriyor."
      },
      {
        title: "Bu ürün benim gibi biri için mi?",
        body: "Öğrenci, skor gelişimi ve okul yolları ilk tıklamadan önce ürün uyumunu netleştiriyor."
      }
    ],
    whyEyebrow: "Neden SpeakAce",
    whyTitle: "Öğrenciler neden SpeakAce seçiyor",
    whySubtitle: "Yapay zeka destekli geri bildirimle konuşma skorunu geliştirmek için ihtiyacın olan her şey.",
    whyCards: [
      {
        icon: Zap,
        title: "Yapay Zeka Destekli Geri Bildirim",
        body: "Her oturumda akıcılık, telaffuz, gramer ve tutarlılık değerlendirmesi alırsın."
      },
      {
        icon: TrendingUp,
        title: "İlerleni Takip Et",
        body: "Band skorunun zamanla nasıl ilerlediğini gör. Her denemeden sonra detaylı analiz alırsın."
      },
      {
        icon: BookOpen,
        title: "500+ Gerçek Soru",
        body: "Gerçek IELTS ve TOEFL sorularıyla çalış. Aynı cevabı tekrar dene, gelişimi karşılaştır."
      }
    ],
    howEyebrow: "Nasıl çalışır",
    howTitle: "Daha iyi bir band skoruna giden üç adım",
    howSubtitle: "Programına uyan, odaklı ve basit pratik.",
    howCards: [
      { step: 1, title: "Sınav ve görevi seç", body: "Önce IELTS veya TOEFL'ı seç, sonra o anda çalışmak istediğin speaking görevini aç." },
      { step: 2, title: "Tek bir odaklı cevap kaydet", body: "Gerçek bir soruya tek bir net cevap ver ve mevcut speaking seviyeni gör." },
      { step: 3, title: "İncele, düzelt, tekrar dene", body: "Transcript'i, tahmini skoru ve geliştirme notlarını görüp daha kontrollü bir yeni deneme yap." }
    ],
    howCtaTitle: "Skorunu görmeye hazır mısın?",
    howCtaMeta: "Ücretsiz oturum · Hesap gerekmez · 60 saniyede sonuç",
    featureEyebrow: "Platform uyumu",
    featureTitle: "Buradaki her şey aynı hedefe çalışıyor: skor gelişimi",
    featureCards: [
      { title: "Yönlendirmeli practice akışı", body: "Gerçek sınav yapısıyla IELTS ve TOEFL görevleri.", tag: "Pratik" },
      { title: "Transcript incelemesi", body: "Ne söylediğini gör, gereksiz doldurma kelimelerini fark et.", tag: "Geri bildirim" },
      { title: "Öğretmen ve sınıf araçları", body: "Ödev ver, denemeleri takip et.", tag: "Öğretmenler" },
      { title: "Günlük pratik alışkanlığı", body: "Sürekli speaking'e bağlayan araçlar ve prompt'lar.", tag: "Alışkanlık" }
    ],
    testEyebrow: "Sonuçlar",
    testTitle: "Dünya genelindeki öğrenciler seviyor",
    testSubtitle: "IELTS speaking skorunu geliştiren binlerce öğrenciye katıl",
    statsRow: [
      { value: "50+", label: "Ülke" },
      { value: "1.000+", label: "Günlük öğrenci" },
      { value: "7,2", label: "Ort. band skoru" },
      { value: "%89", label: "Memnuniyet" }
    ],
    faqEyebrow: "SSS",
    faqTitle: "Sık sorulan sorular",
    faqs: [
      {
        q: "AI band skoru tahmini ne kadar doğru?",
        a: "SpeakAce; akıcılık, telaffuz, yapı ve fikir desteğine göre tahmini bir IELTS band skoru verir."
      },
      {
        q: "Başlamak için hesap oluşturmam gerekiyor mu?",
        a: "Hayır. Ücretsiz bir speaking oturumuna kayıt olmadan başlayabilirsin."
      },
      {
        q: "SpeakAce TOEFL hazırlığı için de uygun mu?",
        a: "Evet. IELTS yanında TOEFL tarzı speaking görevleri de var."
      },
      {
        q: "Genel AI araçlarından farkı ne?",
        a: "Genel araçlar yazıya cevap verir. SpeakAce ise sesini dinler, transcript çıkarır ve sınav odaklı gelişim için tasarlanmıştır."
      },
      {
        q: "Öğretmenler öğrencileriyle kullanabilir mi?",
        a: "Evet. Öğretmenler sınıf kurabilir, ödev verebilir ve denemeleri tek panelden izleyebilir."
      }
    ],
    ctaFinalTitle: "IELTS skorunu geliştirmeye hazır mısın?",
    ctaFinalBody: "Bugün ücretsiz planla başla. Kredi kartı gerekmez. İstediğinde yükselt.",
    ctaFinalButton: "Ücretsiz Başla"
  }
} as const;

const weeklyTestimonials = [
  {
    name: "Ayşe T.",
    country: "🇹🇷 Turkey",
    score: "5.5 → 7.0",
    text: "I practiced every morning for 10 days. The transcript review helped me see exactly where I was repeating myself."
  },
  {
    name: "Kenji M.",
    country: "🇯🇵 Japan",
    score: "6.0 → 7.5",
    text: "The retry feature is what makes this different. I could hear the improvement between attempt one and attempt three."
  },
  {
    name: "Priya K.",
    country: "🇮🇳 India",
    score: "6.5 → 7.5",
    text: "SpeakAce shows why your score is low, not just what it is. That changed my Part 2 answers completely."
  },
  {
    name: "Ahmed R.",
    country: "🇪🇬 Egypt",
    score: "5.0 → 6.5",
    text: "Three weeks of daily practice. My fluency improved because the daily prompt habit finally gave me consistency."
  }
] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 }
  }
};

export function MarketingPage({ eyebrow, title, description, focus, ctaHref }: MarketingPageProps) {
  const { language } = useAppState();
  const t = sectionCopy[language === "tr" ? "tr" : "en"];
  const primaryHref = ctaHref as Route;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeDemo, setActiveDemo] = useState<(typeof t.demoTabs)[number]["id"]>(t.demoTabs[0].id);
  const selectedDemo = t.demoTabs.find((item) => item.id === activeDemo) ?? t.demoTabs[0];

  return (
    <main style={{ minHeight: "100vh", paddingTop: "64px" }}>

      {/* ── Hero ─────────────────────────────── */}
      <section style={{ position: "relative", padding: "5rem 1.5rem 4rem", overflow: "hidden" }}>
        {/* Gradient background */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, oklch(0.623 0.214 259.815 / 0.05), transparent, oklch(0.71 0.18 165.41 / 0.05))", pointerEvents: "none" }} />

        {/* Animated blobs */}
        <motion.div
          style={{
            position: "absolute",
            top: "5rem",
            right: "5%",
            width: "400px",
            height: "400px",
            background: "oklch(0.623 0.214 259.815 / 0.08)",
            borderRadius: "50%",
            filter: "blur(80px)",
            pointerEvents: "none"
          }}
          animate={{ y: [0, 40, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{
            position: "absolute",
            bottom: "3rem",
            left: "5%",
            width: "500px",
            height: "500px",
            background: "oklch(0.71 0.18 165.41 / 0.07)",
            borderRadius: "50%",
            filter: "blur(100px)",
            pointerEvents: "none"
          }}
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}
            className="hero-grid"
          >
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.375rem 0.875rem",
                  background: "oklch(0.623 0.214 259.815 / 0.12)",
                  border: "1px solid oklch(0.623 0.214 259.815 / 0.2)",
                  borderRadius: "100px",
                  marginBottom: "1.25rem"
                }}
                whileHover={{ scale: 1.03 }}
              >
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "var(--accent)", animation: "pulse 2s infinite" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--primary)" }}>
                  🎯 {eyebrow || t.badge}
                </span>
              </motion.div>

              <motion.h1
                style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1.25rem", letterSpacing: "-0.02em" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                {title || "Your IELTS Speaking Score,"}{" "}
                <span className="gradient-text">Finally Moving</span>
              </motion.h1>

              <motion.p
                style={{ fontSize: "1.125rem", color: "var(--muted-foreground)", marginBottom: "0.5rem", lineHeight: 1.6 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {description || "Practice real exam questions. Get instant AI feedback. Retry smarter."}
              </motion.p>
              <motion.p
                style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", marginBottom: "2rem", opacity: 0.7 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.25 }}
              >
                {t.trusted}
              </motion.p>

              <motion.div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "1.5rem" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    href={primaryHref}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      fontSize: "0.9375rem",
                      fontWeight: 700,
                      color: "white",
                      background: "var(--primary)",
                      borderRadius: "10px",
                      textDecoration: "none",
                      boxShadow: "0 0 30px oklch(0.623 0.214 259.815 / 0.35)"
                    }}
                  >
                    {t.cta}
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight size={18} />
                    </motion.span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <a
                    href="#how-it-works"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.5rem",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "var(--foreground)",
                      background: "oklch(1 0 0 / 6%)",
                      border: "1px solid oklch(1 0 0 / 12%)",
                      borderRadius: "10px",
                      textDecoration: "none"
                    }}
                  >
                    {t.demo}
                  </a>
                </motion.div>
              </motion.div>

              <motion.p
                style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)", opacity: 0.6 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                {t.trustBar}
              </motion.p>
            </motion.div>

            {/* Hero score card */}
            <motion.div
              style={{ position: "relative" }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hero-card-wrap"
            >
              <motion.div
                style={{
                  background: "linear-gradient(135deg, oklch(0.623 0.214 259.815 / 0.15), oklch(0.71 0.18 165.41 / 0.15))",
                  borderRadius: "20px",
                  padding: "1.5rem",
                  border: "1px solid oklch(1 0 0 / 10%)"
                }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ background: "var(--card)", borderRadius: "12px", padding: "1.5rem" }}>
                  <div style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--muted-foreground)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    SPEAKING SCORE
                  </div>
                  <motion.div
                    style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.25rem" }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                  >
                    7.0
                    <span style={{ fontSize: "1.25rem", color: "var(--accent)", marginLeft: "0.5rem" }}>↑ +0.5</span>
                  </motion.div>
                  <p style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)", marginBottom: "1.25rem", opacity: 0.8 }}>
                    {t.scoreLabel}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[
                      { label: "Fluency", score: "7.0", width: 78 },
                      { label: "Pronunciation", score: "6.5", width: 72 },
                      { label: "Structure", score: "7.0", width: 78 }
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.375rem" }}>
                          <span style={{ color: "var(--muted-foreground)" }}>{item.label}</span>
                          <span style={{ fontWeight: 700 }}>{item.score}</span>
                        </div>
                        <div style={{ height: "6px", background: "var(--secondary)", borderRadius: "100px", overflow: "hidden" }}>
                          <motion.div
                            style={{ height: "100%", background: "var(--accent)", borderRadius: "100px" }}
                            initial={{ width: 0 }}
                            animate={{ width: `${item.width}%` }}
                            transition={{ duration: 1.5, delay: 0.4 + idx * 0.1 }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div style={{ fontSize: "0.75rem", color: "var(--muted-foreground)", paddingTop: "1rem", borderTop: "1px solid var(--border)", marginTop: "1rem", opacity: 0.7 }}>
                    IELTS Academic · {focus || "Practice session"}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(180deg, oklch(1 0 0 / 0.01), oklch(0.98 0.01 250 / 0.08))" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: "2rem" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {t.demoEyebrow}
            </span>
            <h2 style={{ fontSize: "clamp(1.85rem, 4vw, 2.9rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              {t.demoTitle}
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted-foreground)", maxWidth: "720px", margin: "0 auto" }}>
              {t.demoSubtitle}
            </p>
          </motion.div>

          <div className="marketing-demo-tabs" style={{ justifyContent: "center" }}>
            {t.demoTabs.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`marketing-demo-tab${item.id === activeDemo ? " active" : ""}`}
                onClick={() => setActiveDemo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <motion.div
            key={selectedDemo.id}
            className="marketing-demo-grid"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginTop: "1.5rem" }}
          >
            <div
              className="marketing-demo-card"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "22px",
                boxShadow: "0 24px 60px oklch(0.22 0.03 250 / 0.08)"
              }}
            >
              <div className="demo-label">{selectedDemo.metricLabel}</div>
              <div className="marketing-demo-score">
                <div>
                  <strong>{selectedDemo.score}</strong>
                  <p style={{ margin: "0.45rem 0 0", color: "var(--muted-foreground)" }}>{selectedDemo.title}</p>
                </div>
                <div
                  style={{
                    padding: "0.45rem 0.8rem",
                    borderRadius: "999px",
                    background: "oklch(0.71 0.18 165.41 / 0.12)",
                    color: "var(--accent)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap"
                  }}
                >
                  {selectedDemo.scoreDelta}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gap: "0.75rem"
                }}
              >
                {[
                  { icon: Mic, label: language === "tr" ? "Cevap kaydı" : "Answer recorded" },
                  { icon: FileText, label: language === "tr" ? "Transcript çıktı" : "Transcript ready" },
                  { icon: Sparkles, label: language === "tr" ? "Retry yönü" : "Retry direction" }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      style={{
                        borderRadius: "16px",
                        padding: "0.95rem",
                        background: "oklch(0.98 0.01 250 / 0.55)",
                        border: "1px solid var(--border)",
                        display: "grid",
                        gap: "0.55rem"
                      }}
                    >
                      <Icon size={18} style={{ color: "var(--primary)" }} />
                      <span style={{ fontSize: "0.84rem", fontWeight: 600 }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className="marketing-demo-card"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.92), rgba(247,250,255,0.92))",
                border: "1px solid var(--border)",
                borderRadius: "22px",
                boxShadow: "0 24px 60px oklch(0.22 0.03 250 / 0.08)"
              }}
            >
              <div className="demo-label">{selectedDemo.transcriptLabel}</div>
              <div
                style={{
                  borderRadius: "18px",
                  padding: "1rem",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--muted-foreground)",
                  lineHeight: 1.7
                }}
              >
                {selectedDemo.transcript}
              </div>
              <div className="marketing-demo-points">
                {selectedDemo.points.map((point) => (
                  <div
                    key={point}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "flex-start",
                      padding: "0.95rem 1rem",
                      borderRadius: "16px",
                      background: "oklch(0.99 0.005 250 / 0.9)",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <span
                      style={{
                        width: "0.65rem",
                        height: "0.65rem",
                        borderRadius: "999px",
                        background: "linear-gradient(135deg, var(--primary), var(--accent))",
                        marginTop: "0.35rem",
                        flexShrink: 0
                      }}
                    />
                    <span style={{ fontSize: "0.92rem", lineHeight: 1.65 }}>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────── */}
      <section style={{ padding: "2rem 1.5rem", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "oklch(1 0 0 / 2%)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}
            className="stats-grid"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            {t.statsRow.map((stat) => (
              <div
                key={stat.label}
                style={{ textAlign: "center", padding: "0.5rem" }}
              >
                <strong style={{ display: "block", fontSize: "1.75rem", fontWeight: 800, background: "linear-gradient(135deg, var(--primary), var(--accent))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  {stat.value}
                </strong>
                <span style={{ fontSize: "0.8125rem", color: "var(--muted-foreground)" }}>{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Why section ──────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", background: "oklch(1 0 0 / 1.5%)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: "3rem" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {t.whyEyebrow}
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              {t.whyTitle}
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted-foreground)", maxWidth: "560px", margin: "0 auto" }}>
              {t.whySubtitle}
            </p>
          </motion.div>

          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}
            className="three-col-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {t.whyCards.map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={itemVariants}
                  whileHover={{ y: -8, boxShadow: "0 20px 40px oklch(0.623 0.214 259.815 / 0.12)" }}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "2rem",
                    transition: "box-shadow 0.3s"
                  }}
                >
                  <motion.div
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "oklch(0.623 0.214 259.815 / 0.12)",
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1.25rem"
                    }}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <Icon size={24} style={{ color: "var(--primary)" }} />
                  </motion.div>
                  <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>{card.title}</h3>
                  <p style={{ fontSize: "0.9375rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>{card.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: "3rem" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {t.segmentEyebrow}
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              {t.segmentTitle}
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted-foreground)", maxWidth: "720px", margin: "0 auto" }}>
              {t.segmentSubtitle}
            </p>
          </motion.div>

          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.25rem" }}
            className="three-col-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {t.segments.map((segment) => {
              const Icon = segment.icon;
              return (
                <motion.div
                  key={segment.title}
                  variants={itemVariants}
                  whileHover={{ y: -8 }}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    padding: "1.6rem",
                    display: "grid",
                    gap: "1rem"
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "oklch(0.623 0.214 259.815 / 0.12)",
                      color: "var(--primary)"
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.08rem", fontWeight: 700, marginBottom: "0.5rem" }}>{segment.title}</h3>
                    <p style={{ fontSize: "0.92rem", color: "var(--muted-foreground)", lineHeight: 1.7, marginBottom: "0.9rem" }}>{segment.body}</p>
                    <p style={{ fontSize: "0.84rem", lineHeight: 1.6, color: "var(--foreground)", opacity: 0.82 }}>{segment.outcome}</p>
                  </div>
                  <Link
                    href={segment.href as Route}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.45rem",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                      textDecoration: "none"
                    }}
                  >
                    {segment.cta}
                    <ArrowRight size={15} />
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ─────────────────────── */}
      <section id="how-it-works" style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: "3rem" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {t.howEyebrow}
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              {t.howTitle}
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted-foreground)", maxWidth: "480px", margin: "0 auto" }}>
              {t.howSubtitle}
            </p>
          </motion.div>

          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", maxWidth: "900px", margin: "0 auto 2.5rem" }}
            className="three-col-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {t.howCards.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                style={{ position: "relative" }}
              >
                <motion.div
                  style={{
                    background: "linear-gradient(135deg, oklch(0.623 0.214 259.815 / 0.08), oklch(0.71 0.18 165.41 / 0.08))",
                    border: "1px solid var(--border)",
                    borderRadius: "16px",
                    padding: "2rem",
                    textAlign: "center"
                  }}
                  whileHover={{ y: -6 }}
                >
                  <motion.div
                    style={{
                      width: "48px",
                      height: "48px",
                      background: "var(--primary)",
                      color: "white",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1rem",
                      fontWeight: 800,
                      fontSize: "1.125rem"
                    }}
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.step}
                  </motion.div>
                  <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.5rem" }}>{item.title}</h3>
                  <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>{item.body}</p>
                </motion.div>

                {idx < 2 && (
                  <motion.div
                    style={{
                      display: "none",
                      position: "absolute",
                      top: "50%",
                      right: "-0.75rem",
                      width: "1.5rem",
                      height: "3px",
                      background: "linear-gradient(90deg, var(--primary), var(--accent))",
                      zIndex: 2
                    }}
                    className="step-connector"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA panel */}
          <motion.div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
              flexWrap: "wrap"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.375rem" }}>{t.howCtaTitle}</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>{t.howCtaMeta}</p>
            </div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                href={primaryHref}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  color: "white",
                  background: "var(--primary)",
                  borderRadius: "10px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  boxShadow: "0 0 24px oklch(0.623 0.214 259.815 / 0.3)"
                }}
              >
                {t.cta}
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Feature bento ────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", background: "oklch(1 0 0 / 1.5%)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: "3rem" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {t.featureEyebrow}
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              {t.featureTitle}
            </h2>
          </motion.div>

          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}
            className="two-col-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {t.featureCards.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.75rem",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <span style={{
                  display: "inline-block",
                  padding: "0.25rem 0.75rem",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--primary)",
                  background: "oklch(0.623 0.214 259.815 / 0.1)",
                  border: "1px solid oklch(0.623 0.214 259.815 / 0.2)",
                  borderRadius: "100px",
                  marginBottom: "0.875rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase"
                }}>
                  {item.tag}
                </span>
                <h3 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: "0.5rem" }}>{item.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--muted-foreground)", lineHeight: 1.6 }}>{item.body}</p>
                <div style={{
                  position: "absolute",
                  bottom: "-1rem",
                  right: "-1rem",
                  width: "80px",
                  height: "80px",
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  borderRadius: "50%",
                  opacity: 0.05
                }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────── */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: "3rem" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {t.testEyebrow}
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>
              {t.testTitle}
            </h2>
            <p style={{ fontSize: "1.0625rem", color: "var(--muted-foreground)" }}>{t.testSubtitle}</p>
          </motion.div>

          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.25rem" }}
            className="four-col-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {weeklyTestimonials.map((item) => (
              <motion.div
                key={item.name}
                variants={itemVariants}
                whileHover={{ y: -8 }}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem"
                }}
              >
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      style={{ fontSize: "0.875rem" }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                    >⭐</motion.span>
                  ))}
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)", lineHeight: 1.6, flex: 1 }}>
                  &ldquo;{item.text}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                  <div>
                    <strong style={{ display: "block", fontSize: "0.875rem" }}>{item.name}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--muted-foreground)" }}>{item.country}</span>
                  </div>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--accent)", background: "oklch(0.71 0.18 165.41 / 0.1)", padding: "0.25rem 0.625rem", borderRadius: "100px", whiteSpace: "nowrap" }}>
                    {item.score}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section style={{ padding: "1rem 1.5rem 4rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: "2rem" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {t.proofEyebrow}
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              {t.proofTitle}
            </h2>
          </motion.div>

          <motion.div
            style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1rem" }}
            className="three-col-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {t.proofCards.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                style={{
                  borderRadius: "18px",
                  padding: "1.35rem",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.85), rgba(246,248,252,0.85))",
                  border: "1px solid var(--border)"
                }}
              >
                <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.55rem" }}>{item.title}</h3>
                <p style={{ margin: 0, color: "var(--muted-foreground)", lineHeight: 1.7, fontSize: "0.92rem" }}>{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Inline promo ─────────────────────── */}
      <section style={{ padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div
            style={{
              background: "linear-gradient(135deg, oklch(0.623 0.214 259.815 / 0.1), oklch(0.71 0.18 165.41 / 0.1))",
              border: "1px solid oklch(0.623 0.214 259.815 / 0.2)",
              borderRadius: "20px",
              padding: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
              flexWrap: "wrap"
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <div>
              <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                Try a free IELTS speaking test
              </span>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 800, maxWidth: "520px", lineHeight: 1.3 }}>
                See your transcript, estimated score, and next fix in one attempt.
              </h2>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <Link href="/free-ielts-speaking-test" style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", fontSize: "0.9375rem", fontWeight: 700, color: "white", background: "var(--primary)", borderRadius: "10px", textDecoration: "none" }}>
                Free test
              </Link>
              <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", padding: "0.75rem 1.5rem", fontSize: "0.9375rem", fontWeight: 600, color: "var(--foreground)", background: "oklch(1 0 0 / 8%)", border: "1px solid oklch(1 0 0 / 12%)", borderRadius: "10px", textDecoration: "none" }}>
                Read guides →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <motion.div
            style={{ textAlign: "center", marginBottom: "3rem" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <span style={{ display: "inline-block", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
              {t.faqEyebrow}
            </span>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              {t.faqTitle}
            </h2>
          </motion.div>

          <motion.div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {t.faqs.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  cursor: "pointer"
                }}
              >
                <motion.div
                  style={{
                    padding: "1.125rem 1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "1rem"
                  }}
                  whileHover={{ background: "oklch(1 0 0 / 3%)" }}
                >
                  <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{item.q}</span>
                  <motion.div
                    animate={{ rotate: expandedFaq === idx ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ flexShrink: 0 }}
                  >
                    <ChevronDown size={18} style={{ color: "var(--primary)" }} />
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: expandedFaq === idx ? "auto" : 0,
                    opacity: expandedFaq === idx ? 1 : 0
                  }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: "hidden" }}
                >
                  <div style={{ padding: "0 1.25rem 1.125rem", fontSize: "0.9rem", color: "var(--muted-foreground)", lineHeight: 1.7, borderTop: "1px solid var(--border)", paddingTop: "0.875rem" }}>
                    {item.a}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────── */}
      <section style={{ padding: "5rem 1.5rem", background: "linear-gradient(135deg, var(--primary), oklch(0.55 0.2 259.815))" }}>
        <motion.div
          style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800, color: "white", letterSpacing: "-0.02em", marginBottom: "1rem" }}>
            {t.ctaFinalTitle}
          </h2>
          <p style={{ fontSize: "1.125rem", color: "oklch(1 0 0 / 0.8)", marginBottom: "2rem" }}>
            {t.ctaFinalBody}
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={primaryHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.875rem 2rem",
                fontSize: "1rem",
                fontWeight: 700,
                color: "var(--primary)",
                background: "white",
                borderRadius: "12px",
                textDecoration: "none",
                boxShadow: "0 10px 40px oklch(0 0 0 / 0.25)"
              }}
            >
              {t.ctaFinalButton}
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── AdSense ──────────────────────────── */}
      <section style={{ padding: "2rem 1.5rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <AdSenseUnit className="sa-home-ad" />
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-card-wrap { display: none !important; }
          .three-col-grid { grid-template-columns: 1fr !important; }
          .four-col-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .four-col-grid { grid-template-columns: 1fr !important; }
          .two-col-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (min-width: 768px) {
          .step-connector { display: block !important; }
        }
      `}</style>
    </main>
  );
}

import type { Metadata } from "next";
import { MarketingSchema } from "@/components/marketing-schema";
import { SiteHeader } from "@/components/site-header";
import { MarketingPage } from "@/components/marketing-page";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

const homeMeta = {
  en: {
    title: "IELTS Speaking Practice Online with AI | SpeakAce",
    description: "Practice IELTS speaking with AI, get instant feedback, and improve your fluency faster."
  },
  tr: {
    title: "Yapay Zeka ile IELTS Speaking Pratiği | SpeakAce",
    description: "IELTS speaking pratiği yap, anında geri bildirim al ve akıcılığını daha hızlı geliştir."
  },
  de: {
    title: "IELTS-Speaking online mit KI üben | SpeakAce",
    description: "Übe IELTS Speaking mit KI, erhalte sofortiges Feedback und verbessere deine Sprachflüssigkeit schneller."
  },
  es: {
    title: "Practica IELTS Speaking online con IA | SpeakAce",
    description: "Practica IELTS speaking con IA, recibe feedback instantáneo y mejora tu fluidez más rápido."
  },
  fr: {
    title: "Pratique IELTS Speaking en ligne avec l’IA | SpeakAce",
    description: "Travaille l’oral IELTS avec l’IA, reçois un retour immédiat et améliore ta fluidité plus vite."
  },
  it: {
    title: "Pratica IELTS Speaking online con IA | SpeakAce",
    description: "Fai pratica di IELTS speaking con l’IA, ricevi feedback immediato e migliora la tua fluidità più velocemente."
  },
  pt: {
    title: "Pratique IELTS Speaking online com IA | SpeakAce",
    description: "Pratique IELTS speaking com IA, receba feedback instantâneo e melhore sua fluência mais rápido."
  },
  nl: {
    title: "Oefen IELTS Speaking online met AI | SpeakAce",
    description: "Oefen IELTS speaking met AI, krijg direct feedback en verbeter je spreekvloeiendheid sneller."
  },
  pl: {
    title: "Ćwicz IELTS Speaking online z AI | SpeakAce",
    description: "Ćwicz IELTS speaking z AI, otrzymuj natychmiastowy feedback i szybciej poprawiaj płynność mówienia."
  },
  ru: {
    title: "Практика IELTS Speaking онлайн с ИИ | SpeakAce",
    description: "Практикуйте IELTS speaking с ИИ, получайте мгновенную обратную связь и быстрее улучшайте беглость речи."
  },
  ar: {
    title: "تدرب على IELTS Speaking أونلاين بالذكاء الاصطناعي | SpeakAce",
    description: "تدرّب على IELTS speaking مع الذكاء الاصطناعي واحصل على ملاحظات فورية وطوّر طلاقتك بشكل أسرع."
  },
  ja: {
    title: "AIでIELTS Speakingをオンライン練習 | SpeakAce",
    description: "AIでIELTS speakingを練習し、すぐにフィードバックを受け取り、流暢さをより速く伸ばせます。"
  },
  ko: {
    title: "AI로 IELTS Speaking 온라인 연습 | SpeakAce",
    description: "AI와 함께 IELTS speaking을 연습하고 즉시 피드백을 받아 더 빠르게 유창성을 높이세요."
  }
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const meta = homeMeta[language] ?? homeMeta.en;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: "/"
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: siteConfig.domain,
      siteName: siteConfig.name,
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description
    },
    keywords: [
      "IELTS speaking practice",
      "IELTS speaking AI",
      "improve IELTS speaking score",
      "IELTS band score speaking",
      "AI English speaking practice",
      "speaking test simulator IELTS",
      "IELTS speaking feedback",
      "IELTS speaking mock test",
      "IELTS pronunciation practice",
      "TOEFL speaking practice"
    ]
  };
}

const homeShellCopy = {
  en: { eyebrow: "IELTS speaking score improvement" },
  tr: { eyebrow: "IELTS speaking skoru gelişimi" },
  de: { eyebrow: "IELTS-Speaking-Score verbessern" },
  es: { eyebrow: "Mejora de puntuación en IELTS speaking" },
  fr: { eyebrow: "Amélioration du score IELTS speaking" },
  it: { eyebrow: "Miglioramento punteggio IELTS speaking" },
  pt: { eyebrow: "Melhora da pontuação no IELTS speaking" },
  nl: { eyebrow: "Verbeter je IELTS-speaking-score" },
  pl: { eyebrow: "Popraw wynik IELTS speaking" },
  ru: { eyebrow: "Рост балла IELTS Speaking" },
  ar: { eyebrow: "تحسين درجة IELTS Speaking" },
  ja: { eyebrow: "IELTS Speakingスコア向上" },
  ko: { eyebrow: "IELTS Speaking 점수 향상" }
} as const;

export default async function HomePage() {
  const language = await getServerLanguage();
  const shellCopy = homeShellCopy[language] ?? homeShellCopy.en;

  return (
    <>
      <MarketingSchema />
      <SiteHeader />
      <MarketingPage
        eyebrow={shellCopy.eyebrow}
        title="IELTS Speaking Practice with AI"
        description="Practice real questions, get instant feedback, and improve your English speaking fluency faster."
        focus="SpeakAce helps learners practice online, see IELTS-style band signals, and turn every answer into a clearer next attempt."
        ctaHref="/app/practice"
        variant="minimal"
      />
    </>
  );
}

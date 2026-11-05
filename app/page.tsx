import type { Metadata } from "next";
import "./voice-in-motion.css";
import { MarketingSchema } from "@/components/marketing-schema";
import { EditorialHome } from "@/components/editorial-home";
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

export default function HomePage() {
  return <><MarketingSchema /><EditorialHome /></>;
}

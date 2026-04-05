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
  en: {
    eyebrow: "IELTS speaking score improvement",
    title: "Increase your IELTS Speaking score with AI practice",
    description: "Practice real questions, get instant feedback, and improve your English speaking fluency faster.",
    focus: "SpeakAce helps learners practice online, see IELTS-style band signals, and turn every answer into a clearer next attempt."
  },
  tr: {
    eyebrow: "IELTS speaking skoru gelişimi",
    title: "Yapay zekâ ile IELTS speaking skorunu yükselt",
    description: "Gerçek sorularla çalış, anında geri bildirim al ve İngilizce konuşma akıcılığını daha hızlı geliştir.",
    focus: "SpeakAce, öğrencilerin çevrim içi pratik yapmasına, IELTS benzeri band sinyallerini görmesine ve her cevabı daha net bir sonraki denemeye dönüştürmesine yardımcı olur."
  },
  de: {
    eyebrow: "IELTS-Speaking-Score verbessern",
    title: "Steigere deinen IELTS-Speaking-Score mit KI-Training",
    description: "Übe echte Fragen, erhalte sofortiges Feedback und verbessere deine englische Sprechflüssigkeit schneller.",
    focus: "SpeakAce hilft Lernenden, online zu üben, IELTS-ähnliche Band-Signale zu sehen und jede Antwort in einen klareren nächsten Versuch zu verwandeln."
  },
  es: {
    eyebrow: "Mejora tu puntuación en IELTS speaking",
    title: "Mejora tu puntuación de IELTS Speaking con práctica con IA",
    description: "Practica preguntas reales, recibe feedback instantáneo y mejora tu fluidez en inglés más rápido.",
    focus: "SpeakAce ayuda a los estudiantes a practicar online, ver señales de banda al estilo IELTS y convertir cada respuesta en un intento más claro."
  },
  fr: {
    eyebrow: "Amélioration du score IELTS speaking",
    title: "Augmentez votre score IELTS Speaking avec la pratique IA",
    description: "Travaillez de vraies questions, recevez un retour immédiat et améliorez plus vite votre fluidité en anglais.",
    focus: "SpeakAce aide les apprenants à pratiquer en ligne, voir des signaux de niveau de type IELTS et transformer chaque réponse en une meilleure nouvelle tentative."
  },
  it: {
    eyebrow: "Migliora il tuo punteggio IELTS speaking",
    title: "Aumenta il tuo punteggio IELTS Speaking con la pratica IA",
    description: "Fai pratica con domande reali, ricevi feedback immediato e migliora più velocemente la tua fluidità in inglese.",
    focus: "SpeakAce aiuta gli studenti a esercitarsi online, vedere segnali di livello in stile IELTS e trasformare ogni risposta in un tentativo più chiaro."
  },
  pt: {
    eyebrow: "Melhore sua pontuação no IELTS speaking",
    title: "Aumente sua pontuação no IELTS Speaking com prática por IA",
    description: "Pratique perguntas reais, receba feedback instantâneo e melhore sua fluência em inglês mais rápido.",
    focus: "O SpeakAce ajuda estudantes a praticar online, ver sinais de banda no estilo IELTS e transformar cada resposta em uma nova tentativa mais clara."
  },
  nl: {
    eyebrow: "Verbeter je IELTS-speaking-score",
    title: "Verhoog je IELTS Speaking-score met AI-oefening",
    description: "Oefen met echte vragen, krijg direct feedback en verbeter je Engelse spreekvloeiendheid sneller.",
    focus: "SpeakAce helpt leerlingen online te oefenen, IELTS-achtige bandsignalen te zien en elk antwoord om te zetten in een sterkere volgende poging."
  },
  pl: {
    eyebrow: "Popraw wynik IELTS speaking",
    title: "Podnieś wynik IELTS Speaking dzięki ćwiczeniom z AI",
    description: "Ćwicz na prawdziwych pytaniach, otrzymuj natychmiastowy feedback i szybciej poprawiaj płynność mówienia po angielsku.",
    focus: "SpeakAce pomaga ćwiczyć online, zobaczyć sygnały punktacji w stylu IELTS i zamienić każdą odpowiedź w lepszą kolejną próbę."
  },
  ru: {
    eyebrow: "Рост балла IELTS Speaking",
    title: "Повышайте балл IELTS Speaking с практикой на ИИ",
    description: "Практикуйтесь на реальных вопросах, получайте мгновенную обратную связь и быстрее улучшайте беглость английской речи.",
    focus: "SpeakAce помогает заниматься онлайн, видеть сигналы уровня в стиле IELTS и превращать каждый ответ в более сильную следующую попытку."
  },
  ar: {
    eyebrow: "تحسين درجة IELTS Speaking",
    title: "ارفع درجة IELTS Speaking بالتدريب بالذكاء الاصطناعي",
    description: "تدرّب على أسئلة حقيقية، واحصل على ملاحظات فورية، وطوّر طلاقتك في التحدث بالإنجليزية بشكل أسرع.",
    focus: "يساعد SpeakAce المتعلمين على التدريب عبر الإنترنت، ورؤية مؤشرات شبيهة بدرجات IELTS، وتحويل كل إجابة إلى محاولة أوضح وأقوى."
  },
  ja: {
    eyebrow: "IELTS Speakingスコア向上",
    title: "AI練習でIELTS Speakingスコアを伸ばす",
    description: "実際の質問で練習し、すぐにフィードバックを受け取り、英語の流暢さをより速く伸ばしましょう。",
    focus: "SpeakAceは、オンライン練習、IELTS風のバンドシグナルの確認、そして各回答をより明確な次の挑戦へ変えるのを助けます。"
  },
  ko: {
    eyebrow: "IELTS Speaking 점수 향상",
    title: "AI 연습으로 IELTS Speaking 점수를 높이세요",
    description: "실제 질문으로 연습하고 즉시 피드백을 받아 영어 말하기 유창성을 더 빠르게 높이세요.",
    focus: "SpeakAce는 학습자가 온라인으로 연습하고 IELTS식 밴드 신호를 확인하며 모든 답변을 더 나은 다음 시도로 바꾸도록 도와줍니다."
  }
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
        title={shellCopy.title}
        description={shellCopy.description}
        focus={shellCopy.focus}
        ctaHref="/app/practice"
        variant="minimal"
      />
    </>
  );
}

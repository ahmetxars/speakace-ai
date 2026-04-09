import type { Metadata } from "next";
import Link from "next/link";
import type { Language } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

const aboutCopy = {
  en: {
    metaTitle: "About SpeakAce",
    metaDescription:
      "Learn who SpeakAce is, what we are building, and why we want IELTS and TOEFL speaking practice to feel more helpful and human.",
    eyebrow: "About SpeakAce",
    title: "Who is SpeakAce?",
    intro:
      "SpeakAce is a next-generation speaking practice platform built to make IELTS and TOEFL preparation clearer, more motivating, and more accessible. Our goal is to help learners know what to say, what to fix, and how to feel more confident in each retry.",
    mission: "Our mission",
    missionText:
      "We do not just want to show a score. We want learners to understand why they got that score and what should change in the next attempt.",
    approach: "Our approach",
    approachText:
      "We build SpeakAce as a calm, practical study space. Every feature should create more clarity, more repetition, and a stronger sense of progress.",
    focus: "What the team focuses on",
    focusText:
      "We improve the product step by step by thinking about students, teachers, and schools together and refining the system every day.",
    beliefEyebrow: "What we believe",
    beliefTitle: "We want stronger speaking practice to feel easier to start",
    beliefText:
      "A good speaking platform should not confuse learners. It should show the next step clearly and make consistent practice easier to keep.",
    start: "Start practice",
    viewPlus: "View Plus"
  },
  tr: {
    metaTitle: "SpeakAce Hakkında",
    metaDescription:
      "SpeakAce'in kim olduğunu, ne inşa ettiğini ve neden IELTS ile TOEFL speaking çalışmasını daha faydalı hale getirmek istediğini öğren.",
    eyebrow: "SpeakAce Hakkında",
    title: "SpeakAce kimdir?",
    intro:
      "SpeakAce, IELTS ve TOEFL hazırlığını daha net, daha motive edici ve daha erişilebilir hale getirmek için kurulan yeni nesil bir speaking çalışma platformudur. Amacımız öğrencinin her denemede ne söyleyeceğini, neyi düzeltmesi gerektiğini ve nasıl daha güvenli hissedeceğini daha iyi göstermektir.",
    mission: "Amacımız",
    missionText:
      "Sadece bir puan göstermek değil, öğrencinin o puanı neden aldığını ve sıradaki denemede neyi değiştirmesi gerektiğini de göstermek istiyoruz.",
    approach: "Yaklaşımımız",
    approachText:
      "SpeakAce'i sakin ve kullanışlı bir çalışma alanı olarak inşa ediyoruz. Her özellik daha fazla netlik, daha fazla tekrar ve daha güçlü bir ilerleme hissi vermeli.",
    focus: "Ekibimizin odağı",
    focusText:
      "Öğrenci, öğretmen ve kurum tarafını birlikte düşünerek sistemi her gün biraz daha rafine ediyoruz.",
    beliefEyebrow: "İnandığımız şey",
    beliefTitle: "Daha güçlü speaking pratiği daha kolay başlamalı",
    beliefText:
      "İyi bir speaking platformu öğrenciyi yormamalı. Sonraki adımı açıkça göstermeli ve düzenli pratiği sürdürmeyi kolaylaştırmalı.",
    start: "Pratiğe başla",
    viewPlus: "Plus'ı gör"
  },
  de: {
    metaTitle: "Über SpeakAce",
    metaDescription: "Erfahre, was SpeakAce aufbaut und warum IELTS- und TOEFL-Speaking klarer werden soll.",
    eyebrow: "Über SpeakAce",
    title: "Wer ist SpeakAce?",
    intro: "SpeakAce ist eine Speaking-Lernplattform der nächsten Generation für klarere und zugänglichere IELTS- und TOEFL-Vorbereitung.",
    mission: "Unsere Mission",
    missionText: "Wir wollen nicht nur einen Score zeigen, sondern auch erklären, warum er so ausfällt und was sich im nächsten Versuch ändern sollte.",
    approach: "Unser Ansatz",
    approachText: "SpeakAce soll ein ruhiger, praktischer Lernraum sein. Jede Funktion soll mehr Klarheit und mehr Fortschrittsgefühl erzeugen.",
    focus: "Worauf sich das Team konzentriert",
    focusText: "Wir verbessern das Produkt Schritt für Schritt für Lernende, Lehrkräfte und Schulen.",
    beliefEyebrow: "Unser Glaube",
    beliefTitle: "Stärkeres Speaking-Training sollte leichter zu beginnen sein",
    beliefText: "Eine gute Speaking-Plattform sollte den nächsten Schritt klar zeigen und regelmäßige Übung leichter machen.",
    start: "Übung starten",
    viewPlus: "Plus ansehen"
  },
  fr: {
    metaTitle: "À propos de SpeakAce",
    metaDescription: "Découvrez ce que SpeakAce construit et pourquoi la préparation IELTS et TOEFL speaking doit être plus claire.",
    eyebrow: "À propos de SpeakAce",
    title: "Qui est SpeakAce ?",
    intro: "SpeakAce est une plateforme nouvelle génération conçue pour rendre la préparation IELTS et TOEFL speaking plus claire, plus motivante et plus accessible.",
    mission: "Notre mission",
    missionText: "Nous ne voulons pas seulement afficher un score, mais aussi montrer pourquoi ce score apparaît et quoi changer à la tentative suivante.",
    approach: "Notre approche",
    approachText: "Nous construisons SpeakAce comme un espace d’étude calme et pratique. Chaque fonction doit apporter plus de clarté et de progression.",
    focus: "L’objectif de l’équipe",
    focusText: "Nous améliorons le produit pas à pas pour les apprenants, les enseignants et les écoles.",
    beliefEyebrow: "Notre conviction",
    beliefTitle: "Une meilleure pratique du speaking doit être plus facile à commencer",
    beliefText: "Une bonne plateforme de speaking doit montrer clairement l’étape suivante et faciliter la régularité.",
    start: "Commencer",
    viewPlus: "Voir Plus"
  },
  nl: {
    metaTitle: "Over SpeakAce",
    metaDescription: "Lees wie SpeakAce is, wat we bouwen en waarom IELTS- en TOEFL-speaking duidelijker moet voelen.",
    eyebrow: "Over SpeakAce",
    title: "Wie is SpeakAce?",
    intro: "SpeakAce is een speaking-platform van de nieuwe generatie dat IELTS- en TOEFL-voorbereiding duidelijker, motiverender en toegankelijker maakt.",
    mission: "Onze missie",
    missionText: "We willen niet alleen een score tonen, maar ook laten zien waarom die score ontstaat en wat er bij de volgende poging moet veranderen.",
    approach: "Onze aanpak",
    approachText: "We bouwen SpeakAce als een rustige, praktische studieplek. Elke functie moet meer duidelijkheid en meer voortgangsgevoel geven.",
    focus: "Waar het team zich op richt",
    focusText: "We verbeteren het product stap voor stap voor leerlingen, docenten en scholen.",
    beliefEyebrow: "Waar we in geloven",
    beliefTitle: "Sterkere speaking-oefening moet makkelijker te starten zijn",
    beliefText: "Een goed speaking-platform moet de volgende stap duidelijk maken en regelmatig oefenen eenvoudiger houden.",
    start: "Start oefening",
    viewPlus: "Bekijk Plus"
  }
} as const;

function getAboutCopy(language: Language) {
  return ((aboutCopy as unknown) as Partial<Record<Language, (typeof aboutCopy)["en"]>>)[language] ?? aboutCopy.en;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const copy = getAboutCopy(language);

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: {
      canonical: "/about"
    },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: `${siteConfig.domain}/about`,
      siteName: siteConfig.name,
      type: "website"
    }
  };
}

export default async function AboutPage() {
  const language = await getServerLanguage();
  const copy = getAboutCopy(language);

  return (
    <>
      <main className="page-shell section" style={{ display: "grid", gap: "1.2rem" }}>
        <div className="section-head">
          <span className="eyebrow">{copy.eyebrow}</span>
          <h1 style={{ fontSize: "clamp(2.7rem, 6vw, 5rem)", lineHeight: 0.95 }}>{copy.title}</h1>
          <p>{copy.intro}</p>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>{copy.mission}</h3>
            <p>{copy.missionText}</p>
          </article>
          <article className="card feature-card">
            <h3>{copy.approach}</h3>
            <p>{copy.approachText}</p>
          </article>
          <article className="card feature-card">
            <h3>{copy.focus}</h3>
            <p>{copy.focusText}</p>
          </article>
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">{copy.beliefEyebrow}</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{copy.beliefTitle}</h2>
            <p className="practice-copy">{copy.beliefText}</p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/app/practice">
              {copy.start}
            </Link>
            <Link className="button button-primary" href="/pricing">
              {copy.viewPlus}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

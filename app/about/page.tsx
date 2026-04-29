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

        {/* Why AI section */}
        <div className="section-head" style={{ paddingTop: "0.5rem" }}>
          <span className="eyebrow">Why AI</span>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 0.98 }}>
            Speaking feedback available at any hour
          </h2>
          <p>
            Getting meaningful speaking feedback used to mean booking a tutor, waiting for a slot, and hoping for detailed notes.
            SpeakAce replaces that wait with an AI coach that is available every day, scores every attempt, and always has time for one more retry.
          </p>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Available 24/7</h3>
            <p>Practice at 6am before work or 11pm after class. No scheduling, no waiting lists, no cancellations.</p>
          </article>
          <article className="card feature-card">
            <h3>Instant, detailed feedback</h3>
            <p>Every speaking attempt produces a score across fluency, pronunciation, grammar, and vocabulary — within seconds.</p>
          </article>
          <article className="card feature-card">
            <h3>Affordable at any level</h3>
            <p>From free daily practice to unlimited plans, SpeakAce fits a student budget without cutting corners on feedback quality.</p>
          </article>
          <article className="card feature-card">
            <h3>Real-time improvement loop</h3>
            <p>Read your transcript, see the improved version, and retry immediately. That cycle is what turns feedback into actual score growth.</p>
          </article>
        </div>

        {/* How it works */}
        <div className="section-head" style={{ paddingTop: "0.5rem" }}>
          <span className="eyebrow">How it works</span>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 0.98 }}>
            AI that evaluates the full picture
          </h2>
          <p>
            SpeakAce does not only check if you spoke. It evaluates how you spoke — looking at pronunciation clarity,
            fluency and natural rhythm, grammatical range and accuracy, and vocabulary depth. Each dimension contributes to an
            overall band estimate that reflects real IELTS and TOEFL marking criteria.
          </p>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Pronunciation</h3>
            <p>Evaluates clarity, word stress, and how well individual sounds are produced and understood.</p>
          </article>
          <article className="card feature-card">
            <h3>Fluency and coherence</h3>
            <p>Measures natural pacing, idea linking, pause frequency, and whether the response flows or sounds rehearsed.</p>
          </article>
          <article className="card feature-card">
            <h3>Grammar</h3>
            <p>Checks grammatical range and accuracy — whether you use a variety of structures and how cleanly you control them.</p>
          </article>
          <article className="card feature-card">
            <h3>Vocabulary</h3>
            <p>Evaluates word range, precision, and whether you can express ideas with appropriately varied and specific language.</p>
          </article>
        </div>

        {/* Who uses SpeakAce */}
        <div className="section-head" style={{ paddingTop: "0.5rem" }}>
          <span className="eyebrow">Who uses SpeakAce</span>
          <h2 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 0.98 }}>
            Self-study learners, teachers, and institutions
          </h2>
        </div>

        <div className="marketing-grid">
          <article className="card feature-card">
            <h3>Self-study learners</h3>
            <p>Candidates preparing for IELTS or TOEFL independently who want real feedback, not just practice prompts. SpeakAce replaces the tutor for daily habit work.</p>
          </article>
          <article className="card feature-card">
            <h3>Teachers with classes</h3>
            <p>Teachers who want students to practice outside class and come to lessons already knowing their weak spots. Class tools, homework assignments, and at-risk alerts are built in.</p>
          </article>
          <article className="card feature-card">
            <h3>Language institutions</h3>
            <p>Schools and training centres that need scalable speaking practice for many students without scaling teacher hours proportionally.</p>
          </article>
        </div>

        {/* Stats / social proof */}
        <div className="marketing-grid">
          <article className="card feature-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>40+</div>
            <h3 style={{ marginTop: "0.5rem" }}>Countries</h3>
            <p>Learners from over 40 countries use SpeakAce to prepare for IELTS and TOEFL speaking sections.</p>
          </article>
          <article className="card feature-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>10k+</div>
            <h3 style={{ marginTop: "0.5rem" }}>Speaking sessions</h3>
            <p>More than ten thousand speaking attempts have been scored, transcribed, and reviewed on the platform.</p>
          </article>
          <article className="card feature-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1 }}>24/7</div>
            <h3 style={{ marginTop: "0.5rem" }}>Always available</h3>
            <p>No office hours, no booking required. Every learner gets the same quality of feedback at any time of day.</p>
          </article>
        </div>

        {/* Feedback quality */}
        <div className="card institution-cta" style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <div>
            <span className="eyebrow">Feedback quality</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>Our approach to making feedback actually useful</h2>
            <p className="practice-copy">
              A score alone does not improve speaking. SpeakAce pairs every score with a full transcript, an improved version of your answer,
              category-level breakdown, and specific suggestions for the next attempt. The feedback loop is designed so that a learner who
              completes five sessions in a week can see exactly what is changing and what still needs work.
            </p>
            <p className="practice-copy" style={{ marginTop: "0.75rem" }}>
              We refine the feedback model continuously — checking it against real IELTS rubric criteria, testing edge cases in non-native speech,
              and improving the clarity of the language the system uses to explain what needs to change.
            </p>
          </div>
        </div>

        <div className="card institution-cta">
          <div>
            <span className="eyebrow">{copy.beliefEyebrow}</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>{copy.beliefTitle}</h2>
            <p className="practice-copy">{copy.beliefText}</p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              {copy.start}
            </Link>
            <Link className="button button-secondary" href="/pricing">
              {copy.viewPlus}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

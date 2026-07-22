import type { Metadata, Route } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  Mic2,
  RefreshCw,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

type AboutLocaleContent = {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  title: string;
  intro: string;
  heroPrimary: string;
  heroSecondary: string;
  promiseEyebrow: string;
  promise: string;
  promiseSignals: [string, string, string];
  principlesEyebrow: string;
  principlesTitle: string;
  principlesDescription: string;
  principles: Array<{ title: string; description: string }>;
  loopEyebrow: string;
  loopTitle: string;
  loopDescription: string;
  loopSteps: Array<{ title: string; description: string }>;
  feedbackEyebrow: string;
  feedbackTitle: string;
  feedbackRows: [string, string, string, string];
  feedbackNote: string;
  audiencesEyebrow: string;
  audiencesTitle: string;
  audiencesDescription: string;
  audienceLink: string;
  audiences: Array<{ href: Route; title: string; description: string }>;
  trustEyebrow: string;
  trustTitle: string;
  trustDescription: string;
  trustPoints: [string, string, string];
  finalEyebrow: string;
  finalTitle: string;
  finalDescription: string;
  start: string;
  viewPlus: string;
};

const aboutContent: Record<PublicLanguage, AboutLocaleContent> = {
  en: {
    metaTitle: "About SpeakAce",
    metaDescription: "Learn why SpeakAce is building a clearer, more practical way to practise IELTS and TOEFL speaking.",
    heroEyebrow: "About SpeakAce",
    title: "Speaking improves when the next attempt is obvious.",
    intro: "SpeakAce is an independent AI practice platform for IELTS and TOEFL learners. We turn a recorded answer into a transcript, a score signal, focused feedback, and a clearer retry.",
    heroPrimary: "Try a speaking task",
    heroSecondary: "Explore the resources",
    promiseEyebrow: "Our product promise",
    promise: "Never leave a learner with only a number. Show what changed, what matters, and what to do next.",
    promiseSignals: ["Clear feedback", "Deliberate repetition", "Visible progress"],
    principlesEyebrow: "How we build",
    principlesTitle: "Three principles behind every product decision",
    principlesDescription: "The platform should reduce uncertainty, create useful repetition, and stay honest about what AI feedback can do.",
    principles: [
      { title: "Clarity before complexity", description: "The learner should understand the next useful action without decoding a dashboard." },
      { title: "Feedback should lead to a retry", description: "Advice matters only when it helps the next answer become more specific, fluent, or controlled." },
      { title: "Trust is part of the product", description: "Score estimates are guidance, not official exam results, and the interface should make that boundary clear." },
    ],
    loopEyebrow: "The practice loop",
    loopTitle: "One answer becomes a plan for the next one.",
    loopDescription: "SpeakAce is designed around a short loop learners can repeat without waiting for a lesson or losing momentum.",
    loopSteps: [
      { title: "Choose a focused task", description: "Start with a real IELTS or TOEFL question and a clear time limit." },
      { title: "Record one honest attempt", description: "Speak naturally instead of trying to produce a memorised perfect answer." },
      { title: "Review the evidence", description: "Use the transcript, category signals, and concrete feedback to find one priority." },
      { title: "Retry with intent", description: "Apply one change while the task and feedback are still fresh." },
    ],
    feedbackEyebrow: "Useful by design",
    feedbackTitle: "Feedback looks at the full answer",
    feedbackRows: ["Fluency and coherence", "Pronunciation clarity", "Grammar control", "Vocabulary range"],
    feedbackNote: "Each category should end in a practical next move, not a generic compliment.",
    audiencesEyebrow: "Built for real study contexts",
    audiencesTitle: "One practice engine, three ways to use it",
    audiencesDescription: "Learners need useful repetition. Teachers need visibility between lessons. Programmes need a consistent practice layer.",
    audienceLink: "See the programme",
    audiences: [
      { href: "/for-students", title: "Independent learners", description: "Practise on your own schedule and know what to improve in the next answer." },
      { href: "/for-teachers", title: "Teachers and classes", description: "See who practised, where learners are stuck, and what the next lesson should address." },
      { href: "/for-schools", title: "Schools and programmes", description: "Pilot a consistent speaking workflow before expanding it across more cohorts." },
    ],
    trustEyebrow: "Responsible use",
    trustTitle: "AI feedback should support judgement, not pretend to replace it.",
    trustDescription: "SpeakAce gives practice guidance and estimated score signals. Official IELTS and TOEFL results come only from their authorised exam providers.",
    trustPoints: ["No claim of an official exam score", "Learners can review the transcript behind the feedback", "Teachers remain in control of classroom decisions"],
    finalEyebrow: "See it in practice",
    finalTitle: "The best explanation of SpeakAce is one complete attempt.",
    finalDescription: "Choose a task, record an answer, review the evidence, and decide whether the next attempt feels clearer.",
    start: "Start free practice",
    viewPlus: "View Plus plans",
  },
  tr: {
    metaTitle: "SpeakAce Hakkında",
    metaDescription: "SpeakAce’in IELTS ve TOEFL speaking pratiğini neden daha net ve uygulanabilir hale getirdiğini öğren.",
    heroEyebrow: "SpeakAce Hakkında",
    title: "Sıradaki deneme net olduğunda speaking gelişir.",
    intro: "SpeakAce, IELTS ve TOEFL öğrencileri için bağımsız bir AI pratik platformudur. Kaydedilen cevabı transcript, skor sinyali, odaklı geri bildirim ve daha net bir tekrara dönüştürürüz.",
    heroPrimary: "Bir speaking görevi dene",
    heroSecondary: "Kaynakları keşfet",
    promiseEyebrow: "Ürün sözümüz",
    promise: "Öğrenciyi yalnızca bir sayıyla bırakma. Neyin değiştiğini, neyin önemli olduğunu ve sırada ne yapacağını göster.",
    promiseSignals: ["Net geri bildirim", "Bilinçli tekrar", "Görünen ilerleme"],
    principlesEyebrow: "Nasıl inşa ediyoruz",
    principlesTitle: "Her ürün kararının arkasındaki üç ilke",
    principlesDescription: "Platform belirsizliği azaltmalı, faydalı tekrar üretmeli ve AI geri bildiriminin sınırları konusunda dürüst olmalı.",
    principles: [
      { title: "Karmaşıklıktan önce netlik", description: "Öğrenci bir dashboard çözmeye çalışmadan sıradaki faydalı hareketi anlamalı." },
      { title: "Geri bildirim tekrara götürmeli", description: "Tavsiye, sıradaki cevabı daha somut, akıcı veya kontrollü yapıyorsa değerlidir." },
      { title: "Güven ürünün parçasıdır", description: "Skor tahminleri yönlendirmedir, resmi sınav sonucu değildir; arayüz bu sınırı açıkça göstermeli." },
    ],
    loopEyebrow: "Pratik döngüsü",
    loopTitle: "Tek bir cevap sıradaki denemenin planına dönüşür.",
    loopDescription: "SpeakAce, ders beklemeden ve ritmi kaybetmeden tekrarlanabilen kısa bir döngü etrafında tasarlandı.",
    loopSteps: [
      { title: "Odaklı bir görev seç", description: "Gerçek bir IELTS veya TOEFL sorusu ve net bir süreyle başla." },
      { title: "Dürüst bir deneme kaydet", description: "Ezberlenmiş kusursuz cevap yerine doğal biçimde konuş." },
      { title: "Kanıtı incele", description: "Transcript, kategori sinyalleri ve somut geri bildirimle tek önceliği bul." },
      { title: "Amaçla tekrar dene", description: "Görev ve geri bildirim tazeyken tek bir değişikliği uygula." },
    ],
    feedbackEyebrow: "Fayda odaklı tasarım",
    feedbackTitle: "Geri bildirim cevabın tamamına bakar",
    feedbackRows: ["Akıcılık ve bütünlük", "Telaffuz netliği", "Dilbilgisi kontrolü", "Kelime çeşitliliği"],
    feedbackNote: "Her kategori genel bir övgüyle değil, uygulanabilir bir sonraki hamleyle bitmeli.",
    audiencesEyebrow: "Gerçek çalışma ortamları için",
    audiencesTitle: "Tek pratik motoru, üç kullanım biçimi",
    audiencesDescription: "Öğrencinin faydalı tekrara, öğretmenin ders arası görünürlüğe, programın tutarlı bir pratik katmanına ihtiyacı vardır.",
    audienceLink: "Programı gör",
    audiences: [
      { href: "/for-students", title: "Bağımsız öğrenciler", description: "Kendi programında pratik yap ve sıradaki cevapta neyi geliştireceğini bil." },
      { href: "/for-teachers", title: "Öğretmenler ve sınıflar", description: "Kimin pratik yaptığını, nerede takıldığını ve sıradaki dersin neye odaklanacağını gör." },
      { href: "/for-schools", title: "Okullar ve programlar", description: "Daha fazla gruba açmadan önce tutarlı bir speaking iş akışını küçük ölçekte dene." },
    ],
    trustEyebrow: "Sorumlu kullanım",
    trustTitle: "AI geri bildirimi kararı desteklemeli, onun yerini alıyormuş gibi davranmamalı.",
    trustDescription: "SpeakAce pratik yönlendirmesi ve tahmini skor sinyalleri verir. Resmi IELTS ve TOEFL sonuçlarını yalnızca yetkili sınav sağlayıcıları verir.",
    trustPoints: ["Resmi sınav skoru iddiası yok", "Öğrenci geri bildirimin dayandığı transcripti görebilir", "Sınıf kararlarının kontrolü öğretmende kalır"],
    finalEyebrow: "Pratikte gör",
    finalTitle: "SpeakAce’in en iyi açıklaması tamamlanmış tek bir denemedir.",
    finalDescription: "Bir görev seç, cevap kaydet, kanıtı incele ve sıradaki denemenin daha net olup olmadığına karar ver.",
    start: "Ücretsiz pratiğe başla",
    viewPlus: "Plus planlarını gör",
  },
  de: {
    metaTitle: "Über SpeakAce",
    metaDescription: "Warum SpeakAce einen klareren und praktischeren Weg für IELTS- und TOEFL-Speaking entwickelt.",
    heroEyebrow: "Über SpeakAce",
    title: "Speaking verbessert sich, wenn der nächste Versuch klar ist.",
    intro: "SpeakAce ist eine unabhängige KI-Übungsplattform für IELTS- und TOEFL-Lernende. Aus einer Aufnahme werden Transkript, Score-Signal, fokussiertes Feedback und ein klarerer neuer Versuch.",
    heroPrimary: "Speaking-Aufgabe testen",
    heroSecondary: "Ressourcen entdecken",
    promiseEyebrow: "Unser Produktversprechen",
    promise: "Lass Lernende nie nur mit einer Zahl zurück. Zeige, was sich verändert hat, was zählt und was als Nächstes zu tun ist.",
    promiseSignals: ["Klares Feedback", "Gezielte Wiederholung", "Sichtbarer Fortschritt"],
    principlesEyebrow: "Wie wir entwickeln",
    principlesTitle: "Drei Prinzipien hinter jeder Produktentscheidung",
    principlesDescription: "Die Plattform soll Unsicherheit reduzieren, nützliche Wiederholung schaffen und ehrlich mit den Grenzen von KI umgehen.",
    principles: [
      { title: "Klarheit vor Komplexität", description: "Der nächste sinnvolle Schritt muss ohne Entschlüsseln eines Dashboards verständlich sein." },
      { title: "Feedback führt zur Wiederholung", description: "Hinweise sind wertvoll, wenn die nächste Antwort konkreter, flüssiger oder kontrollierter wird." },
      { title: "Vertrauen gehört zum Produkt", description: "Score-Schätzungen sind Orientierung und keine offiziellen Prüfungsergebnisse." },
    ],
    loopEyebrow: "Der Übungszyklus",
    loopTitle: "Eine Antwort wird zum Plan für die nächste.",
    loopDescription: "SpeakAce folgt einem kurzen Zyklus, der ohne Unterrichtstermin wiederholt werden kann.",
    loopSteps: [
      { title: "Fokussierte Aufgabe wählen", description: "Mit einer echten IELTS- oder TOEFL-Frage und klarer Zeit starten." },
      { title: "Ehrlichen Versuch aufnehmen", description: "Natürlich sprechen statt eine perfekte Antwort auswendig aufzusagen." },
      { title: "Belege prüfen", description: "Transkript, Kategorien und konkretes Feedback für eine Priorität nutzen." },
      { title: "Gezielt wiederholen", description: "Eine Änderung anwenden, solange Aufgabe und Feedback frisch sind." },
    ],
    feedbackEyebrow: "Nützlich gestaltet",
    feedbackTitle: "Feedback betrachtet die ganze Antwort",
    feedbackRows: ["Flüssigkeit und Kohärenz", "Ausspracheklarheit", "Grammatikkontrolle", "Wortschatzbreite"],
    feedbackNote: "Jede Kategorie soll mit einem praktischen nächsten Schritt enden.",
    audiencesEyebrow: "Für echte Lernkontexte",
    audiencesTitle: "Eine Übungsengine, drei Nutzungsarten",
    audiencesDescription: "Lernende brauchen Wiederholung, Lehrkräfte Sichtbarkeit und Programme einen konsistenten Übungsrahmen.",
    audienceLink: "Programm ansehen",
    audiences: [
      { href: "/for-students", title: "Selbstständig Lernende", description: "Übe nach deinem Zeitplan und kenne den Fokus für die nächste Antwort." },
      { href: "/for-teachers", title: "Lehrkräfte und Klassen", description: "Sieh, wer geübt hat, wo Lernende feststecken und was die nächste Stunde braucht." },
      { href: "/for-schools", title: "Schulen und Programme", description: "Teste einen konsistenten Speaking-Ablauf, bevor du weitere Gruppen hinzufügst." },
    ],
    trustEyebrow: "Verantwortungsvolle Nutzung",
    trustTitle: "KI-Feedback soll Urteilsvermögen unterstützen, nicht ersetzen.",
    trustDescription: "SpeakAce gibt Übungshinweise und geschätzte Score-Signale. Offizielle Ergebnisse kommen nur von autorisierten Prüfungsanbietern.",
    trustPoints: ["Kein Anspruch auf einen offiziellen Prüfungsscore", "Das Transkript hinter dem Feedback bleibt sichtbar", "Lehrkräfte behalten die Kontrolle über Klassenentscheidungen"],
    finalEyebrow: "In der Praxis sehen",
    finalTitle: "Die beste Erklärung von SpeakAce ist ein vollständiger Versuch.",
    finalDescription: "Wähle eine Aufgabe, nimm eine Antwort auf, prüfe die Belege und entscheide, ob der nächste Versuch klarer ist.",
    start: "Kostenlos üben",
    viewPlus: "Plus-Pläne ansehen",
  },
  es: {
    metaTitle: "Sobre SpeakAce",
    metaDescription: "Descubre por qué SpeakAce crea una forma más clara y práctica de preparar IELTS y TOEFL speaking.",
    heroEyebrow: "Sobre SpeakAce",
    title: "El speaking mejora cuando el siguiente intento está claro.",
    intro: "SpeakAce es una plataforma independiente de práctica con IA para estudiantes de IELTS y TOEFL. Convertimos una respuesta grabada en transcript, señal de puntuación, feedback enfocado y un reintento más claro.",
    heroPrimary: "Probar una tarea oral",
    heroSecondary: "Explorar recursos",
    promiseEyebrow: "Nuestra promesa de producto",
    promise: "Nunca dejes al estudiante solo con un número. Muestra qué cambió, qué importa y qué debe hacer después.",
    promiseSignals: ["Feedback claro", "Repetición deliberada", "Progreso visible"],
    principlesEyebrow: "Cómo construimos",
    principlesTitle: "Tres principios detrás de cada decisión",
    principlesDescription: "La plataforma debe reducir la incertidumbre, crear repetición útil y ser honesta sobre los límites de la IA.",
    principles: [
      { title: "Claridad antes que complejidad", description: "El estudiante debe entender la siguiente acción sin descifrar un dashboard." },
      { title: "El feedback debe llevar a repetir", description: "El consejo importa si vuelve la siguiente respuesta más concreta, fluida o controlada." },
      { title: "La confianza forma parte del producto", description: "Las estimaciones orientan; no son resultados oficiales del examen." },
    ],
    loopEyebrow: "El ciclo de práctica",
    loopTitle: "Una respuesta se convierte en el plan de la siguiente.",
    loopDescription: "SpeakAce se diseña alrededor de un ciclo corto que se puede repetir sin esperar una clase.",
    loopSteps: [
      { title: "Elegir una tarea enfocada", description: "Empieza con una pregunta real de IELTS o TOEFL y un tiempo claro." },
      { title: "Grabar un intento honesto", description: "Habla con naturalidad en vez de recitar una respuesta memorizada." },
      { title: "Revisar la evidencia", description: "Usa transcript, categorías y feedback concreto para elegir una prioridad." },
      { title: "Repetir con intención", description: "Aplica un cambio mientras la tarea y el feedback siguen frescos." },
    ],
    feedbackEyebrow: "Útil por diseño",
    feedbackTitle: "El feedback analiza la respuesta completa",
    feedbackRows: ["Fluidez y coherencia", "Claridad de pronunciación", "Control gramatical", "Rango de vocabulario"],
    feedbackNote: "Cada categoría debe terminar en un siguiente paso práctico, no en un elogio genérico.",
    audiencesEyebrow: "Para contextos reales de estudio",
    audiencesTitle: "Un motor de práctica, tres formas de usarlo",
    audiencesDescription: "El alumno necesita repetición, el profesor visibilidad y el programa una capa de práctica consistente.",
    audienceLink: "Ver el programa",
    audiences: [
      { href: "/for-students", title: "Estudiantes independientes", description: "Practica a tu ritmo y sabe qué mejorar en la siguiente respuesta." },
      { href: "/for-teachers", title: "Profesores y clases", description: "Comprueba quién practicó, dónde se atasca y qué debe tratar la próxima clase." },
      { href: "/for-schools", title: "Escuelas y programas", description: "Prueba un flujo consistente antes de ampliarlo a más grupos." },
    ],
    trustEyebrow: "Uso responsable",
    trustTitle: "El feedback de IA debe apoyar el criterio, no fingir que lo sustituye.",
    trustDescription: "SpeakAce ofrece orientación y señales estimadas. Los resultados oficiales solo proceden de proveedores autorizados.",
    trustPoints: ["No afirmamos ofrecer una nota oficial", "El estudiante puede revisar el transcript del feedback", "El profesor mantiene el control de las decisiones de clase"],
    finalEyebrow: "Verlo en práctica",
    finalTitle: "La mejor explicación de SpeakAce es un intento completo.",
    finalDescription: "Elige una tarea, graba una respuesta, revisa la evidencia y comprueba si el siguiente intento resulta más claro.",
    start: "Practicar gratis",
    viewPlus: "Ver planes Plus",
  },
  fr: {
    metaTitle: "À propos de SpeakAce",
    metaDescription: "Découvrez pourquoi SpeakAce construit une pratique IELTS et TOEFL speaking plus claire et concrète.",
    heroEyebrow: "À propos de SpeakAce",
    title: "Le speaking progresse quand la prochaine tentative est claire.",
    intro: "SpeakAce est une plateforme indépendante de pratique IA pour l’IELTS et le TOEFL. Une réponse enregistrée devient transcript, signal de score, feedback ciblé et nouvelle tentative plus claire.",
    heroPrimary: "Essayer une tâche orale",
    heroSecondary: "Explorer les ressources",
    promiseEyebrow: "Notre promesse produit",
    promise: "Ne jamais laisser l’apprenant avec un simple chiffre. Montrer ce qui change, ce qui compte et quoi faire ensuite.",
    promiseSignals: ["Feedback clair", "Répétition ciblée", "Progrès visible"],
    principlesEyebrow: "Notre façon de construire",
    principlesTitle: "Trois principes derrière chaque décision produit",
    principlesDescription: "La plateforme doit réduire l’incertitude, créer une répétition utile et rester honnête sur les limites de l’IA.",
    principles: [
      { title: "La clarté avant la complexité", description: "L’apprenant doit comprendre l’action suivante sans décoder un dashboard." },
      { title: "Le feedback doit mener à une nouvelle tentative", description: "Un conseil compte s’il rend la réponse suivante plus précise, fluide ou maîtrisée." },
      { title: "La confiance fait partie du produit", description: "Les estimations sont des repères, pas des résultats officiels." },
    ],
    loopEyebrow: "La boucle de pratique",
    loopTitle: "Une réponse devient le plan de la suivante.",
    loopDescription: "SpeakAce repose sur une boucle courte à répéter sans attendre un cours.",
    loopSteps: [
      { title: "Choisir une tâche ciblée", description: "Commencez avec une vraie question IELTS ou TOEFL et une durée claire." },
      { title: "Enregistrer une tentative honnête", description: "Parlez naturellement plutôt que de réciter une réponse mémorisée." },
      { title: "Examiner les preuves", description: "Utilisez transcript, catégories et feedback concret pour choisir une priorité." },
      { title: "Recommencer avec intention", description: "Appliquez un changement pendant que la tâche et le feedback sont frais." },
    ],
    feedbackEyebrow: "Utile par conception",
    feedbackTitle: "Le feedback observe la réponse complète",
    feedbackRows: ["Fluidité et cohérence", "Clarté de prononciation", "Maîtrise grammaticale", "Étendue du vocabulaire"],
    feedbackNote: "Chaque catégorie doit finir sur une prochaine action concrète.",
    audiencesEyebrow: "Pour des contextes d’étude réels",
    audiencesTitle: "Un moteur de pratique, trois usages",
    audiencesDescription: "L’apprenant a besoin de répétition, l’enseignant de visibilité et le programme d’une pratique cohérente.",
    audienceLink: "Voir le programme",
    audiences: [
      { href: "/for-students", title: "Apprenants autonomes", description: "Pratiquez à votre rythme et sachez quoi améliorer dans la prochaine réponse." },
      { href: "/for-teachers", title: "Enseignants et classes", description: "Voyez qui a pratiqué, où se trouvent les blocages et quoi traiter au prochain cours." },
      { href: "/for-schools", title: "Écoles et programmes", description: "Testez un parcours speaking cohérent avant de l’étendre à d’autres groupes." },
    ],
    trustEyebrow: "Usage responsable",
    trustTitle: "Le feedback IA doit soutenir le jugement, pas prétendre le remplacer.",
    trustDescription: "SpeakAce fournit des conseils et des signaux estimés. Seuls les organismes autorisés donnent des résultats officiels.",
    trustPoints: ["Aucune prétention de score officiel", "Le transcript derrière le feedback reste consultable", "Les enseignants gardent le contrôle des décisions de classe"],
    finalEyebrow: "Voir en pratique",
    finalTitle: "La meilleure explication de SpeakAce est une tentative complète.",
    finalDescription: "Choisissez une tâche, enregistrez une réponse, examinez les preuves et voyez si la tentative suivante devient plus claire.",
    start: "Pratiquer gratuitement",
    viewPlus: "Voir les offres Plus",
  },
};

const principleIcons = [Target, RefreshCw, ShieldCheck] as const;
const audienceIcons = [UserRound, GraduationCap, School] as const;

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const copy = aboutContent[normalizePublicLanguage(language)];
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical: "/about" },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: `${siteConfig.domain}/about`,
      siteName: siteConfig.name,
      type: "website",
    },
  };
}

export default async function AboutPage() {
  const language = await getServerLanguage();
  const copy = aboutContent[normalizePublicLanguage(language)];

  return (
    <main className="about-story">
      <section className="about-story-hero">
        <div className="about-story-hero-copy">
          <span className="content-kicker"><Sparkles size={14} />{copy.heroEyebrow}</span>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
          <div className="about-story-actions">
            <Link className="button button-primary" href="/app/practice">{copy.heroPrimary}<ArrowRight size={16} /></Link>
            <Link className="button button-secondary" href="/resources">{copy.heroSecondary}</Link>
          </div>
        </div>

        <aside className="about-story-promise">
          <div><BrainCircuit size={22} /><span>{copy.promiseEyebrow}</span></div>
          <blockquote>{copy.promise}</blockquote>
          <div className="about-story-promise-signals">
            {copy.promiseSignals.map((signal) => <span key={signal}><CheckCircle2 size={13} />{signal}</span>)}
          </div>
        </aside>
      </section>

      <section className="about-story-principles">
        <div className="about-story-section-head">
          <div><span className="content-kicker">{copy.principlesEyebrow}</span><h2>{copy.principlesTitle}</h2></div>
          <p>{copy.principlesDescription}</p>
        </div>
        <div className="about-story-principle-grid">
          {copy.principles.map((principle, index) => {
            const Icon = principleIcons[index];
            return (
              <article key={principle.title}>
                <div><span>{String(index + 1).padStart(2, "0")}</span><Icon size={19} /></div>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="about-story-loop">
        <div className="about-story-loop-copy">
          <span className="content-kicker"><RefreshCw size={14} />{copy.loopEyebrow}</span>
          <h2>{copy.loopTitle}</h2>
          <p>{copy.loopDescription}</p>
          <ol>
            {copy.loopSteps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{step.title}</strong><p>{step.description}</p></div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="about-story-feedback">
          <div className="about-story-feedback-head">
            <div><Mic2 size={20} /><span>{copy.feedbackEyebrow}</span></div>
            <BrainCircuit size={19} />
          </div>
          <h3>{copy.feedbackTitle}</h3>
          <div className="about-story-feedback-rows">
            {copy.feedbackRows.map((row, index) => (
              <div key={row}><span>{String(index + 1).padStart(2, "0")}</span><strong>{row}</strong><i /></div>
            ))}
          </div>
          <p><Sparkles size={14} />{copy.feedbackNote}</p>
        </aside>
      </section>

      <section className="about-story-audiences">
        <div className="about-story-section-head">
          <div><span className="content-kicker">{copy.audiencesEyebrow}</span><h2>{copy.audiencesTitle}</h2></div>
          <p>{copy.audiencesDescription}</p>
        </div>
        <div className="about-story-audience-grid">
          {copy.audiences.map((audience, index) => {
            const Icon = audienceIcons[index];
            return (
              <Link key={audience.href} href={audience.href}>
                <div><Icon size={20} /><span>{String(index + 1).padStart(2, "0")}</span></div>
                <h3>{audience.title}</h3>
                <p>{audience.description}</p>
                <span>{copy.audienceLink}<ArrowRight size={15} /></span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="about-story-trust">
        <div className="about-story-trust-icon"><ShieldCheck size={28} /></div>
        <div>
          <span className="content-kicker">{copy.trustEyebrow}</span>
          <h2>{copy.trustTitle}</h2>
          <p>{copy.trustDescription}</p>
        </div>
        <ul>
          {copy.trustPoints.map((point) => <li key={point}><CheckCircle2 size={15} />{point}</li>)}
        </ul>
      </section>

      <section className="about-story-conversion">
        <div>
          <span className="content-kicker">{copy.finalEyebrow}</span>
          <h2>{copy.finalTitle}</h2>
          <p>{copy.finalDescription}</p>
        </div>
        <div>
          <Link className="button button-primary" href="/app/practice">{copy.start}<ArrowRight size={16} /></Link>
          <Link className="button button-secondary" href="/pricing">{copy.viewPlus}</Link>
        </div>
      </section>
    </main>
  );
}

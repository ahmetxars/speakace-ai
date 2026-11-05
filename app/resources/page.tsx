import {
  PageHero,
  PageCTA,
  PageSection,
  PublicButton,
  ResourceCard,
} from "@/components/public/page-primitives";
import type { Metadata, Route } from "next";
import { ArrowRight, BookOpenCheck, CheckCircle2 } from "lucide-react";
import { AdSenseUnit } from "@/components/adsense-unit";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import {
  ResourceLibrary,
  type ResourceLibraryItem,
} from "@/components/resource-library";
import { getBlogChromeCopy, getLocalizedBlogPosts } from "@/lib/blog-content";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { getBlogPublicTitle, getBlogPublicDescription } from "@/lib/blog-seo";
import { siteConfig } from "@/lib/site";

type ResourceLocaleContent = {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroIntro: string;
  heroPrimary: string;
  heroSecondary: string;
  signals: [string, string, string];
  routeEyebrow: string;
  routeTitle: string;
  routeSteps: [string, string, string];
  routeNote: string;
  libraryEyebrow: string;
  libraryTitle: string;
  libraryDescription: string;
  libraryTabLabel: string;
  searchPlaceholder: string;
  resultLabel: string;
  openLabel: string;
  showMoreLabel: string;
  categories: Record<"all" | "exam" | "skills" | "tools" | "habit", string>;
  items: ResourceLibraryItem[];
  featuredEyebrow: string;
  featuredTitle: string;
  featuredDescription: string;
  readArticle: string;
  allArticles: string;
  promptEyebrow: string;
  promptTitle: string;
  promptDescription: string;
  openPrompt: string;
  practisePrompt: string;
  leadEyebrow: string;
  leadTitle: string;
  leadDescription: string;
  latestEyebrow: string;
  latestTitle: string;
  latestDescription: string;
  nextEyebrow: string;
  nextTitle: string;
  nextDescription: string;
  startPractice: string;
  viewPlans: string;
};

const bandSevenGuideHref = "/guides/ielts-speaking-band-6-to-7" as Route;
const speakingBandCalculatorHref =
  "/tools/ielts-speaking-band-score-calculator" as Route;

const resourceContent: Record<PublicLanguage, ResourceLocaleContent> = {
  en: {
    metaTitle: "IELTS Speaking Resources | SpeakAce",
    metaDescription:
      "Explore structured IELTS speaking guides, questions, tools, sample answers, and practice paths.",
    heroEyebrow: "SpeakAce resource desk",
    heroTitle: "A clearer route from question to confident answer.",
    heroIntro:
      "Choose the exact skill or exam section you need, read one focused guide, then turn it into a real speaking attempt.",
    heroPrimary: "Browse the library",
    heroSecondary: "Start free practice",
    signals: [
      "14 focused starting points",
      "Free guides and tools",
      "Built to lead into practice",
    ],
    routeEyebrow: "A useful study loop",
    routeTitle: "Read less. Apply more.",
    routeSteps: [
      "Choose one weak point",
      "Study one focused example",
      "Record, review, and retry",
    ],
    routeNote: "Every route below ends with a practical next step.",
    libraryEyebrow: "Resource library",
    libraryTitle: "Find the shortest path to what you need",
    libraryDescription:
      "Filter by exam work, skill building, free tools, or repeatable habits. Search if you already know the topic.",
    libraryTabLabel: "Filter resources",
    searchPlaceholder: "Search resources",
    resultLabel: "resources",
    openLabel: "Open resource",
    showMoreLabel: "Show more resources",
    categories: {
      all: "All",
      exam: "Exam sections",
      skills: "Skills",
      tools: "Free tools",
      habit: "Habits",
    },
    items: [
      {
        href: "/ielts-speaking-topics",
        category: "exam",
        kicker: "Topic bank",
        title: "IELTS speaking topics",
        description:
          "Browse prompts by theme and move straight into a timed answer.",
      },
      {
        href: "/ielts-band-score-guide",
        category: "exam",
        kicker: "Score guide",
        title: "IELTS band score guide",
        description:
          "Understand what changes between bands and what to improve next.",
      },
      {
        href: bandSevenGuideHref,
        category: "skills",
        kicker: "Band 7 retry",
        title: "Move IELTS Speaking from Band 6 to 7",
        description:
          "Use a criterion-led retry plan, before-and-after examples, and a focused Part 2 cue-card drill.",
      },
      {
        href: "/ielts-speaking-part-1-questions",
        category: "exam",
        kicker: "Part 1",
        title: "Short-answer questions",
        description:
          "Build natural openings, direct answers, and calmer fluency.",
      },
      {
        href: "/ielts-speaking-part-2-topics",
        category: "exam",
        kicker: "Part 2",
        title: "Cue-card topics",
        description:
          "Plan a clear long turn with usable examples and story flow.",
      },
      {
        href: "/ielts-speaking-part-3-questions",
        category: "exam",
        kicker: "Part 3",
        title: "Discussion questions",
        description:
          "Develop opinions with reasons, comparisons, and specific examples.",
      },
      {
        href: "/ielts-speaking-sample-answers",
        category: "exam",
        kicker: "Examples",
        title: "Sample speaking answers",
        description:
          "Study useful answer patterns without memorising a script.",
      },
      {
        href: "/english-speaking-confidence",
        category: "skills",
        kicker: "Confidence",
        title: "Speak with less hesitation",
        description:
          "Use practical routines for calmer starts and more consistent delivery.",
      },
      {
        href: "/guides",
        category: "skills",
        kicker: "Skill guides",
        title: "Fluency, structure, and pronunciation",
        description: "Work on one scoring skill at a time with focused guides.",
      },
      {
        href: "/free-ielts-speaking-test",
        category: "tools",
        kicker: "Free test",
        title: "Try an IELTS speaking test",
        description:
          "Experience the flow before choosing a full practice plan.",
      },
      {
        href: "/tools",
        category: "tools",
        kicker: "Toolkit",
        title: "Free IELTS tools",
        description:
          "Use generators, calculators, timers, and planning helpers.",
      },
      {
        href: speakingBandCalculatorHref,
        category: "tools",
        kicker: "Speaking calculator",
        title: "Calculate a band from four speaking criteria",
        description:
          "Combine fluency, vocabulary, grammar, and pronunciation scores, then see the next drill to practise.",
      },
      {
        href: "/compare",
        category: "tools",
        kicker: "Compare",
        title: "Compare speaking tools",
        description:
          "See which practice approach matches the feedback you need.",
      },
      {
        href: "/weekly-ielts-speaking-challenge",
        category: "habit",
        kicker: "Weekly habit",
        title: "Weekly speaking challenge",
        description: "Build momentum with one repeatable challenge each week.",
      },
    ],
    featuredEyebrow: "Editor’s starting point",
    featuredTitle: "One guide worth opening first",
    featuredDescription:
      "A focused article for learners who want a useful improvement they can apply today.",
    readArticle: "Read the article",
    allArticles: "See all articles",
    promptEyebrow: "Prompt of the day",
    promptTitle: "Describe a useful object you use often",
    promptDescription:
      "A simple Part 2 prompt with enough room for detail, examples, and a clear personal story.",
    openPrompt: "Open the prompt",
    practisePrompt: "Practise now",
    leadEyebrow: "Free score guide",
    leadTitle: "Get the IELTS Speaking score diagnostic",
    leadDescription:
      "Get the four-part checklist first; confirm inside it to activate three short score-and-retry emails. Unsubscribe anytime.",
    latestEyebrow: "Continue reading",
    latestTitle: "Three useful next reads",
    latestDescription:
      "Start with one article, then move into a real attempt while the idea is fresh.",
    nextEyebrow: "The next step",
    nextTitle: "Turn one useful idea into one recorded answer.",
    nextDescription:
      "Reading creates clarity. Recording, feedback, and a deliberate retry create progress.",
    startPractice: "Start free practice",
    viewPlans: "View Plus plans",
  },
  tr: {
    metaTitle: "IELTS Speaking Kaynakları | SpeakAce",
    metaDescription:
      "IELTS speaking rehberlerini, soruları, araçları, örnek cevapları ve çalışma yollarını keşfet.",
    heroEyebrow: "SpeakAce kaynak masası",
    heroTitle: "Sorudan güvenli cevaba giden daha net bir yol.",
    heroIntro:
      "İhtiyacın olan beceriyi veya sınav bölümünü seç, tek bir odaklı rehber oku ve öğrendiğini gerçek bir speaking denemesine dönüştür.",
    heroPrimary: "Kütüphaneyi keşfet",
    heroSecondary: "Ücretsiz pratiğe başla",
    signals: [
      "14 odaklı başlangıç noktası",
      "Ücretsiz rehber ve araçlar",
      "Pratiğe bağlanan içerikler",
    ],
    routeEyebrow: "İşe yarayan çalışma döngüsü",
    routeTitle: "Daha az oku. Daha çok uygula.",
    routeSteps: [
      "Tek bir zayıf nokta seç",
      "Odaklı bir örnek incele",
      "Kaydet, değerlendir, tekrar dene",
    ],
    routeNote: "Aşağıdaki her yol net bir sonraki adımla biter.",
    libraryEyebrow: "Kaynak kütüphanesi",
    libraryTitle: "İhtiyacına giden en kısa yolu bul",
    libraryDescription:
      "Sınav bölümü, beceri, ücretsiz araç veya alışkanlığa göre filtrele. Konuyu biliyorsan doğrudan ara.",
    libraryTabLabel: "Kaynakları filtrele",
    searchPlaceholder: "Kaynaklarda ara",
    resultLabel: "kaynak",
    openLabel: "Kaynağı aç",
    showMoreLabel: "Daha fazla kaynak göster",
    categories: {
      all: "Tümü",
      exam: "Sınav bölümleri",
      skills: "Beceriler",
      tools: "Ücretsiz araçlar",
      habit: "Alışkanlıklar",
    },
    items: [
      {
        href: "/ielts-speaking-topics",
        category: "exam",
        kicker: "Konu bankası",
        title: "IELTS speaking konuları",
        description: "Konuları temaya göre seç ve doğrudan süreli cevaba geç.",
      },
      {
        href: "/ielts-band-score-guide",
        category: "exam",
        kicker: "Skor rehberi",
        title: "IELTS band skoru rehberi",
        description:
          "Bandlar arasındaki farkı ve sırada neyi geliştirmen gerektiğini gör.",
      },
      {
        href: bandSevenGuideHref,
        category: "skills",
        kicker: "Band 7 tekrar planı",
        title: "IELTS Speaking 6'dan 7'ye",
        description:
          "Dört kriterli tekrar planını, önce-sonra örneklerini ve odaklı Part 2 cue-card çalışmasını kullan.",
      },
      {
        href: "/ielts-speaking-part-1-questions",
        category: "exam",
        kicker: "Part 1",
        title: "Kısa cevap soruları",
        description:
          "Doğal başlangıçlar, doğrudan cevaplar ve daha sakin akıcılık kur.",
      },
      {
        href: "/ielts-speaking-part-2-topics",
        category: "exam",
        kicker: "Part 2",
        title: "Cue card konuları",
        description:
          "Örnekler ve net hikâye akışıyla güçlü bir uzun cevap planla.",
      },
      {
        href: "/ielts-speaking-part-3-questions",
        category: "exam",
        kicker: "Part 3",
        title: "Tartışma soruları",
        description:
          "Fikrini neden, karşılaştırma ve somut örneklerle geliştir.",
      },
      {
        href: "/ielts-speaking-sample-answers",
        category: "exam",
        kicker: "Örnekler",
        title: "Örnek speaking cevapları",
        description: "Metin ezberlemeden işe yarayan cevap kalıplarını incele.",
      },
      {
        href: "/english-speaking-confidence",
        category: "skills",
        kicker: "Özgüven",
        title: "Daha az tereddütle konuş",
        description:
          "Daha sakin başlangıçlar ve tutarlı anlatım için pratik rutinler kullan.",
      },
      {
        href: "/guides",
        category: "skills",
        kicker: "Beceri rehberleri",
        title: "Akıcılık, yapı ve telaffuz",
        description: "Her seferinde tek bir puanlama becerisine odaklan.",
      },
      {
        href: "/free-ielts-speaking-test",
        category: "tools",
        kicker: "Ücretsiz test",
        title: "IELTS speaking testini dene",
        description: "Bir plan seçmeden önce gerçek çalışma akışını gör.",
      },
      {
        href: "/tools",
        category: "tools",
        kicker: "Araç kutusu",
        title: "Ücretsiz IELTS araçları",
        description:
          "Soru üretici, hesaplayıcı, zamanlayıcı ve planlama araçlarını kullan.",
      },
      {
        href: speakingBandCalculatorHref,
        category: "tools",
        kicker: "Speaking hesaplayıcı",
        title: "Dört kriterden speaking bandını hesapla",
        description:
          "Akıcılık, kelime, gramer ve telaffuz skorlarını birleştir; sıradaki çalışmanı gör.",
      },
      {
        href: "/compare",
        category: "tools",
        kicker: "Karşılaştır",
        title: "Speaking araçlarını karşılaştır",
        description:
          "İhtiyacın olan geri bildirime hangi yöntemin uyduğunu gör.",
      },
      {
        href: "/weekly-ielts-speaking-challenge",
        category: "habit",
        kicker: "Haftalık alışkanlık",
        title: "Haftalık speaking challenge",
        description: "Her hafta tekrarlanabilir tek bir görevle ritim oluştur.",
      },
    ],
    featuredEyebrow: "Editörün başlangıç önerisi",
    featuredTitle: "Önce açmaya değer tek rehber",
    featuredDescription:
      "Bugün uygulayabileceğin gerçek bir gelişme isteyen öğrenciler için odaklı bir yazı.",
    readArticle: "Yazıyı oku",
    allArticles: "Tüm yazıları gör",
    promptEyebrow: "Günün promptu",
    promptTitle: "Sık kullandığın faydalı bir nesneyi anlat",
    promptDescription:
      "Detay, örnek ve net bir kişisel hikâye için yeterli alan veren basit bir Part 2 konusu.",
    openPrompt: "Promptu aç",
    practisePrompt: "Şimdi pratik yap",
    leadEyebrow: "Ücretsiz skor rehberi",
    leadTitle: "IELTS Speaking skor analiz rehberini al",
    leadDescription:
      "Önce dört bölümlük kontrol listesini al; üç kısa skor-yeniden deneme e-postasını açmak için içinden onayla. İstediğin zaman çıkabilirsin.",
    latestEyebrow: "Okumaya devam et",
    latestTitle: "Sıradaki üç faydalı yazı",
    latestDescription:
      "Bir yazıyla başla, fikir tazeyken gerçek bir denemeye geç.",
    nextEyebrow: "Sıradaki adım",
    nextTitle: "Tek bir faydalı fikri kaydedilmiş bir cevaba dönüştür.",
    nextDescription:
      "Okumak netlik verir. Kayıt, geri bildirim ve bilinçli tekrar ilerleme sağlar.",
    startPractice: "Ücretsiz pratiğe başla",
    viewPlans: "Plus planlarını gör",
  },
  de: {
    metaTitle: "IELTS-Speaking-Ressourcen | SpeakAce",
    metaDescription:
      "Strukturierte IELTS-Speaking-Leitfäden, Fragen, Tools, Beispielantworten und Lernwege.",
    heroEyebrow: "SpeakAce Ressourcen",
    heroTitle: "Ein klarerer Weg von der Frage zur sicheren Antwort.",
    heroIntro:
      "Wähle genau die Fähigkeit oder Prüfungseinheit, lies einen fokussierten Leitfaden und setze ihn direkt in einer Sprechaufnahme um.",
    heroPrimary: "Bibliothek öffnen",
    heroSecondary: "Kostenlos üben",
    signals: [
      "14 klare Startpunkte",
      "Kostenlose Leitfäden und Tools",
      "Direkt mit Praxis verbunden",
    ],
    routeEyebrow: "Ein nützlicher Lernzyklus",
    routeTitle: "Weniger lesen. Mehr anwenden.",
    routeSteps: [
      "Eine Schwäche auswählen",
      "Ein fokussiertes Beispiel lernen",
      "Aufnehmen, prüfen, wiederholen",
    ],
    routeNote: "Jeder Weg endet mit einem praktischen nächsten Schritt.",
    libraryEyebrow: "Ressourcenbibliothek",
    libraryTitle: "Finde den kürzesten Weg zu deinem Ziel",
    libraryDescription:
      "Filtere nach Prüfung, Fähigkeit, kostenlosen Tools oder Lernroutine.",
    libraryTabLabel: "Ressourcen filtern",
    searchPlaceholder: "Ressourcen durchsuchen",
    resultLabel: "Ressourcen",
    openLabel: "Ressource öffnen",
    showMoreLabel: "Mehr Ressourcen anzeigen",
    categories: {
      all: "Alle",
      exam: "Prüfungsteile",
      skills: "Fähigkeiten",
      tools: "Gratis-Tools",
      habit: "Routinen",
    },
    items: [
      {
        href: "/ielts-speaking-topics",
        category: "exam",
        kicker: "Themenbank",
        title: "IELTS-Speaking-Themen",
        description:
          "Wähle Prompts nach Thema und starte direkt eine zeitlich begrenzte Antwort.",
      },
      {
        href: "/ielts-band-score-guide",
        category: "exam",
        kicker: "Score-Guide",
        title: "IELTS-Band-Leitfaden",
        description:
          "Verstehe die Unterschiede zwischen Bands und deinen nächsten Fokus.",
      },
      {
        href: bandSevenGuideHref,
        category: "skills",
        kicker: "Band-7-Retry",
        title: "IELTS Speaking von Band 6 auf 7",
        description:
          "Nutze einen kriterienbasierten Retry-Plan, Vorher-Nachher-Beispiele und einen fokussierten Part-2-Drill.",
      },
      {
        href: "/ielts-speaking-part-1-questions",
        category: "exam",
        kicker: "Teil 1",
        title: "Kurze Fragen",
        description:
          "Übe natürliche Einstiege, direkte Antworten und ruhigere Flüssigkeit.",
      },
      {
        href: "/ielts-speaking-part-2-topics",
        category: "exam",
        kicker: "Teil 2",
        title: "Cue-Card-Themen",
        description:
          "Plane einen klaren Long Turn mit Beispielen und Erzählfluss.",
      },
      {
        href: "/ielts-speaking-part-3-questions",
        category: "exam",
        kicker: "Teil 3",
        title: "Diskussionsfragen",
        description:
          "Entwickle Meinungen mit Gründen, Vergleichen und Beispielen.",
      },
      {
        href: "/ielts-speaking-sample-answers",
        category: "exam",
        kicker: "Beispiele",
        title: "Beispielantworten",
        description:
          "Lerne brauchbare Muster, ohne ein Skript auswendig zu lernen.",
      },
      {
        href: "/english-speaking-confidence",
        category: "skills",
        kicker: "Sicherheit",
        title: "Mit weniger Zögern sprechen",
        description:
          "Nutze Routinen für ruhige Starts und gleichmäßige Antworten.",
      },
      {
        href: "/guides",
        category: "skills",
        kicker: "Fähigkeiten",
        title: "Flüssigkeit, Struktur und Aussprache",
        description:
          "Arbeite mit jedem Guide an genau einer Bewertungsdimension.",
      },
      {
        href: "/free-ielts-speaking-test",
        category: "tools",
        kicker: "Gratis-Test",
        title: "IELTS-Speaking-Test ausprobieren",
        description:
          "Erlebe den Ablauf, bevor du einen vollständigen Plan wählst.",
      },
      {
        href: "/tools",
        category: "tools",
        kicker: "Toolkit",
        title: "Kostenlose IELTS-Tools",
        description: "Nutze Generatoren, Rechner, Timer und Planungshilfen.",
      },
      {
        href: speakingBandCalculatorHref,
        category: "tools",
        kicker: "Speaking-Rechner",
        title: "Band aus vier Speaking-Kriterien berechnen",
        description:
          "Kombiniere Flüssigkeit, Wortschatz, Grammatik und Aussprache und erhalte die nächste Übung.",
      },
      {
        href: "/compare",
        category: "tools",
        kicker: "Vergleich",
        title: "Speaking-Tools vergleichen",
        description: "Finde den Ansatz, der zu deinem Feedbackbedarf passt.",
      },
      {
        href: "/weekly-ielts-speaking-challenge",
        category: "habit",
        kicker: "Wochenroutine",
        title: "Wöchentliche Speaking-Challenge",
        description:
          "Baue mit einer wiederholbaren Aufgabe pro Woche Momentum auf.",
      },
    ],
    featuredEyebrow: "Empfehlung der Redaktion",
    featuredTitle: "Ein Leitfaden für den besten Einstieg",
    featuredDescription:
      "Ein fokussierter Artikel mit einer Verbesserung, die du heute anwenden kannst.",
    readArticle: "Artikel lesen",
    allArticles: "Alle Artikel",
    promptEyebrow: "Prompt des Tages",
    promptTitle: "Beschreibe einen nützlichen Gegenstand",
    promptDescription:
      "Ein einfaches Teil-2-Thema mit Raum für Details, Beispiele und eine persönliche Geschichte.",
    openPrompt: "Prompt öffnen",
    practisePrompt: "Jetzt üben",
    leadEyebrow: "Kostenloser Score-Leitfaden",
    leadTitle: "Hol dir die IELTS-Speaking-Score-Diagnose",
    leadDescription:
      "Du erhältst zuerst die vierteilige Checkliste; bestätige darin drei kurze Score-und-Retry-E-Mails. Jederzeit abmeldbar.",
    latestEyebrow: "Weiterlesen",
    latestTitle: "Drei sinnvolle nächste Artikel",
    latestDescription:
      "Lies einen Artikel und nutze die Idee direkt in einer echten Antwort.",
    nextEyebrow: "Nächster Schritt",
    nextTitle: "Mach aus einer guten Idee eine aufgenommene Antwort.",
    nextDescription:
      "Lesen schafft Klarheit. Aufnahme, Feedback und Wiederholung schaffen Fortschritt.",
    startPractice: "Kostenlos üben",
    viewPlans: "Plus-Pläne ansehen",
  },
  es: {
    metaTitle: "Recursos de IELTS Speaking | SpeakAce",
    metaDescription:
      "Explora guías, preguntas, herramientas, respuestas modelo y rutas de práctica para IELTS speaking.",
    heroEyebrow: "Mesa de recursos SpeakAce",
    heroTitle:
      "Una ruta más clara desde la pregunta hasta una respuesta segura.",
    heroIntro:
      "Elige la habilidad o parte del examen que necesitas, lee una guía enfocada y conviértela en un intento real de speaking.",
    heroPrimary: "Explorar la biblioteca",
    heroSecondary: "Practicar gratis",
    signals: [
      "14 puntos de partida",
      "Guías y herramientas gratis",
      "Contenido conectado con la práctica",
    ],
    routeEyebrow: "Un ciclo útil de estudio",
    routeTitle: "Lee menos. Aplica más.",
    routeSteps: [
      "Elige un punto débil",
      "Estudia un ejemplo enfocado",
      "Graba, revisa y repite",
    ],
    routeNote: "Cada ruta termina con un siguiente paso práctico.",
    libraryEyebrow: "Biblioteca de recursos",
    libraryTitle: "Encuentra la ruta más corta hacia tu objetivo",
    libraryDescription:
      "Filtra por examen, habilidades, herramientas gratuitas o hábitos de estudio.",
    libraryTabLabel: "Filtrar recursos",
    searchPlaceholder: "Buscar recursos",
    resultLabel: "recursos",
    openLabel: "Abrir recurso",
    showMoreLabel: "Mostrar más recursos",
    categories: {
      all: "Todos",
      exam: "Partes del examen",
      skills: "Habilidades",
      tools: "Herramientas gratis",
      habit: "Hábitos",
    },
    items: [
      {
        href: "/ielts-speaking-topics",
        category: "exam",
        kicker: "Banco de temas",
        title: "Temas de IELTS speaking",
        description:
          "Explora prompts por tema y pasa directamente a una respuesta cronometrada.",
      },
      {
        href: "/ielts-band-score-guide",
        category: "exam",
        kicker: "Guía de puntuación",
        title: "Guía de bandas IELTS",
        description:
          "Entiende qué cambia entre bandas y qué debes mejorar después.",
      },
      {
        href: bandSevenGuideHref,
        category: "skills",
        kicker: "Reintento Band 7",
        title: "Sube IELTS Speaking de Band 6 a 7",
        description:
          "Usa un plan por criterios, ejemplos antes y después y una práctica enfocada de cue card de Parte 2.",
      },
      {
        href: "/ielts-speaking-part-1-questions",
        category: "exam",
        kicker: "Parte 1",
        title: "Preguntas de respuesta corta",
        description:
          "Crea inicios naturales, respuestas directas y mayor fluidez.",
      },
      {
        href: "/ielts-speaking-part-2-topics",
        category: "exam",
        kicker: "Parte 2",
        title: "Temas de cue card",
        description:
          "Planifica una respuesta larga con ejemplos y una historia clara.",
      },
      {
        href: "/ielts-speaking-part-3-questions",
        category: "exam",
        kicker: "Parte 3",
        title: "Preguntas de discusión",
        description:
          "Desarrolla opiniones con razones, comparaciones y ejemplos.",
      },
      {
        href: "/ielts-speaking-sample-answers",
        category: "exam",
        kicker: "Ejemplos",
        title: "Respuestas modelo",
        description: "Estudia patrones útiles sin memorizar un guion.",
      },
      {
        href: "/english-speaking-confidence",
        category: "skills",
        kicker: "Confianza",
        title: "Habla con menos dudas",
        description:
          "Usa rutinas prácticas para empezar con calma y mantener el ritmo.",
      },
      {
        href: "/guides",
        category: "skills",
        kicker: "Guías de habilidad",
        title: "Fluidez, estructura y pronunciación",
        description: "Trabaja una dimensión de puntuación cada vez.",
      },
      {
        href: "/free-ielts-speaking-test",
        category: "tools",
        kicker: "Test gratis",
        title: "Prueba un test de IELTS speaking",
        description: "Conoce el flujo antes de elegir un plan completo.",
      },
      {
        href: "/tools",
        category: "tools",
        kicker: "Kit",
        title: "Herramientas gratuitas de IELTS",
        description:
          "Usa generadores, calculadoras, temporizadores y ayudas de planificación.",
      },
      {
        href: speakingBandCalculatorHref,
        category: "tools",
        kicker: "Calculadora speaking",
        title: "Calcula la banda con cuatro criterios",
        description:
          "Combina fluidez, vocabulario, gramática y pronunciación y descubre la siguiente práctica.",
      },
      {
        href: "/compare",
        category: "tools",
        kicker: "Comparar",
        title: "Compara herramientas de speaking",
        description:
          "Descubre qué enfoque encaja con el feedback que necesitas.",
      },
      {
        href: "/weekly-ielts-speaking-challenge",
        category: "habit",
        kicker: "Hábito semanal",
        title: "Reto semanal de speaking",
        description: "Crea impulso con un reto repetible cada semana.",
      },
    ],
    featuredEyebrow: "Punto de partida editorial",
    featuredTitle: "Una guía que merece abrirse primero",
    featuredDescription:
      "Un artículo enfocado con una mejora que puedes aplicar hoy.",
    readArticle: "Leer el artículo",
    allArticles: "Ver todos los artículos",
    promptEyebrow: "Prompt del día",
    promptTitle: "Describe un objeto útil que usas a menudo",
    promptDescription:
      "Un tema sencillo de Parte 2 con espacio para detalles, ejemplos y una historia personal.",
    openPrompt: "Abrir el prompt",
    practisePrompt: "Practicar ahora",
    leadEyebrow: "Guía de puntuación gratis",
    leadTitle: "Recibe el diagnóstico de IELTS Speaking",
    leadDescription:
      "Recibe primero la lista de cuatro partes y confirma dentro si quieres tres emails breves de puntuación y repetición. Baja en cualquier momento.",
    latestEyebrow: "Seguir leyendo",
    latestTitle: "Tres lecturas útiles para continuar",
    latestDescription:
      "Empieza con un artículo y practica mientras la idea está fresca.",
    nextEyebrow: "El siguiente paso",
    nextTitle: "Convierte una idea útil en una respuesta grabada.",
    nextDescription:
      "Leer aporta claridad. Grabar, recibir feedback y repetir crea progreso.",
    startPractice: "Practicar gratis",
    viewPlans: "Ver planes Plus",
  },
  fr: {
    metaTitle: "Ressources IELTS Speaking | SpeakAce",
    metaDescription:
      "Découvrez des guides, questions, outils, réponses modèles et parcours de pratique IELTS speaking.",
    heroEyebrow: "Ressources SpeakAce",
    heroTitle: "Un chemin plus clair de la question à la réponse assurée.",
    heroIntro:
      "Choisissez la compétence ou la partie de l’examen, lisez un guide ciblé, puis transformez-le en vraie tentative orale.",
    heroPrimary: "Explorer la bibliothèque",
    heroSecondary: "Pratiquer gratuitement",
    signals: [
      "14 points de départ ciblés",
      "Guides et outils gratuits",
      "Contenu relié à la pratique",
    ],
    routeEyebrow: "Une boucle d’étude utile",
    routeTitle: "Lisez moins. Appliquez davantage.",
    routeSteps: [
      "Choisir un point faible",
      "Étudier un exemple ciblé",
      "Enregistrer, revoir, recommencer",
    ],
    routeNote: "Chaque parcours se termine par une prochaine étape pratique.",
    libraryEyebrow: "Bibliothèque de ressources",
    libraryTitle: "Trouvez le chemin le plus court vers votre objectif",
    libraryDescription:
      "Filtrez par examen, compétence, outil gratuit ou habitude de travail.",
    libraryTabLabel: "Filtrer les ressources",
    searchPlaceholder: "Rechercher une ressource",
    resultLabel: "ressources",
    openLabel: "Ouvrir la ressource",
    showMoreLabel: "Afficher plus de ressources",
    categories: {
      all: "Tout",
      exam: "Parties de l’examen",
      skills: "Compétences",
      tools: "Outils gratuits",
      habit: "Habitudes",
    },
    items: [
      {
        href: "/ielts-speaking-topics",
        category: "exam",
        kicker: "Banque de sujets",
        title: "Sujets IELTS speaking",
        description:
          "Parcourez les prompts par thème et lancez une réponse chronométrée.",
      },
      {
        href: "/ielts-band-score-guide",
        category: "exam",
        kicker: "Guide de score",
        title: "Guide des bandes IELTS",
        description:
          "Comprenez ce qui change entre les bandes et votre prochain axe.",
      },
      {
        href: bandSevenGuideHref,
        category: "skills",
        kicker: "Nouvel essai Band 7",
        title: "Passer de Band 6 à 7 en IELTS Speaking",
        description:
          "Suivez un plan par critère, des exemples avant-après et un exercice cue card ciblé en Partie 2.",
      },
      {
        href: "/ielts-speaking-part-1-questions",
        category: "exam",
        kicker: "Partie 1",
        title: "Questions courtes",
        description:
          "Construisez des débuts naturels, des réponses directes et fluides.",
      },
      {
        href: "/ielts-speaking-part-2-topics",
        category: "exam",
        kicker: "Partie 2",
        title: "Sujets cue card",
        description:
          "Planifiez une réponse longue avec exemples et récit clair.",
      },
      {
        href: "/ielts-speaking-part-3-questions",
        category: "exam",
        kicker: "Partie 3",
        title: "Questions de discussion",
        description:
          "Développez vos opinions avec raisons, comparaisons et exemples.",
      },
      {
        href: "/ielts-speaking-sample-answers",
        category: "exam",
        kicker: "Exemples",
        title: "Réponses modèles",
        description: "Étudiez des structures utiles sans mémoriser un script.",
      },
      {
        href: "/english-speaking-confidence",
        category: "skills",
        kicker: "Confiance",
        title: "Parler avec moins d’hésitation",
        description:
          "Utilisez des routines pour démarrer calmement et garder le rythme.",
      },
      {
        href: "/guides",
        category: "skills",
        kicker: "Guides de compétence",
        title: "Fluidité, structure et prononciation",
        description: "Travaillez une seule dimension de score à la fois.",
      },
      {
        href: "/free-ielts-speaking-test",
        category: "tools",
        kicker: "Test gratuit",
        title: "Essayer un test IELTS speaking",
        description: "Découvrez le parcours avant de choisir un plan complet.",
      },
      {
        href: "/tools",
        category: "tools",
        kicker: "Boîte à outils",
        title: "Outils IELTS gratuits",
        description:
          "Utilisez générateurs, calculateurs, minuteurs et aides de planification.",
      },
      {
        href: speakingBandCalculatorHref,
        category: "tools",
        kicker: "Calculateur speaking",
        title: "Calculer la bande avec quatre critères",
        description:
          "Combinez fluidité, lexique, grammaire et prononciation, puis voyez le prochain exercice.",
      },
      {
        href: "/compare",
        category: "tools",
        kicker: "Comparer",
        title: "Comparer les outils de speaking",
        description:
          "Trouvez l’approche adaptée au feedback dont vous avez besoin.",
      },
      {
        href: "/weekly-ielts-speaking-challenge",
        category: "habit",
        kicker: "Habitude hebdomadaire",
        title: "Défi speaking de la semaine",
        description:
          "Créez un rythme avec un défi simple à répéter chaque semaine.",
      },
    ],
    featuredEyebrow: "Choix de la rédaction",
    featuredTitle: "Un guide à ouvrir en premier",
    featuredDescription:
      "Un article ciblé avec une amélioration à appliquer dès aujourd’hui.",
    readArticle: "Lire l’article",
    allArticles: "Voir tous les articles",
    promptEyebrow: "Prompt du jour",
    promptTitle: "Décrivez un objet utile que vous utilisez souvent",
    promptDescription:
      "Un sujet simple de Partie 2 avec de la place pour les détails, exemples et récit personnel.",
    openPrompt: "Ouvrir le prompt",
    practisePrompt: "Pratiquer maintenant",
    leadEyebrow: "Guide de score gratuit",
    leadTitle: "Recevez le diagnostic IELTS Speaking",
    leadDescription:
      "Recevez d’abord la liste en quatre parties, puis confirmez-y trois courts e-mails score-et-nouvel-essai. Désinscription à tout moment.",
    latestEyebrow: "Continuer la lecture",
    latestTitle: "Trois lectures utiles pour poursuivre",
    latestDescription:
      "Commencez par un article puis pratiquez pendant que l’idée est fraîche.",
    nextEyebrow: "Prochaine étape",
    nextTitle: "Transformez une idée utile en réponse enregistrée.",
    nextDescription:
      "La lecture clarifie. L’enregistrement, le feedback et la répétition font progresser.",
    startPractice: "Pratiquer gratuitement",
    viewPlans: "Voir les offres Plus",
  },
};

function getResourcesContent(
  language: Parameters<typeof normalizePublicLanguage>[0],
) {
  return resourceContent[normalizePublicLanguage(language)];
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const copy = getResourcesContent(language);
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical: "/resources" },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: `${siteConfig.domain}/resources`,
      siteName: siteConfig.name,
      type: "website",
    },
  };
}

export default async function ResourcesPage() {
  const language = await getServerLanguage();
  const copy = getResourcesContent(language);
  const chrome = getBlogChromeCopy(language);
  const blogPosts = getLocalizedBlogPosts(language);
  const featuredArticle = blogPosts[0];
  const popularArticles = blogPosts.slice(1, 4);
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.metaTitle,
    description: copy.metaDescription,
    url: `${siteConfig.domain}/resources`,
    hasPart: copy.items.map((item) => ({
      "@type": "WebPage",
      name: item.title,
      url: `${siteConfig.domain}${item.href}`,
    })),
  };

  return (
    <main className="public-container resource-page">
      <PageHero
        eyebrow={copy.heroEyebrow}
        title={copy.heroTitle}
        description={copy.heroIntro}
        actions={
          <>
            <PublicButton href="#resource-library-title">
              {copy.heroPrimary}
            </PublicButton>
            <PublicButton href="/app/practice" secondary>
              {copy.heroSecondary}
            </PublicButton>
          </>
        }
        visual={
          <aside
            className="resource-learning-path"
            aria-label={copy.routeTitle}
          >
            <div>
              <span className="public-kicker">{copy.routeEyebrow}</span>
              <BookOpenCheck size={30} />
            </div>
            <h2>{copy.routeTitle}</h2>
            <ol>
              {copy.routeSteps.map((step, index) => (
                <li key={step}>
                  <span>0{index + 1}</span>
                  <strong>{step}</strong>
                  <ArrowRight size={17} />
                </li>
              ))}
            </ol>
            <p>{copy.routeNote}</p>
          </aside>
        }
      >
        <div className="resource-signals">
          {copy.signals.map((signal) => (
            <span key={signal}>
              <CheckCircle2 size={13} />
              {signal}
            </span>
          ))}
        </div>
      </PageHero>

      <ResourceLibrary
        eyebrow={copy.libraryEyebrow}
        title={copy.libraryTitle}
        description={copy.libraryDescription}
        tabLabel={copy.libraryTabLabel}
        searchPlaceholder={copy.searchPlaceholder}
        resultLabel={copy.resultLabel}
        emptyLabel={
          {
            en: "No resources match this search. Try a different topic or category.",
            tr: "Bu aramayla eşleşen kaynak yok. Başka bir konu veya kategori dene.",
            de: "Keine passenden Ressourcen. Versuche ein anderes Thema oder eine andere Kategorie.",
            es: "No hay recursos que coincidan. Prueba otro tema o categoría.",
            fr: "Aucune ressource correspondante. Essayez un autre sujet ou une autre catégorie.",
          }[normalizePublicLanguage(language)]
        }
        openLabel={copy.openLabel}
        showMoreLabel={copy.showMoreLabel}
        categories={copy.categories}
        items={copy.items}
      />

      {featuredArticle && (
        <section className="resource-featured public-section">
          <div className="resource-featured-index" aria-hidden="true">
            Aa<span>01 / {copy.featuredEyebrow}</span>
          </div>
          <div>
            <span className="public-kicker">{copy.featuredEyebrow}</span>
            <h2>
              {getBlogPublicTitle(featuredArticle.slug, featuredArticle.title)}
            </h2>
            <p>
              {getBlogPublicDescription(
                featuredArticle.slug,
                featuredArticle.description,
              ) || copy.featuredDescription}
            </p>
            <div className="public-actions">
              <PublicButton href={`/blog/${featuredArticle.slug}`}>
                {copy.readArticle}
              </PublicButton>
              <PublicButton href="/blog" secondary>
                {copy.allArticles}
              </PublicButton>
            </div>
          </div>
        </section>
      )}

      <AdSenseUnit />

      <section className="resource-practice-duo public-section">
        <article>
          <span className="public-kicker">{copy.promptEyebrow}</span>
          <h2>{copy.promptTitle}</h2>
          <p>{copy.promptDescription}</p>
          <div className="public-actions">
            <PublicButton
              href="/ielts-speaking-topics/describe-a-useful-object"
              secondary
            >
              {copy.openPrompt}
            </PublicButton>
            <PublicButton href="/app/practice?quickStart=1">
              {copy.practisePrompt}
            </PublicButton>
          </div>
        </article>
        <article>
          <span className="public-kicker">{copy.leadEyebrow}</span>
          <h2>{copy.leadTitle}</h2>
          <p>{copy.leadDescription}</p>
          <LeadCaptureForm source="resources_lead" />
        </article>
      </section>
      {popularArticles.length > 0 && (
        <PageSection
          eyebrow={copy.latestEyebrow}
          title={copy.latestTitle}
          description={copy.latestDescription}
        >
          <div className="public-resource-grid">
            {popularArticles.map((post, index) => (
              <ResourceCard
                key={post.slug}
                href={`/blog/${post.slug}`}
                category={copy.latestEyebrow}
                title={getBlogPublicTitle(post.slug, post.title)}
                description={getBlogPublicDescription(
                  post.slug,
                  post.description,
                )}
                action={chrome.cta.read}
                index={index}
              />
            ))}
          </div>
        </PageSection>
      )}
      <PageCTA
        eyebrow={copy.nextEyebrow}
        title={copy.nextTitle}
        description={copy.nextDescription}
      >
        <PublicButton href="/app/practice">{copy.startPractice}</PublicButton>
        <PublicButton href="/pricing" secondary>
          {copy.viewPlans}
        </PublicButton>
      </PageCTA>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    </main>
  );
}

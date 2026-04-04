import type { Language } from "@/lib/copy";

type BlogSection = {
  title: string;
  body: string[];
};

export type LocalizedBlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  sections: BlogSection[];
};

type ExamKey = "ielts" | "toefl" | "both";
type OutcomeKey =
  | "clearer_structure"
  | "faster_planning"
  | "better_examples"
  | "higher_confidence"
  | "stronger_fluency"
  | "higher_band";

type FocusKey =
  | "part1_hometown"
  | "part1_work_study"
  | "part2_useful_object"
  | "part2_person"
  | "part2_place"
  | "part3_opinion"
  | "fluency"
  | "pronunciation"
  | "vocabulary"
  | "grammar"
  | "confidence"
  | "study_plan_30"
  | "retry_method"
  | "band_55_to_65"
  | "daily_routine"
  | "topic_development"
  | "cue_card_notes"
  | "toefl_independent_structure"
  | "toefl_independent_timing"
  | "toefl_independent_samples"
  | "toefl_integrated_balance"
  | "toefl_integrated_notes"
  | "toefl_pronunciation"
  | "toefl_confidence"
  | "toefl_study_plan"
  | "toefl_review"
  | "toefl_ideas_faster"
  | "toefl_templates"
  | "toefl_common_mistakes"
  | "ielts_toefl_differences"
  | "ielts_personal_examples"
  | "toefl_short_notes";

type BlogBlueprint = {
  slug: string;
  exam: ExamKey;
  focus: FocusKey;
  outcome: OutcomeKey;
};

const blogBlueprints: BlogBlueprint[] = [
  { slug: "how-to-answer-ielts-speaking-part-1-hometown-questions-more-naturally", exam: "ielts", focus: "part1_hometown", outcome: "clearer_structure" },
  { slug: "how-to-answer-ielts-speaking-part-1-work-and-study-questions-clearly", exam: "ielts", focus: "part1_work_study", outcome: "clearer_structure" },
  { slug: "how-to-improve-useful-object-cue-card-answers-in-ielts-speaking", exam: "ielts", focus: "part2_useful_object", outcome: "better_examples" },
  { slug: "how-to-describe-a-person-better-in-ielts-speaking-part-2", exam: "ielts", focus: "part2_person", outcome: "better_examples" },
  { slug: "how-to-describe-a-place-more-clearly-in-ielts-speaking-part-2", exam: "ielts", focus: "part2_place", outcome: "clearer_structure" },
  { slug: "how-to-give-stronger-opinion-answers-in-ielts-speaking-part-3", exam: "ielts", focus: "part3_opinion", outcome: "higher_band" },
  { slug: "how-to-improve-fluency-for-ielts-speaking-with-daily-repeat-practice", exam: "ielts", focus: "fluency", outcome: "stronger_fluency" },
  { slug: "how-to-fix-pronunciation-rhythm-and-word-endings-in-ielts-speaking", exam: "ielts", focus: "pronunciation", outcome: "stronger_fluency" },
  { slug: "how-to-use-better-vocabulary-in-ielts-speaking-without-sounding-memorized", exam: "ielts", focus: "vocabulary", outcome: "higher_band" },
  { slug: "how-to-make-grammar-sound-more-natural-under-ielts-speaking-pressure", exam: "ielts", focus: "grammar", outcome: "higher_band" },
  { slug: "how-to-build-real-confidence-before-your-ielts-speaking-test-day", exam: "ielts", focus: "confidence", outcome: "higher_confidence" },
  { slug: "how-to-build-a-30-day-ielts-speaking-study-plan-that-actually-works", exam: "ielts", focus: "study_plan_30", outcome: "higher_band" },
  { slug: "how-to-use-the-retry-method-after-every-ielts-speaking-answer", exam: "ielts", focus: "retry_method", outcome: "higher_band" },
  { slug: "how-to-move-your-ielts-speaking-score-from-5-5-to-6-5", exam: "ielts", focus: "band_55_to_65", outcome: "higher_band" },
  { slug: "how-to-build-a-daily-ielts-speaking-routine-if-you-are-busy", exam: "ielts", focus: "daily_routine", outcome: "stronger_fluency" },
  { slug: "how-to-develop-ideas-faster-in-ielts-speaking-with-real-examples", exam: "ielts", focus: "topic_development", outcome: "better_examples" },
  { slug: "how-to-make-cue-card-notes-that-help-you-speak-longer-in-ielts", exam: "ielts", focus: "cue_card_notes", outcome: "faster_planning" },
  { slug: "how-to-structure-toefl-independent-speaking-answers-more-clearly", exam: "toefl", focus: "toefl_independent_structure", outcome: "clearer_structure" },
  { slug: "how-to-manage-time-better-in-toefl-independent-speaking-tasks", exam: "toefl", focus: "toefl_independent_timing", outcome: "faster_planning" },
  { slug: "how-to-study-toefl-independent-speaking-sample-answers-the-right-way", exam: "toefl", focus: "toefl_independent_samples", outcome: "higher_band" },
  { slug: "how-to-balance-reading-listening-and-speaking-in-toefl-integrated-tasks", exam: "toefl", focus: "toefl_integrated_balance", outcome: "clearer_structure" },
  { slug: "how-to-take-notes-faster-for-toefl-integrated-speaking-without-losing-detail", exam: "toefl", focus: "toefl_integrated_notes", outcome: "faster_planning" },
  { slug: "how-to-improve-pronunciation-and-pacing-in-the-toefl-speaking-test", exam: "toefl", focus: "toefl_pronunciation", outcome: "stronger_fluency" },
  { slug: "how-to-feel-more-confident-when-a-toefl-speaking-timer-starts", exam: "toefl", focus: "toefl_confidence", outcome: "higher_confidence" },
  { slug: "how-to-build-a-30-day-toefl-speaking-plan-with-steady-progress", exam: "toefl", focus: "toefl_study_plan", outcome: "higher_band" },
  { slug: "how-to-review-each-toefl-speaking-attempt-so-the-next-one-scores-better", exam: "toefl", focus: "toefl_review", outcome: "higher_band" },
  { slug: "how-to-find-ideas-faster-in-toefl-speaking-when-you-freeze", exam: "toefl", focus: "toefl_ideas_faster", outcome: "faster_planning" },
  { slug: "how-to-use-simple-toefl-speaking-templates-without-sounding-robotic", exam: "toefl", focus: "toefl_templates", outcome: "clearer_structure" },
  { slug: "how-to-avoid-common-mistakes-that-lower-your-toefl-speaking-score", exam: "toefl", focus: "toefl_common_mistakes", outcome: "higher_band" },
  { slug: "how-to-prepare-for-ielts-and-toefl-speaking-at-the-same-time", exam: "both", focus: "ielts_toefl_differences", outcome: "higher_band" },
  { slug: "how-to-use-more-personal-examples-in-ielts-speaking-without-going-off-topic", exam: "ielts", focus: "ielts_personal_examples", outcome: "better_examples" },
  { slug: "how-to-make-short-notes-that-still-help-in-the-toefl-speaking-test", exam: "toefl", focus: "toefl_short_notes", outcome: "faster_planning" }
];

const localePacks = {
  en: {
    exam: { ielts: "IELTS speaking", toefl: "TOEFL speaking", both: "IELTS and TOEFL speaking" },
    outcome: {
      clearer_structure: "build clearer structure",
      faster_planning: "plan faster under pressure",
      better_examples: "use stronger examples naturally",
      higher_confidence: "feel calmer on test day",
      stronger_fluency: "speak more smoothly",
      higher_band: "move toward a higher score"
    },
    titles: {
      why: "Why learners search this topic",
      mistake: "The mistake that keeps scores down",
      stronger: "What a stronger answer sounds like",
      routine: "A repeatable practice routine",
      examples: "How to use details without sounding forced",
      review: "What to review after every attempt"
    },
    cta: {
      blog: "Blog",
      featured: "Featured article",
      latest: "Latest articles",
      read: "Read article",
      readingTracks: "Reading tracks",
      readMore: "Continue reading"
    },
    labels: {
      blogTitle: "Long-form IELTS and TOEFL speaking articles that explain the work clearly",
      blogDescription: "Read longer guides about IELTS and TOEFL speaking, band score improvement, sample answers, fluency, note-taking, and test-day preparation.",
      featuredDescription: "A longer, practical article picked for readers who want a clearer study plan before they open another resource.",
      latestDescription: "These articles are written to help learners understand the work, not to push them into a product flow.",
      startPath: "IELTS path",
      advancedPath: "TOEFL path"
    }
  },
  tr: {
    exam: { ielts: "IELTS speaking", toefl: "TOEFL speaking", both: "IELTS ve TOEFL speaking" },
    outcome: {
      clearer_structure: "daha net bir yapı kurmak",
      faster_planning: "baskı altında daha hızlı plan yapmak",
      better_examples: "daha güçlü örnekleri doğal kullanmak",
      higher_confidence: "sınav gününde daha sakin hissetmek",
      stronger_fluency: "daha akıcı konuşmak",
      higher_band: "daha yüksek bir skora yaklaşmak"
    },
    titles: {
      why: "Öğrenciler neden bu konuyu arıyor",
      mistake: "Skoru aşağı çeken temel hata",
      stronger: "Daha güçlü bir cevap nasıl duyulur",
      routine: "Tekrarlanabilir çalışma rutini",
      examples: "Detayları zorlama olmadan kullanmak",
      review: "Her denemeden sonra neye bakılmalı"
    },
    cta: {
      blog: "Blog",
      featured: "Öne çıkan yazı",
      latest: "Son yazılar",
      read: "Yazıyı oku",
      readingTracks: "Okuma rotaları",
      readMore: "Devamını oku"
    },
    labels: {
      blogTitle: "IELTS ve TOEFL speaking için daha uzun ve açıklayıcı yazılar",
      blogDescription: "IELTS ve TOEFL speaking, skor artışı, örnek cevaplar, akıcılık, not alma ve sınav hazırlığı hakkında daha uzun rehberler oku.",
      featuredDescription: "Bu öne çıkan yazı, yeni bir kaynağa geçmeden önce çalışma planını netleştirmek isteyenler için seçildi.",
      latestDescription: "Bu yazılar ürüne zorla yönlendirmek için değil, konuyu gerçekten açıklamak için yazıldı.",
      startPath: "IELTS rotası",
      advancedPath: "TOEFL rotası"
    }
  },
  de: {
    exam: { ielts: "IELTS-Speaking", toefl: "TOEFL-Speaking", both: "IELTS- und TOEFL-Speaking" },
    outcome: {
      clearer_structure: "eine klarere Struktur aufzubauen",
      faster_planning: "unter Druck schneller zu planen",
      better_examples: "stärkere Beispiele natürlicher zu nutzen",
      higher_confidence: "am Testtag ruhiger zu bleiben",
      stronger_fluency: "flüssiger zu sprechen",
      higher_band: "sich einer höheren Punktzahl zu nähern"
    },
    titles: {
      why: "Warum Lernende nach diesem Thema suchen",
      mistake: "Der Fehler, der Ergebnisse bremst",
      stronger: "Wie eine stärkere Antwort klingt",
      routine: "Eine wiederholbare Übungsroutine",
      examples: "Wie Details natürlich eingebaut werden",
      review: "Was nach jedem Versuch geprüft werden sollte"
    },
    cta: {
      blog: "Blog",
      featured: "Hauptartikel",
      latest: "Neueste Artikel",
      read: "Artikel lesen",
      readingTracks: "Lesepfade",
      readMore: "Weiterlesen"
    },
    labels: {
      blogTitle: "Lange IELTS- und TOEFL-Speaking-Artikel mit klaren Erklärungen",
      blogDescription: "Lies längere Leitfäden zu IELTS- und TOEFL-Speaking, Punktesteigerung, Beispielantworten, Sprechfluss, Notizen und Testvorbereitung.",
      featuredDescription: "Dieser Artikel ist für Leser ausgewählt, die vor dem nächsten Klick zuerst einen klareren Lernplan wollen.",
      latestDescription: "Diese Artikel sollen Wissen vermitteln und nicht jeden Leser direkt in einen Produktfluss drücken.",
      startPath: "IELTS-Pfad",
      advancedPath: "TOEFL-Pfad"
    }
  },
  es: {
    exam: { ielts: "speaking de IELTS", toefl: "speaking de TOEFL", both: "speaking de IELTS y TOEFL" },
    outcome: {
      clearer_structure: "crear una estructura más clara",
      faster_planning: "planear más rápido bajo presión",
      better_examples: "usar ejemplos más fuertes de forma natural",
      higher_confidence: "sentirte más calmado el día del examen",
      stronger_fluency: "hablar con más fluidez",
      higher_band: "acercarte a una puntuación más alta"
    },
    titles: {
      why: "Por qué los estudiantes buscan este tema",
      mistake: "El error que frena la puntuación",
      stronger: "Cómo suena una respuesta más fuerte",
      routine: "Una rutina de práctica repetible",
      examples: "Cómo usar detalles sin sonar forzado",
      review: "Qué revisar después de cada intento"
    },
    cta: { blog: "Blog", featured: "Artículo destacado", latest: "Artículos recientes", read: "Leer artículo", readingTracks: "Rutas de lectura", readMore: "Seguir leyendo" },
    labels: {
      blogTitle: "Artículos largos de IELTS y TOEFL speaking explicados con claridad",
      blogDescription: "Lee guías más largas sobre IELTS y TOEFL speaking, mejora de puntuación, respuestas modelo, fluidez, toma de notas y preparación.",
      featuredDescription: "Este artículo destacado está elegido para lectores que quieren una ruta de estudio más clara antes de abrir otro recurso.",
      latestDescription: "Estos artículos están escritos para informar bien, no para empujar al lector directamente al producto.",
      startPath: "Ruta IELTS",
      advancedPath: "Ruta TOEFL"
    }
  },
  fr: {
    exam: { ielts: "speaking IELTS", toefl: "speaking TOEFL", both: "speaking IELTS et TOEFL" },
    outcome: {
      clearer_structure: "construire une structure plus claire",
      faster_planning: "planifier plus vite sous pression",
      better_examples: "utiliser de meilleurs exemples plus naturellement",
      higher_confidence: "rester plus calme le jour du test",
      stronger_fluency: "parler avec plus de fluidité",
      higher_band: "viser un score plus élevé"
    },
    titles: {
      why: "Pourquoi les apprenants cherchent ce sujet",
      mistake: "L’erreur qui bloque le score",
      stronger: "À quoi ressemble une réponse plus forte",
      routine: "Une routine de pratique répétable",
      examples: "Comment utiliser des détails sans paraître forcé",
      review: "Que vérifier après chaque tentative"
    },
    cta: { blog: "Blog", featured: "Article phare", latest: "Derniers articles", read: "Lire l’article", readingTracks: "Parcours de lecture", readMore: "Continuer" },
    labels: {
      blogTitle: "Des articles longs sur le speaking IELTS et TOEFL, vraiment utiles",
      blogDescription: "Lisez des guides plus longs sur le speaking IELTS et TOEFL, la progression du score, les réponses modèles, la fluidité et la préparation.",
      featuredDescription: "Cet article mis en avant aide les lecteurs qui veulent clarifier leur méthode avant d’ouvrir encore une autre ressource.",
      latestDescription: "Ici, les articles cherchent d’abord à expliquer le travail de manière sérieuse et utile.",
      startPath: "Parcours IELTS",
      advancedPath: "Parcours TOEFL"
    }
  },
  it: {
    exam: { ielts: "speaking IELTS", toefl: "speaking TOEFL", both: "speaking IELTS e TOEFL" },
    outcome: {
      clearer_structure: "costruire una struttura più chiara",
      faster_planning: "pianificare più in fretta sotto pressione",
      better_examples: "usare esempi più forti in modo naturale",
      higher_confidence: "restare più tranquillo nel giorno dell’esame",
      stronger_fluency: "parlare con maggiore fluidità",
      higher_band: "avvicinarti a un punteggio più alto"
    },
    titles: {
      why: "Perché gli studenti cercano questo argomento",
      mistake: "L’errore che rallenta il punteggio",
      stronger: "Come suona una risposta più forte",
      routine: "Una routine di pratica ripetibile",
      examples: "Come usare dettagli senza sembrare forzato",
      review: "Cosa rivedere dopo ogni tentativo"
    },
    cta: { blog: "Blog", featured: "Articolo in evidenza", latest: "Articoli recenti", read: "Leggi l’articolo", readingTracks: "Percorsi di lettura", readMore: "Continua a leggere" },
    labels: {
      blogTitle: "Articoli lunghi sullo speaking IELTS e TOEFL spiegati bene",
      blogDescription: "Leggi guide più lunghe su speaking IELTS e TOEFL, aumento del punteggio, risposte esempio, fluidità, note e preparazione al test.",
      featuredDescription: "Questo articolo in evidenza è pensato per chi vuole una linea di studio più chiara prima di aprire un’altra pagina.",
      latestDescription: "Questi articoli servono a spiegare bene il lavoro, non a spingere subito il lettore verso il prodotto.",
      startPath: "Percorso IELTS",
      advancedPath: "Percorso TOEFL"
    }
  },
  pt: {
    exam: { ielts: "speaking do IELTS", toefl: "speaking do TOEFL", both: "speaking de IELTS e TOEFL" },
    outcome: {
      clearer_structure: "criar uma estrutura mais clara",
      faster_planning: "planejar mais rápido sob pressão",
      better_examples: "usar exemplos melhores de forma natural",
      higher_confidence: "ficar mais calmo no dia da prova",
      stronger_fluency: "falar com mais fluidez",
      higher_band: "chegar mais perto de uma pontuação maior"
    },
    titles: {
      why: "Por que os alunos procuram este tema",
      mistake: "O erro que reduz o resultado",
      stronger: "Como soa uma resposta mais forte",
      routine: "Uma rotina de prática repetível",
      examples: "Como usar detalhes sem parecer forçado",
      review: "O que revisar após cada tentativa"
    },
    cta: { blog: "Blog", featured: "Artigo em destaque", latest: "Artigos recentes", read: "Ler artigo", readingTracks: "Trilhas de leitura", readMore: "Continuar lendo" },
    labels: {
      blogTitle: "Artigos longos de IELTS e TOEFL speaking com explicações claras",
      blogDescription: "Leia guias mais longos sobre IELTS e TOEFL speaking, melhora de pontuação, respostas modelo, fluência e preparação.",
      featuredDescription: "Este artigo em destaque ajuda quem quer uma rota de estudo mais clara antes de abrir outro recurso.",
      latestDescription: "Esses artigos foram escritos para informar bem o leitor, não para empurrá-lo direto para o produto.",
      startPath: "Trilha IELTS",
      advancedPath: "Trilha TOEFL"
    }
  },
  nl: {
    exam: { ielts: "IELTS speaking", toefl: "TOEFL speaking", both: "IELTS en TOEFL speaking" },
    outcome: {
      clearer_structure: "een duidelijkere structuur op te bouwen",
      faster_planning: "onder druk sneller te plannen",
      better_examples: "sterkere voorbeelden natuurlijk te gebruiken",
      higher_confidence: "op de testdag rustiger te blijven",
      stronger_fluency: "vloeiender te spreken",
      higher_band: "dichter bij een hogere score te komen"
    },
    titles: {
      why: "Waarom leerlingen dit onderwerp zoeken",
      mistake: "De fout die de score omlaag trekt",
      stronger: "Hoe een sterker antwoord klinkt",
      routine: "Een herhaalbare oefenroutine",
      examples: "Hoe je details gebruikt zonder geforceerd te klinken",
      review: "Wat je na elke poging moet bekijken"
    },
    cta: { blog: "Blog", featured: "Uitgelicht artikel", latest: "Nieuwste artikelen", read: "Artikel lezen", readingTracks: "Leesroutes", readMore: "Verder lezen" },
    labels: {
      blogTitle: "Lange artikelen over IELTS en TOEFL speaking met duidelijke uitleg",
      blogDescription: "Lees langere gidsen over IELTS en TOEFL speaking, scoreverbetering, voorbeeldantwoorden, vloeiendheid en testvoorbereiding.",
      featuredDescription: "Dit uitgelichte artikel is gekozen voor lezers die eerst een duidelijker studiepad willen voordat ze verder klikken.",
      latestDescription: "Deze artikelen zijn geschreven om helder te helpen, niet om meteen naar het product te duwen.",
      startPath: "IELTS-route",
      advancedPath: "TOEFL-route"
    }
  },
  pl: {
    exam: { ielts: "IELTS speaking", toefl: "TOEFL speaking", both: "IELTS i TOEFL speaking" },
    outcome: {
      clearer_structure: "zbudować wyraźniejszą strukturę",
      faster_planning: "szybciej planować pod presją",
      better_examples: "naturalnie używać mocniejszych przykładów",
      higher_confidence: "czuć się spokojniej w dniu egzaminu",
      stronger_fluency: "mówić płynniej",
      higher_band: "zbliżyć się do wyższego wyniku"
    },
    titles: {
      why: "Dlaczego uczniowie szukają tego tematu",
      mistake: "Błąd, który obniża wynik",
      stronger: "Jak brzmi mocniejsza odpowiedź",
      routine: "Powtarzalna rutyna ćwiczeń",
      examples: "Jak używać szczegółów bez sztucznego efektu",
      review: "Co sprawdzać po każdej próbie"
    },
    cta: { blog: "Blog", featured: "Polecany artykuł", latest: "Najnowsze artykuły", read: "Czytaj artykuł", readingTracks: "Ścieżki czytania", readMore: "Czytaj dalej" },
    labels: {
      blogTitle: "Długie artykuły o IELTS i TOEFL speaking z jasnym wyjaśnieniem",
      blogDescription: "Czytaj dłuższe przewodniki o IELTS i TOEFL speaking, poprawie wyniku, odpowiedziach wzorcowych, płynności i przygotowaniu.",
      featuredDescription: "Ten polecany artykuł pomaga czytelnikom, którzy chcą najpierw uporządkować plan nauki.",
      latestDescription: "Te artykuły mają przede wszystkim dobrze tłumaczyć temat, a nie wypychać czytelnika do produktu.",
      startPath: "Ścieżka IELTS",
      advancedPath: "Ścieżka TOEFL"
    }
  },
  ru: {
    exam: { ielts: "IELTS speaking", toefl: "TOEFL speaking", both: "IELTS и TOEFL speaking" },
    outcome: {
      clearer_structure: "выстроить более ясную структуру",
      faster_planning: "быстрее планировать под давлением",
      better_examples: "естественнее использовать сильные примеры",
      higher_confidence: "спокойнее чувствовать себя в день экзамена",
      stronger_fluency: "говорить более плавно",
      higher_band: "приблизиться к более высокому баллу"
    },
    titles: {
      why: "Почему ученики ищут эту тему",
      mistake: "Ошибка, которая тянет результат вниз",
      stronger: "Как звучит более сильный ответ",
      routine: "Повторяемая учебная рутина",
      examples: "Как использовать детали без натянутости",
      review: "Что проверять после каждой попытки"
    },
    cta: { blog: "Блог", featured: "Главная статья", latest: "Новые статьи", read: "Читать статью", readingTracks: "Маршруты чтения", readMore: "Читать дальше" },
    labels: {
      blogTitle: "Длинные статьи по IELTS и TOEFL speaking с ясными объяснениями",
      blogDescription: "Читайте подробные материалы о IELTS и TOEFL speaking, росте балла, примерных ответах, беглости речи и подготовке к тесту.",
      featuredDescription: "Эта главная статья выбрана для читателей, которым нужен более ясный план подготовки перед следующим шагом.",
      latestDescription: "Здесь статьи сделаны для реальной пользы читателю, а не для навязчивого продвижения продукта.",
      startPath: "Маршрут IELTS",
      advancedPath: "Маршрут TOEFL"
    }
  },
  ar: {
    exam: { ielts: "التحدث في IELTS", toefl: "التحدث في TOEFL", both: "التحدث في IELTS وTOEFL" },
    outcome: {
      clearer_structure: "بناء هيكل أوضح للإجابة",
      faster_planning: "التخطيط بسرعة أكبر تحت الضغط",
      better_examples: "استخدام أمثلة أقوى بشكل طبيعي",
      higher_confidence: "الشعور بهدوء أكبر يوم الاختبار",
      stronger_fluency: "التحدث بطلاقة أفضل",
      higher_band: "الاقتراب من درجة أعلى"
    },
    titles: {
      why: "لماذا يبحث الطلاب عن هذا الموضوع",
      mistake: "الخطأ الذي يضعف الدرجة",
      stronger: "كيف تبدو الإجابة الأقوى",
      routine: "روتين تدريب يمكن تكراره",
      examples: "كيف تستخدم التفاصيل من دون تكلف",
      review: "ما الذي يجب مراجعته بعد كل محاولة"
    },
    cta: { blog: "المدونة", featured: "المقال المميز", latest: "أحدث المقالات", read: "اقرأ المقال", readingTracks: "مسارات القراءة", readMore: "أكمل القراءة" },
    labels: {
      blogTitle: "مقالات طويلة عن IELTS وTOEFL speaking بشرح واضح ومفيد",
      blogDescription: "اقرأ أدلة أطول حول IELTS وTOEFL speaking وتحسين الدرجة والإجابات النموذجية والطلاقة والاستعداد للاختبار.",
      featuredDescription: "هذا المقال المميز مناسب للقارئ الذي يريد خطة أوضح قبل الانتقال إلى مورد آخر.",
      latestDescription: "هذه المقالات مكتوبة لتقديم فائدة حقيقية، لا لدفع القارئ مباشرة إلى المنتج.",
      startPath: "مسار IELTS",
      advancedPath: "مسار TOEFL"
    }
  },
  ja: {
    exam: { ielts: "IELTSスピーキング", toefl: "TOEFLスピーキング", both: "IELTSとTOEFLのスピーキング" },
    outcome: {
      clearer_structure: "より明確な構成を作る",
      faster_planning: "プレッシャー下でより速く組み立てる",
      better_examples: "自然により強い例を使う",
      higher_confidence: "試験当日により落ち着く",
      stronger_fluency: "より滑らかに話す",
      higher_band: "より高いスコアに近づく"
    },
    titles: {
      why: "学習者がこのテーマを探す理由",
      mistake: "スコアを下げるよくあるミス",
      stronger: "より強い回答はどう聞こえるか",
      routine: "繰り返しやすい練習ルーティン",
      examples: "不自然にならずに具体例を入れる方法",
      review: "各トライ後に見直すべき点"
    },
    cta: { blog: "ブログ", featured: "注目記事", latest: "最新記事", read: "記事を読む", readingTracks: "読書ルート", readMore: "続きを読む" },
    labels: {
      blogTitle: "IELTSとTOEFLスピーキングを深く学べる長文記事",
      blogDescription: "IELTS・TOEFLスピーキング、スコア向上、サンプル回答、流暢さ、メモの取り方、試験準備について長めの解説を読めます。",
      featuredDescription: "次のページを開く前に学習の方向を整理したい読者向けの注目記事です。",
      latestDescription: "ここでは製品誘導よりも、まず内容をしっかり理解できる記事を重視しています。",
      startPath: "IELTSルート",
      advancedPath: "TOEFLルート"
    }
  },
  ko: {
    exam: { ielts: "IELTS 스피킹", toefl: "TOEFL 스피킹", both: "IELTS와 TOEFL 스피킹" },
    outcome: {
      clearer_structure: "더 분명한 구조를 만들기",
      faster_planning: "압박 속에서 더 빨리 계획하기",
      better_examples: "더 좋은 예시를 자연스럽게 쓰기",
      higher_confidence: "시험 당일 더 차분해지기",
      stronger_fluency: "더 유창하게 말하기",
      higher_band: "더 높은 점수에 가까워지기"
    },
    titles: {
      why: "학습자들이 이 주제를 찾는 이유",
      mistake: "점수를 끌어내리는 핵심 실수",
      stronger: "더 강한 답변은 어떻게 들리는가",
      routine: "반복 가능한 연습 루틴",
      examples: "억지스럽지 않게 세부 예시를 넣는 방법",
      review: "매 시도 후 무엇을 검토할지"
    },
    cta: { blog: "블로그", featured: "추천 글", latest: "최신 글", read: "글 읽기", readingTracks: "읽기 루트", readMore: "계속 읽기" },
    labels: {
      blogTitle: "IELTS와 TOEFL 스피킹을 길고 깊게 설명하는 글",
      blogDescription: "IELTS와 TOEFL 스피킹, 점수 향상, 샘플 답변, 유창성, 노트 정리, 시험 준비에 대한 긴 가이드를 읽어보세요.",
      featuredDescription: "다른 자료를 열기 전에 학습 방향을 더 분명히 잡고 싶은 독자를 위한 추천 글입니다.",
      latestDescription: "이 글들은 제품으로 바로 밀어 넣기보다, 먼저 내용을 제대로 이해하도록 돕기 위해 작성되었습니다.",
      startPath: "IELTS 루트",
      advancedPath: "TOEFL 루트"
    }
  }
} satisfies Record<Language, {
  exam: Record<ExamKey, string>;
  outcome: Record<OutcomeKey, string>;
  titles: Record<"why" | "mistake" | "stronger" | "routine" | "examples" | "review", string>;
  cta: Record<"blog" | "featured" | "latest" | "read" | "readingTracks" | "readMore", string>;
  labels: Record<"blogTitle" | "blogDescription" | "featuredDescription" | "latestDescription" | "startPath" | "advancedPath", string>;
}>;

const focusLabels: Record<FocusKey, Record<Language, string>> = {
  part1_hometown: { en: "Part 1 hometown answers", tr: "Part 1 memleket cevapları", de: "Part-1-Antworten zum Heimatort", es: "respuestas de la Parte 1 sobre hometown", fr: "réponses Part 1 sur la ville natale", it: "risposte Part 1 sul luogo d’origine", pt: "respostas da Parte 1 sobre hometown", nl: "Part 1-antwoorden over woonplaats", pl: "odpowiedzi Part 1 o hometown", ru: "ответы Part 1 о родном городе", ar: "إجابات الجزء الأول عن المدينة أو البلدة", ja: "Part 1 の hometown 回答", ko: "Part 1 hometown 답변" },
  part1_work_study: { en: "Part 1 work and study answers", tr: "Part 1 iş ve eğitim cevapları", de: "Part-1-Antworten zu Arbeit und Studium", es: "respuestas de la Parte 1 sobre trabajo y estudios", fr: "réponses Part 1 sur le travail et les études", it: "risposte Part 1 su lavoro e studio", pt: "respostas da Parte 1 sobre trabalho e estudos", nl: "Part 1-antwoorden over werk en studie", pl: "odpowiedzi Part 1 o pracy i nauce", ru: "ответы Part 1 о работе и учебе", ar: "إجابات الجزء الأول عن العمل والدراسة", ja: "Part 1 の仕事と勉強の回答", ko: "Part 1 일과 공부 답변" },
  part2_useful_object: { en: "useful object cue card answers", tr: "yararlı eşya cue card cevapları", de: "Cue-Card-Antworten zu nützlichen Gegenständen", es: "respuestas de cue card sobre un objeto útil", fr: "réponses cue card sur un objet utile", it: "risposte cue card su un oggetto utile", pt: "respostas de cue card sobre um objeto útil", nl: "cue card-antwoorden over een nuttig object", pl: "odpowiedzi cue card o użytecznym przedmiocie", ru: "ответы cue card про полезный предмет", ar: "إجابات بطاقة الحديث عن غرض مفيد", ja: "便利な物の cue card 回答", ko: "유용한 물건 cue card 답변" },
  part2_person: { en: "describe a person answers", tr: "bir kişiyi anlatma cevapları", de: "Antworten zum Beschreiben einer Person", es: "respuestas para describir a una persona", fr: "réponses pour décrire une personne", it: "risposte per descrivere una persona", pt: "respostas para descrever uma pessoa", nl: "antwoorden om een persoon te beschrijven", pl: "odpowiedzi opisujące osobę", ru: "ответы на тему описания человека", ar: "إجابات وصف شخص", ja: "人物描写の回答", ko: "사람 묘사 답변" },
  part2_place: { en: "describe a place answers", tr: "bir yeri anlatma cevapları", de: "Antworten zum Beschreiben eines Ortes", es: "respuestas para describir un lugar", fr: "réponses pour décrire un lieu", it: "risposte per descrivere un luogo", pt: "respostas para descrever um lugar", nl: "antwoorden om een plek te beschrijven", pl: "odpowiedzi opisujące miejsce", ru: "ответы на тему описания места", ar: "إجابات وصف مكان", ja: "場所を描写する回答", ko: "장소 묘사 답변" },
  part3_opinion: { en: "Part 3 opinion answers", tr: "Part 3 görüş cevapları", de: "Part-3-Meinungsantworten", es: "respuestas de opinión de la Parte 3", fr: "réponses d’opinion de la Part 3", it: "risposte di opinione della Part 3", pt: "respostas de opinião da Parte 3", nl: "Part 3-meningsantwoorden", pl: "odpowiedzi opiniotwórcze Part 3", ru: "ответы-мнения для Part 3", ar: "إجابات الرأي في الجزء الثالث", ja: "Part 3 の意見回答", ko: "Part 3 의견 답변" },
  fluency: { en: "fluency training", tr: "akıcılık çalışması", de: "Flüssigkeitstraining", es: "entrenamiento de fluidez", fr: "travail de fluidité", it: "allenamento sulla fluidità", pt: "treino de fluência", nl: "vloeiendheidstraining", pl: "trening płynności", ru: "тренировка беглости речи", ar: "تدريب الطلاقة", ja: "流暢さの練習", ko: "유창성 훈련" },
  pronunciation: { en: "pronunciation and rhythm", tr: "telaffuz ve ritim", de: "Aussprache und Rhythmus", es: "pronunciación y ritmo", fr: "prononciation et rythme", it: "pronuncia e ritmo", pt: "pronúncia e ritmo", nl: "uitspraak en ritme", pl: "wymowa i rytm", ru: "произношение и ритм", ar: "النطق والإيقاع", ja: "発音とリズム", ko: "발음과 리듬" },
  vocabulary: { en: "stronger vocabulary use", tr: "daha güçlü kelime kullanımı", de: "stärkerer Wortschatz", es: "uso de vocabulario más fuerte", fr: "usage d’un vocabulaire plus fort", it: "uso di un vocabolario più forte", pt: "uso de vocabulário mais forte", nl: "sterker woordgebruik", pl: "mocniejsze słownictwo", ru: "более сильный словарь", ar: "استخدام مفردات أقوى", ja: "より強い語彙の使い方", ko: "더 강한 어휘 사용" },
  grammar: { en: "natural grammar under pressure", tr: "baskı altında doğal dil bilgisi", de: "natürliche Grammatik unter Druck", es: "gramática natural bajo presión", fr: "grammaire naturelle sous pression", it: "grammatica naturale sotto pressione", pt: "gramática natural sob pressão", nl: "natuurlijke grammatica onder druk", pl: "naturalna gramatyka pod presją", ru: "естественная грамматика под давлением", ar: "القواعد الطبيعية تحت الضغط", ja: "プレッシャー下の自然な文法", ko: "압박 속 자연스러운 문법" },
  confidence: { en: "test-day confidence", tr: "sınav günü özgüveni", de: "Selbstvertrauen am Testtag", es: "confianza para el día del examen", fr: "confiance le jour du test", it: "fiducia nel giorno dell’esame", pt: "confiança no dia da prova", nl: "zelfvertrouwen op testdag", pl: "pewność siebie w dniu egzaminu", ru: "уверенность в день экзамена", ar: "الثقة يوم الاختبار", ja: "試験当日の自信", ko: "시험 당일 자신감" },
  study_plan_30: { en: "a 30-day IELTS study plan", tr: "30 günlük IELTS çalışma planı", de: "ein 30-Tage-IELTS-Lernplan", es: "un plan de estudio IELTS de 30 días", fr: "un plan IELTS sur 30 jours", it: "un piano IELTS di 30 giorni", pt: "um plano IELTS de 30 dias", nl: "een IELTS-plan voor 30 dagen", pl: "30-dniowy plan IELTS", ru: "30-дневный план IELTS", ar: "خطة IELTS لمدة 30 يومًا", ja: "30日間のIELTS学習計画", ko: "30일 IELTS 학습 계획" },
  retry_method: { en: "the retry method", tr: "yeniden deneme yöntemi", de: "die Wiederholungsmethode", es: "el método de repetir", fr: "la méthode de répétition", it: "il metodo del retry", pt: "o método de repetir", nl: "de retry-methode", pl: "metoda ponownej próby", ru: "метод повторной попытки", ar: "طريقة إعادة المحاولة", ja: "やり直しメソッド", ko: "재도전 방식" },
  band_55_to_65: { en: "moving from band 5.5 to 6.5", tr: "5.5 bandından 6.5’e çıkmak", de: "der Weg von Band 5,5 zu 6,5", es: "pasar de banda 5.5 a 6.5", fr: "passer de 5,5 à 6,5", it: "passare da 5.5 a 6.5", pt: "subir de 5.5 para 6.5", nl: "van band 5,5 naar 6,5 gaan", pl: "przejście z 5,5 na 6,5", ru: "переход с 5,5 на 6,5", ar: "الانتقال من 5.5 إلى 6.5", ja: "5.5から6.5へ上げること", ko: "5.5에서 6.5로 올리기" },
  daily_routine: { en: "a daily speaking routine", tr: "günlük speaking rutini", de: "eine tägliche Speaking-Routine", es: "una rutina diaria de speaking", fr: "une routine quotidienne de speaking", it: "una routine quotidiana di speaking", pt: "uma rotina diária de speaking", nl: "een dagelijkse speaking-routine", pl: "codzienna rutyna speaking", ru: "ежедневная speaking-рутина", ar: "روتين يومي للـ speaking", ja: "毎日の speaking ルーティン", ko: "매일 speaking 루틴" },
  topic_development: { en: "topic development with real examples", tr: "gerçek örneklerle konu geliştirme", de: "Themenentwicklung mit echten Beispielen", es: "desarrollo de ideas con ejemplos reales", fr: "développement des idées avec de vrais exemples", it: "sviluppo delle idee con esempi reali", pt: "desenvolvimento de ideias com exemplos reais", nl: "onderwerpontwikkeling met echte voorbeelden", pl: "rozwijanie tematu na prawdziwych przykładach", ru: "развитие темы на реальных примерах", ar: "تطوير الفكرة بأمثلة حقيقية", ja: "実例を使った話題の展開", ko: "실제 예시로 주제 전개하기" },
  cue_card_notes: { en: "cue card notes", tr: "cue card notları", de: "Cue-Card-Notizen", es: "notas de cue card", fr: "notes pour cue card", it: "appunti per cue card", pt: "anotações de cue card", nl: "cue card-notities", pl: "notatki do cue card", ru: "заметки для cue card", ar: "ملاحظات cue card", ja: "cue card のメモ", ko: "cue card 메모" },
  toefl_independent_structure: { en: "TOEFL independent speaking structure", tr: "TOEFL independent speaking yapısı", de: "die Struktur im TOEFL Independent Speaking", es: "la estructura del TOEFL independent speaking", fr: "la structure du TOEFL independent speaking", it: "la struttura del TOEFL independent speaking", pt: "a estrutura do TOEFL independent speaking", nl: "de structuur van TOEFL independent speaking", pl: "struktura TOEFL independent speaking", ru: "структура TOEFL independent speaking", ar: "هيكل TOEFL independent speaking", ja: "TOEFL independent speaking の構成", ko: "TOEFL independent speaking 구조" },
  toefl_independent_timing: { en: "TOEFL independent speaking timing", tr: "TOEFL independent speaking zamanlaması", de: "das Zeitmanagement im TOEFL Independent Speaking", es: "el tiempo en TOEFL independent speaking", fr: "le timing du TOEFL independent speaking", it: "la gestione del tempo nel TOEFL independent speaking", pt: "o tempo no TOEFL independent speaking", nl: "timing in TOEFL independent speaking", pl: "czas w TOEFL independent speaking", ru: "тайминг TOEFL independent speaking", ar: "توقيت TOEFL independent speaking", ja: "TOEFL independent speaking の時間管理", ko: "TOEFL independent speaking 시간 운영" },
  toefl_independent_samples: { en: "TOEFL independent sample answers", tr: "TOEFL independent örnek cevaplar", de: "Beispielantworten für TOEFL Independent", es: "respuestas modelo de TOEFL independent", fr: "réponses modèles TOEFL independent", it: "risposte esempio TOEFL independent", pt: "respostas modelo de TOEFL independent", nl: "voorbeeldantwoorden TOEFL independent", pl: "przykładowe odpowiedzi TOEFL independent", ru: "примерные ответы TOEFL independent", ar: "إجابات نموذجية لـ TOEFL independent", ja: "TOEFL independent のサンプル回答", ko: "TOEFL independent 샘플 답변" },
  toefl_integrated_balance: { en: "TOEFL integrated balance", tr: "TOEFL integrated denge kurma", de: "das Gleichgewicht in TOEFL Integrated Tasks", es: "el equilibrio en TOEFL integrated", fr: "l’équilibre dans TOEFL integrated", it: "l’equilibrio nel TOEFL integrated", pt: "o equilíbrio no TOEFL integrated", nl: "balans in TOEFL integrated", pl: "równowaga w TOEFL integrated", ru: "баланс в TOEFL integrated", ar: "الموازنة في TOEFL integrated", ja: "TOEFL integrated のバランス", ko: "TOEFL integrated 균형" },
  toefl_integrated_notes: { en: "TOEFL integrated note-taking", tr: "TOEFL integrated not alma", de: "Notizen für TOEFL Integrated", es: "toma de notas en TOEFL integrated", fr: "prise de notes en TOEFL integrated", it: "presa di appunti nel TOEFL integrated", pt: "anotações no TOEFL integrated", nl: "aantekeningen bij TOEFL integrated", pl: "notowanie w TOEFL integrated", ru: "конспектирование в TOEFL integrated", ar: "تدوين الملاحظات في TOEFL integrated", ja: "TOEFL integrated のノート術", ko: "TOEFL integrated 노트 정리" },
  toefl_pronunciation: { en: "TOEFL pronunciation and pacing", tr: "TOEFL telaffuz ve tempo", de: "TOEFL-Aussprache und Sprechtempo", es: "pronunciación y ritmo en TOEFL", fr: "prononciation et rythme en TOEFL", it: "pronuncia e ritmo nel TOEFL", pt: "pronúncia e ritmo no TOEFL", nl: "TOEFL-uitspraak en tempo", pl: "wymowa i tempo w TOEFL", ru: "произношение и темп в TOEFL", ar: "النطق والإيقاع في TOEFL", ja: "TOEFLの発音とペース", ko: "TOEFL 발음과 속도" },
  toefl_confidence: { en: "TOEFL confidence under the timer", tr: "süre altında TOEFL özgüveni", de: "Selbstvertrauen mit dem TOEFL-Timer", es: "confianza con el temporizador de TOEFL", fr: "confiance avec le chronomètre du TOEFL", it: "fiducia con il timer del TOEFL", pt: "confiança com o cronômetro do TOEFL", nl: "zelfvertrouwen met de TOEFL-timer", pl: "pewność siebie z timerem TOEFL", ru: "уверенность под таймером TOEFL", ar: "الثقة تحت مؤقت TOEFL", ja: "TOEFLタイマー下の自信", ko: "TOEFL 타이머 아래 자신감" },
  toefl_study_plan: { en: "a 30-day TOEFL speaking plan", tr: "30 günlük TOEFL speaking planı", de: "ein 30-Tage-TOEFL-Plan", es: "un plan de TOEFL speaking de 30 días", fr: "un plan TOEFL speaking sur 30 jours", it: "un piano TOEFL di 30 giorni", pt: "um plano TOEFL de 30 dias", nl: "een TOEFL-plan voor 30 dagen", pl: "30-dniowy plan TOEFL", ru: "30-дневный план TOEFL", ar: "خطة TOEFL لمدة 30 يومًا", ja: "30日間のTOEFL speaking計画", ko: "30일 TOEFL speaking 계획" },
  toefl_review: { en: "reviewing each TOEFL attempt", tr: "her TOEFL denemesini incelemek", de: "die Analyse jedes TOEFL-Versuchs", es: "la revisión de cada intento de TOEFL", fr: "la revue de chaque tentative TOEFL", it: "la revisione di ogni tentativo TOEFL", pt: "a revisão de cada tentativa do TOEFL", nl: "het nakijken van elke TOEFL-poging", pl: "analiza każdej próby TOEFL", ru: "разбор каждой попытки TOEFL", ar: "مراجعة كل محاولة TOEFL", ja: "各TOEFLトライの見直し", ko: "매 TOEFL 시도 복기" },
  toefl_ideas_faster: { en: "finding ideas faster in TOEFL speaking", tr: "TOEFL speaking’de daha hızlı fikir bulmak", de: "schneller Ideen im TOEFL Speaking finden", es: "encontrar ideas más rápido en TOEFL speaking", fr: "trouver des idées plus vite en TOEFL speaking", it: "trovare idee più velocemente nel TOEFL speaking", pt: "encontrar ideias mais rápido no TOEFL speaking", nl: "sneller ideeën vinden in TOEFL speaking", pl: "szybsze znajdowanie pomysłów w TOEFL speaking", ru: "быстрее находить идеи в TOEFL speaking", ar: "إيجاد الأفكار أسرع في TOEFL speaking", ja: "TOEFL speakingで素早く考えを出す", ko: "TOEFL speaking에서 더 빨리 아이디어 찾기" },
  toefl_templates: { en: "simple TOEFL speaking templates", tr: "basit TOEFL speaking şablonları", de: "einfache TOEFL-Speaking-Vorlagen", es: "plantillas simples de TOEFL speaking", fr: "modèles simples pour TOEFL speaking", it: "modelli semplici per TOEFL speaking", pt: "modelos simples de TOEFL speaking", nl: "eenvoudige TOEFL-speaking-sjablonen", pl: "proste szablony TOEFL speaking", ru: "простые шаблоны TOEFL speaking", ar: "قوالب TOEFL speaking البسيطة", ja: "シンプルなTOEFL speaking テンプレート", ko: "간단한 TOEFL speaking 템플릿" },
  toefl_common_mistakes: { en: "common TOEFL speaking mistakes", tr: "yaygın TOEFL speaking hataları", de: "häufige TOEFL-Speaking-Fehler", es: "errores comunes de TOEFL speaking", fr: "erreurs fréquentes en TOEFL speaking", it: "errori comuni nel TOEFL speaking", pt: "erros comuns no TOEFL speaking", nl: "veelgemaakte TOEFL-speaking-fouten", pl: "częste błędy TOEFL speaking", ru: "частые ошибки в TOEFL speaking", ar: "الأخطاء الشائعة في TOEFL speaking", ja: "よくあるTOEFL speaking のミス", ko: "자주 하는 TOEFL speaking 실수" },
  ielts_toefl_differences: { en: "the differences between IELTS and TOEFL speaking", tr: "IELTS ve TOEFL speaking farkları", de: "die Unterschiede zwischen IELTS und TOEFL Speaking", es: "las diferencias entre IELTS y TOEFL speaking", fr: "les différences entre le speaking IELTS et TOEFL", it: "le differenze tra IELTS e TOEFL speaking", pt: "as diferenças entre IELTS e TOEFL speaking", nl: "de verschillen tussen IELTS en TOEFL speaking", pl: "różnice między IELTS i TOEFL speaking", ru: "разница между IELTS и TOEFL speaking", ar: "الفروق بين IELTS وTOEFL speaking", ja: "IELTSとTOEFL speaking の違い", ko: "IELTS와 TOEFL speaking 차이" },
  ielts_personal_examples: { en: "personal examples in IELTS speaking", tr: "IELTS speaking’de kişisel örnekler", de: "persönliche Beispiele im IELTS Speaking", es: "ejemplos personales en IELTS speaking", fr: "exemples personnels en IELTS speaking", it: "esempi personali nello IELTS speaking", pt: "exemplos pessoais no IELTS speaking", nl: "persoonlijke voorbeelden in IELTS speaking", pl: "osobiste przykłady w IELTS speaking", ru: "личные примеры в IELTS speaking", ar: "الأمثلة الشخصية في IELTS speaking", ja: "IELTS speaking の個人的な例", ko: "IELTS speaking의 개인적 예시" },
  toefl_short_notes: { en: "short notes for TOEFL speaking", tr: "TOEFL speaking için kısa notlar", de: "kurze Notizen für TOEFL Speaking", es: "notas cortas para TOEFL speaking", fr: "courtes notes pour TOEFL speaking", it: "note brevi per TOEFL speaking", pt: "anotações curtas para TOEFL speaking", nl: "korte notities voor TOEFL speaking", pl: "krótkie notatki do TOEFL speaking", ru: "короткие заметки для TOEFL speaking", ar: "ملاحظات قصيرة لـ TOEFL speaking", ja: "TOEFL speaking の短いメモ", ko: "TOEFL speaking용 짧은 메모" }
};

function titleFor(language: Language, blueprint: BlogBlueprint) {
  const pack = localePacks[language];
  const focus = focusLabels[blueprint.focus][language];
  const exam = pack.exam[blueprint.exam];
  const outcome = pack.outcome[blueprint.outcome];

  switch (language) {
    case "tr":
      return `${exam} içinde ${focus} konusunu çalışırken ${outcome} için gerçekten ne yapmalısın`;
    case "de":
      return `Wie du mit ${focus} im ${exam} ${outcome} kannst, ohne künstlich zu klingen`;
    case "es":
      return `Cómo trabajar ${focus} en ${exam} para ${outcome} sin sonar memorizado`;
    case "fr":
      return `Comment travailler ${focus} en ${exam} pour ${outcome} sans paraître récité`;
    case "it":
      return `Come lavorare su ${focus} nello ${exam} per ${outcome} senza sembrare memorizzato`;
    case "pt":
      return `Como trabalhar ${focus} no ${exam} para ${outcome} sem soar decorado`;
    case "nl":
      return `Hoe je met ${focus} in ${exam} ${outcome} zonder ingestudeerd te klinken`;
    case "pl":
      return `Jak pracować nad ${focus} w ${exam}, aby ${outcome} bez sztucznego brzmienia`;
    case "ru":
      return `Как работать над темой ${focus} в ${exam}, чтобы ${outcome} без заученного звучания`;
    case "ar":
      return `كيف تعمل على ${focus} في ${exam} من أجل ${outcome} من دون أن يبدو الكلام محفوظًا`;
    case "ja":
      return `${exam}で${focus}を使いながら${outcome}ために本当に必要なこと`;
    case "ko":
      return `${exam}에서 ${focus}를 연습하면서 ${outcome} 위해 꼭 해야 할 일`;
    default:
      return `How to use ${focus} in ${exam} when you want to ${outcome} without sounding memorized`;
  }
}

function descriptionFor(language: Language, blueprint: BlogBlueprint) {
  const focus = focusLabels[blueprint.focus][language];
  const outcome = localePacks[language].outcome[blueprint.outcome];

  switch (language) {
    case "tr":
      return `${focus} üzerinden ${outcome} isteyen öğrenciler için daha uzun, açıklayıcı ve uygulanabilir bir çalışma yazısı.`;
    case "de":
      return `Ein längerer, praktischer Artikel für Lernende, die mit ${focus} ${outcome} möchten.`;
    case "es":
      return `Un artículo más largo y útil para estudiantes que quieren ${outcome} trabajando ${focus}.`;
    case "fr":
      return `Un article plus long et concret pour les apprenants qui veulent ${outcome} grâce à ${focus}.`;
    case "it":
      return `Un articolo più lungo e concreto per chi vuole ${outcome} lavorando su ${focus}.`;
    case "pt":
      return `Um artigo mais longo e prático para quem quer ${outcome} trabalhando ${focus}.`;
    case "nl":
      return `Een langer, praktisch artikel voor studenten die via ${focus} ${outcome}.`;
    case "pl":
      return `Dłuższy, praktyczny artykuł dla uczniów, którzy chcą ${outcome} dzięki ${focus}.`;
    case "ru":
      return `Более длинная и практичная статья для тех, кто хочет ${outcome} через ${focus}.`;
    case "ar":
      return `مقال أطول وعملي للمتعلمين الذين يريدون ${outcome} من خلال ${focus}.`;
    case "ja":
      return `${focus}を通して${outcome}人のための、長めで実用的な記事です。`;
    case "ko":
      return `${focus}를 통해 ${outcome} 싶은 학습자를 위한 길고 실용적인 글입니다.`;
    default:
      return `A longer, practical article for learners who want to ${outcome} while working on ${focus}.`;
  }
}

function introFor(language: Language, blueprint: BlogBlueprint, title: string) {
  const focus = focusLabels[blueprint.focus][language];
  const outcome = localePacks[language].outcome[blueprint.outcome];
  const exam = localePacks[language].exam[blueprint.exam];

  switch (language) {
    case "tr":
      return `${title} sorusu, ${exam} çalışan öğrencilerin sık yaptığı gerçek bir aramayı temsil ediyor. Bunun nedeni basit: ${focus} gibi dar görünen bir alan bile, doğru çalışılmazsa tüm cevabın kalitesini etkileyebilir. Bu yazıda yalnızca genel tavsiye vermek yerine, neden zorlandığını, güçlü bir cevabın nasıl duyulduğunu ve bunu günlük çalışmaya nasıl çevirebileceğini daha ayrıntılı biçimde ele alacağız. Amaç yalnızca teori vermek değil; seni ${outcome} yönünde ilerletecek daha somut bir çalışma çerçevesi sunmak.`;
    case "de":
      return `${title} ist genau die Art Suche, die Lernende kurz vor einer echten Veränderung machen. Selbst ein scheinbar enges Thema wie ${focus} wirkt sich im ${exam} oft auf den gesamten Eindruck aus: Struktur, Klarheit, Tempo und Sicherheit hängen stärker zusammen, als viele denken. In diesem Artikel geht es deshalb nicht nur um einzelne Tipps, sondern um ein zusammenhängendes Arbeitsmodell, das dir helfen soll, ${outcome}.`;
    case "es":
      return `${title} refleja una búsqueda muy real entre estudiantes que ya sienten que algo pequeño está frenando un resultado más fuerte. En ${exam}, un punto como ${focus} no afecta solo una parte de la respuesta; también cambia tu claridad, tu ritmo y la impresión general del examinador. Por eso este artículo no se queda en consejos sueltos. La meta es explicar mejor el trabajo y darte una estructura útil para ${outcome}.`;
    case "fr":
      return `${title} correspond à une vraie recherche faite par des apprenants qui sentent qu’un détail bloque encore leur progression. Dans ${exam}, un sujet comme ${focus} touche rarement un seul critère: il influence la clarté, le rythme, le développement des idées et la maîtrise générale. Cet article cherche donc à aller plus loin que des conseils isolés, afin de te donner une méthode plus complète pour ${outcome}.`;
    case "it":
      return `${title} rappresenta una ricerca molto concreta fatta da studenti che hanno già capito che un dettaglio specifico blocca un risultato migliore. In ${exam}, un focus come ${focus} non incide solo su una frase o su un errore: cambia la struttura, la chiarezza e la sensazione generale di controllo. Qui l’obiettivo è spiegare bene il lavoro e offrirti un percorso più concreto per ${outcome}.`;
    case "pt":
      return `${title} é o tipo de busca feita por alunos que já perceberam que um detalhe específico está segurando uma nota melhor. Em ${exam}, um foco como ${focus} afeta mais do que um único ponto; ele muda a estrutura, o ritmo e a impressão geral da resposta. Por isso este texto vai além de dicas soltas e tenta oferecer um caminho mais útil para ${outcome}.`;
    case "nl":
      return `${title} is precies het soort zoekopdracht dat studenten intypen wanneer ze voelen dat één onderdeel hun groei blokkeert. In ${exam} heeft ${focus} vaak invloed op veel meer dan één foutje: het raakt structuur, tempo, duidelijkheid en vertrouwen tegelijk. Daarom is dit artikel bewust langer opgezet, zodat je niet alleen tips leest maar een bruikbaar plan krijgt om ${outcome}.`;
    case "pl":
      return `${title} to bardzo typowe pytanie uczniów, którzy czują, że jeden konkretny element zatrzymuje ich wynik. W ${exam} taki obszar jak ${focus} wpływa nie tylko na pojedyncze zdanie, ale na cały odbiór odpowiedzi: strukturę, płynność, rozwój pomysłów i pewność. Ten tekst ma więc wyjaśnić temat szerzej i dać bardziej praktyczny model pracy, który pomoże ${outcome}.`;
    case "ru":
      return `${title} — это реальный запрос тех, кто уже понимает: один конкретный элемент мешает выйти на более сильный результат. В ${exam} тема вроде ${focus} влияет не только на отдельный фрагмент ответа, но и на общую ясность, темп, структуру и уверенность. Поэтому статья сделана более длинной и практичной: цель в том, чтобы дать рабочую схему, помогающую ${outcome}.`;
    case "ar":
      return `${title} يمثّل نوعًا حقيقيًا من الأسئلة التي يكتبها المتعلم عندما يشعر أن تفصيلًا واحدًا يعيق تقدمه. في ${exam} لا يؤثر موضوع مثل ${focus} في جزء صغير من الإجابة فقط، بل يغيّر وضوح الفكرة وسرعة البناء والانطباع العام عن الأداء. لهذا السبب لا يكتفي هذا المقال بنصائح سريعة، بل يحاول أن يقدّم إطارًا أوضح يساعدك على ${outcome}.`;
    case "ja":
      return `${title} というテーマは、実際に伸び悩んでいる学習者がよく探す内容です。${exam}では ${focus} のような一見小さな論点でも、答え全体の構成、わかりやすさ、流れ、自信の見え方まで変えてしまいます。この記事では単発のコツではなく、なぜ難しくなるのか、何を見直すべきか、どう練習に落とし込むかを整理し、${outcome}ための実用的な道筋を示します。`;
    case "ko":
      return `${title} 는 실제로 막히는 학습자들이 자주 찾는 질문입니다. ${exam}에서는 ${focus} 같은 주제가 단순히 한 부분의 문제가 아니라 전체 답변의 구조, 명확성, 속도, 자신감까지 바꿉니다. 그래서 이 글은 짧은 팁 몇 개보다 왜 어려워지는지, 더 좋은 답변은 어떤 느낌인지, 연습은 어떻게 반복해야 하는지를 정리해 ${outcome} 데 도움이 되도록 만들었습니다.`;
    default:
      return `${title} is the kind of search learners make when they already feel that one narrow issue is holding their score down. In ${exam}, something like ${focus} rarely affects only one line of speech; it changes structure, timing, clarity, and the level of control the answer communicates. This article is intentionally longer because quick tips are not enough. The goal is to give you a practical way to ${outcome} with a plan you can actually repeat.`;
  }
}

function paragraphFor(
  language: Language,
  blueprint: BlogBlueprint,
  variant: 1 | 2 | 3 | 4 | 5 | 6,
  paragraph: 1 | 2
) {
  const focus = focusLabels[blueprint.focus][language];
  const exam = localePacks[language].exam[blueprint.exam];
  const outcome = localePacks[language].outcome[blueprint.outcome];

  const enParagraphs = {
    "1-1": `Learners usually arrive at ${focus} because their current answer pattern feels thinner than it sounds in their head. In ${exam}, that often means the opening is acceptable, but the middle of the answer does not carry enough weight. The examiner hears a topic, a quick opinion, and then a finish that arrives too early. The real problem is not a lack of English. The real problem is that the answer shape is too small for the score the learner wants.`,
    "1-2": `When you define the problem that way, the work becomes more practical. You do not need twenty random tips. You need a clearer answer frame, a better sense of pacing, and a way to rehearse the same move until it feels normal. That is why this topic matters to students who want to ${outcome}. It sits at the point where idea quality, fluency, and structure all meet.`,
    "2-1": `The weak pattern usually starts with over-compression. Students try to sound efficient, so they answer too quickly, skip the detail that would make the point believable, and move on before the thought has had time to settle. In listening terms, the response sounds thin. In scoring terms, it lowers control, relevance, and the natural development of the answer.`,
    "2-2": `A second mistake appears when learners try to compensate by memorizing. That often creates the opposite problem: the answer becomes smoother on the surface but less alive underneath. The examiner can hear repeated language, safe but empty linking, and details that do not feel attached to the speaker’s own experience. Good preparation should make the answer more personal and more stable, not more artificial.`,
    "3-1": `A stronger answer in ${exam} does not need to sound dramatic. It usually sounds calmer. The speaker introduces the idea with a clear position, adds one piece of meaningful detail, and keeps the sentence rhythm under control. Even when the vocabulary is simple, the answer feels more mature because the listener never loses the thread.`,
    "3-2": `This is why students often underestimate how much score movement can come from one practical adjustment. If ${focus} becomes more organized, the same learner can suddenly sound more fluent, more relevant, and more confident without changing their entire English level. Better speaking answers are often built by improving the shape of the response before improving the decoration around it.`,
    "4-1": `A repeatable routine should start with one prompt, not five. Record a first answer, read the transcript carefully, and mark the place where the answer became too general, too short, or too memorized. Then rebuild only that section. This is much more effective than jumping to a new prompt every time, because it turns feedback into visible change.`,
    "4-2": `On the second attempt, keep one objective in mind. For example: add one real example, delay the conclusion by one sentence, or change two generic verbs into more specific language. A focused retry teaches more than a long correction list. Over time, that is what helps learners ${outcome} instead of only understanding the theory.`,
    "5-1": `Details matter because they make an answer easier to trust. In speaking tests, one short but concrete example often does more work than three abstract sentences. The key is not to tell a huge story. The key is to choose one detail that proves the idea is real: when it happened, who was involved, what changed, or why it mattered to you personally.`,
    "5-2": `The strongest details are usually small and believable. If a learner says that a cue-card object helped them organize their study week, save time during a commute, or explain something to a younger sibling, the answer becomes easier to follow. In ${exam}, clarity often grows when the content becomes more specific and less performative.`,
    "6-1": `After each attempt, review the answer in layers. First ask whether the response truly answered the prompt. Then ask whether it stayed organized from start to finish. After that, check whether the rhythm broke in the same places, whether the vocabulary became repetitive, and whether the example felt attached to the main point. This kind of layered review is slower at first, but it prevents shallow practice.`,
    "6-2": `If you keep that review habit, ${focus} stops being a vague weakness and becomes a trainable skill. That is the point of a longer article like this one: not just to say “practice more,” but to show what to practice, why it matters, and how to notice improvement early. When that happens, learners build momentum, and score growth starts to feel more earned than accidental.`
  } as const;

  if (language === "en") {
    return enParagraphs[`${variant}-${paragraph}`];
  }

  const leadMap: Record<Language, string> = {
    en: "",
    tr: `Bu bölüm ${focus} üzerinden ${exam} çalışırken ${outcome} isteyen öğrenciler için en kritik noktayı açıklar. `,
    de: `Dieser Abschnitt erklärt den Kernpunkt für Lernende, die mit ${focus} im ${exam} ${outcome} wollen. `,
    es: `Esta parte explica el punto central para estudiantes que trabajan ${focus} en ${exam} y quieren ${outcome}. `,
    fr: `Cette partie explique le point central pour les apprenants qui travaillent ${focus} en ${exam} et veulent ${outcome}. `,
    it: `Questa parte spiega il punto centrale per chi lavora su ${focus} nello ${exam} e vuole ${outcome}. `,
    pt: `Esta parte explica o ponto central para quem trabalha ${focus} no ${exam} e quer ${outcome}. `,
    nl: `Dit deel legt het kernpunt uit voor leerlingen die met ${focus} in ${exam} ${outcome}. `,
    pl: `Ta część wyjaśnia najważniejszy punkt dla uczniów, którzy pracują nad ${focus} w ${exam} i chcą ${outcome}. `,
    ru: `Этот раздел объясняет главное для тех, кто работает над ${focus} в ${exam} и хочет ${outcome}. `,
    ar: `يشرح هذا الجزء الفكرة الأساسية لمن يعمل على ${focus} في ${exam} ويريد ${outcome}. `,
    ja: `この部分では、${exam}で${focus}を扱いながら${outcome}ために重要な点を整理します。`,
    ko: `이 부분은 ${exam}에서 ${focus}를 다루며 ${outcome} 위해 가장 중요한 점을 설명합니다. `
  };

  const coreMap: Record<Language, string> = {
    en: "",
    tr: `Önemli olan daha fazla rastgele tavsiye görmek değil; cevap yapısının neden zayıf kaldığını, hangi detayın eksik olduğunu ve tekrar çalışırken neyin gerçekten değişmesi gerektiğini net biçimde fark etmektir. Güçlü öğrenciler de çoğu zaman aynı tuzağa düşer: ya çok hızlı bitirirler ya da örnek vermeden genel konuşurlar. Bu yüzden her denemede yapı, örnek ve ritim birlikte ele alınmalıdır.`,
    de: `Entscheidend ist nicht, noch mehr zufällige Tipps zu sammeln, sondern klar zu erkennen, warum die Antwort schwächer wirkt, welches Detail fehlt und was sich im nächsten Versuch wirklich ändern muss. Selbst gute Lernende rutschen oft in dieselbe Falle: Sie enden zu schnell oder bleiben zu allgemein. Deshalb sollten Struktur, Beispiel und Rhythmus immer gemeinsam betrachtet werden.`,
    es: `Lo importante no es acumular más consejos sueltos, sino entender por qué la respuesta suena débil, qué detalle falta y qué debe cambiar de verdad en el siguiente intento. Incluso los estudiantes fuertes caen en la misma trampa: terminan demasiado pronto o hablan de forma demasiado general. Por eso conviene revisar siempre estructura, ejemplo y ritmo al mismo tiempo.`,
    fr: `L’essentiel n’est pas d’accumuler encore plus de conseils isolés, mais de comprendre clairement pourquoi la réponse semble faible, quel détail manque et ce qui doit réellement changer au prochain essai. Même les apprenants solides tombent souvent dans le même piège: ils finissent trop vite ou restent trop généraux. Il faut donc travailler la structure, l’exemple et le rythme ensemble.`,
    it: `La cosa importante non è raccogliere altri consigli casuali, ma capire con chiarezza perché la risposta sembra debole, quale dettaglio manca e cosa deve davvero cambiare nel tentativo successivo. Anche studenti forti cadono spesso nello stesso schema: finiscono troppo in fretta oppure restano troppo generici. Per questo struttura, esempio e ritmo vanno sempre osservati insieme.`,
    pt: `O mais importante não é juntar mais dicas soltas, mas perceber com clareza por que a resposta parece fraca, qual detalhe está faltando e o que realmente precisa mudar na próxima tentativa. Mesmo alunos fortes caem no mesmo padrão: terminam cedo demais ou falam de forma muito geral. Por isso vale revisar estrutura, exemplo e ritmo ao mesmo tempo.`,
    nl: `Het belangrijkste is niet om nog meer losse tips te verzamelen, maar helder te zien waarom het antwoord zwakker klinkt, welk detail ontbreekt en wat er in de volgende poging echt moet veranderen. Zelfs sterke leerlingen lopen vaak in dezelfde val: ze zijn te snel klaar of blijven te algemeen. Daarom moeten structuur, voorbeeld en ritme steeds samen worden bekeken.`,
    pl: `Najważniejsze nie jest zbieranie kolejnych przypadkowych porad, ale zrozumienie, dlaczego odpowiedź brzmi słabo, jakiego szczegółu brakuje i co naprawdę powinno się zmienić w następnej próbie. Nawet mocni uczniowie wpadają w tę samą pułapkę: kończą za szybko albo mówią zbyt ogólnie. Dlatego strukturę, przykład i rytm warto zawsze analizować razem.`,
    ru: `Главное здесь не в том, чтобы собрать еще больше случайных советов, а в том, чтобы ясно понять, почему ответ звучит слабее, какой детали не хватает и что действительно нужно изменить в следующей попытке. Даже сильные ученики часто попадают в одну и ту же ловушку: заканчивают слишком быстро или говорят слишком общо. Поэтому структуру, пример и ритм нужно рассматривать вместе.`,
    ar: `المهم هنا ليس جمع مزيد من النصائح العشوائية، بل فهم سبب ضعف الإجابة، وما التفصيل الناقص، وما الذي يجب أن يتغير فعلًا في المحاولة التالية. حتى المتعلم الجيد يقع كثيرًا في الفخ نفسه: ينهي الفكرة بسرعة أو يبقى عامًا أكثر من اللازم. لذلك من الأفضل مراجعة البنية والمثال والإيقاع معًا في كل مرة.`,
    ja: `大切なのは、ばらばらのコツを増やすことではなく、なぜ答えが弱く聞こえるのか、どの情報が足りないのか、次の試行で何を本当に変えるべきかをはっきり理解することです。上級の学習者でも、早く終わりすぎる、あるいは抽象的すぎるという同じ落とし穴にはまりがちです。だからこそ、構成・具体例・リズムをまとめて見直す必要があります。`,
    ko: `중요한 것은 흩어진 팁을 더 모으는 일이 아니라 왜 답변이 약하게 들리는지, 어떤 디테일이 빠졌는지, 다음 시도에서 무엇이 실제로 바뀌어야 하는지 분명히 이해하는 것입니다. 강한 학습자도 너무 빨리 끝내거나 지나치게 일반적으로 말하는 같은 함정에 자주 빠집니다. 그래서 구조, 예시, 리듬을 함께 점검해야 합니다.`
  };

  return `${leadMap[language]}${coreMap[language]}`;
}

function sectionsFor(language: Language, blueprint: BlogBlueprint): BlogSection[] {
  const titles = localePacks[language].titles;
  return [
    { title: titles.why, body: [paragraphFor(language, blueprint, 1, 1), paragraphFor(language, blueprint, 1, 2)] },
    { title: titles.mistake, body: [paragraphFor(language, blueprint, 2, 1), paragraphFor(language, blueprint, 2, 2)] },
    { title: titles.stronger, body: [paragraphFor(language, blueprint, 3, 1), paragraphFor(language, blueprint, 3, 2)] },
    { title: titles.routine, body: [paragraphFor(language, blueprint, 4, 1), paragraphFor(language, blueprint, 4, 2)] },
    { title: titles.examples, body: [paragraphFor(language, blueprint, 5, 1), paragraphFor(language, blueprint, 5, 2)] },
    { title: titles.review, body: [paragraphFor(language, blueprint, 6, 1), paragraphFor(language, blueprint, 6, 2)] }
  ];
}

function keywordsFor(blueprint: BlogBlueprint) {
  const examKeyword = blueprint.exam === "toefl" ? "TOEFL speaking practice" : blueprint.exam === "both" ? "IELTS TOEFL speaking" : "IELTS speaking practice";
  return [
    examKeyword,
    focusLabels[blueprint.focus].en,
    "speaking score improvement",
    "sample answers",
    "daily speaking practice"
  ];
}

function buildPost(language: Language, blueprint: BlogBlueprint): LocalizedBlogPost {
  const title = titleFor(language, blueprint);
  return {
    slug: blueprint.slug,
    title,
    description: descriptionFor(language, blueprint),
    keywords: keywordsFor(blueprint),
    intro: introFor(language, blueprint, title),
    sections: sectionsFor(language, blueprint)
  };
}

export function getAllBlogSlugs() {
  return blogBlueprints.map((post) => post.slug);
}

export function getLocalizedBlogPosts(language: Language) {
  return blogBlueprints.map((blueprint) => buildPost(language, blueprint));
}

export function getLocalizedBlogPost(language: Language, slug: string) {
  const blueprint = blogBlueprints.find((item) => item.slug === slug);
  return blueprint ? buildPost(language, blueprint) : null;
}

export function getFeaturedBlogPosts(language: Language) {
  const posts = getLocalizedBlogPosts(language);
  return {
    featured: posts[0],
    firstPath: posts.slice(1, 5),
    secondPath: posts.slice(16, 20),
    all: posts
  };
}

export function getBlogChromeCopy(language: Language) {
  return localePacks[language];
}

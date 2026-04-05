"use client";

import type { Route } from "next";
import Link from "next/link";
import { useAppState } from "@/components/providers";
import { LeadCaptureForm } from "@/components/lead-capture-form";
import { MarketingDemoShowcase } from "@/components/marketing-demo-showcase";
import { buildPlanCheckoutPath, commerceConfig, couponCatalog, getPlanComparison } from "@/lib/commerce";
import { freePacks, roadmapCards, studyTracks } from "@/lib/growth-pack";
import {
  blogPosts,
  coreKeywords,
  shortLandingPoints,
  standoutFeatures,
  whySpeakAce
} from "@/lib/marketing-content";
import { siteConfig } from "@/lib/site";

const trustSignals = {
  en: [
    { label: "Best score seen", value: "Band-style score after each attempt" },
    { label: "Average view", value: "Track score movement over time" },
    { label: "Main payoff", value: "Speak, score, fix, retry" },
    { label: "Best for", value: "IELTS speaking score improvement" }
  ],
  tr: [
    { label: "En iyi skor", value: "Her denemeden sonra band benzeri skor" },
    { label: "Ortalama görünüm", value: "Skor hareketini zamanla takip et" },
    { label: "Ana kazanç", value: "Konuş, skorunu gör, düzelt, tekrar dene" },
    { label: "En uygun kullanım", value: "IELTS speaking skorunu yükseltmek" }
  ]
};

const testimonials = {
  en: [
    {
      quote:
        "It gave me the fastest feedback loop I had during IELTS preparation. I could see my weak answers immediately and retry them the same day.",
      author: "IELTS student",
      role: "Band 6.0 target learner"
    },
    {
      quote:
        "The transcript and stronger sample answer made it obvious why my speaking score was stuck.",
      author: "Self-study user",
      role: "Preparing for speaking retake"
    },
    {
      quote:
        "The class and homework tools make it much easier to monitor student speaking practice between lessons.",
      author: "Language teacher",
      role: "Uses SpeakAce with small groups"
    }
  ],
  tr: [
    {
      quote:
        "IELTS hazırlığında gördüğüm en hızlı geri bildirim döngüsünü verdi. Zayıf cevaplarımı aynı gün içinde görüp tekrar çalışabildim.",
      author: "IELTS öğrencisi",
      role: "Band 6.0 hedefi"
    },
    {
      quote:
        "Transcript ve geliştirilmiş örnek cevap, speaking skorunun neden takıldığını çok daha net gösterdi.",
      author: "Bireysel kullanıcı",
      role: "Speaking retake hazırlığı"
    },
    {
      quote:
        "Sınıf ve ödev araçları, speaking pratiğini ders aralarında takip etmeyi öğretmen için çok daha kolaylaştırıyor.",
      author: "Dil öğretmeni",
      role: "Küçük gruplarla kullanıyor"
    }
  ]
};

const useCases = {
  en: [
    {
      title: "For IELTS students",
      description: "Practice Part 1, Part 2, and Part 3 with score-focused AI feedback instead of random speaking prompts."
    },
    {
      title: "For self-study learners",
      description: "Build a daily speaking habit without needing a tutor every time you want feedback."
    },
    {
      title: "For teachers and schools",
      description: "Track class progress, assign homework, review attempts, and keep student speaking practice active between lessons."
    }
  ],
  tr: [
    {
      title: "IELTS öğrencileri için",
      description: "Rastgele speaking soruları yerine Part 1, Part 2 ve Part 3 için skor odaklı AI geri bildirimle çalış."
    },
    {
      title: "Kendi başına çalışan öğrenciler için",
      description: "Her geri bildirim için öğretmene ihtiyaç duymadan günlük speaking düzeni kur."
    },
    {
      title: "Öğretmenler ve kurslar için",
      description: "Sınıf gelişimini izle, ödev ata, denemeleri incele ve speaking pratiğini ders aralarında da canlı tut."
    }
  ]
};

const comparisonPoints = {
  en: [
    {
      title: "More focused than generic AI chat",
      description: "SpeakAce is built around exam speaking tasks, estimated score signals, and retry-based improvement."
    },
    {
      title: "Faster than waiting for manual review",
      description: "Students can record, review, and retry in one session instead of waiting days for feedback."
    },
    {
      title: "More practical than memorizing templates",
      description: "The product pushes learners toward clearer structure, better examples, and more natural speaking control."
    }
  ],
  tr: [
    {
      title: "Genel AI chat araçlarından daha odaklı",
      description: "SpeakAce; sınav speaking görevleri, tahmini skor sinyalleri ve tekrar denemeleri üzerinden gelişim için tasarlandı."
    },
    {
      title: "Manuel geri bildirim beklemekten daha hızlı",
      description: "Öğrenci tek oturum içinde kaydedip inceleyebilir ve yeniden deneyebilir; günlerce geri bildirim beklemez."
    },
    {
      title: "Ezber kalıplardan daha faydalı",
      description: "Ürün öğrenciyi daha net yapı, daha iyi örnek ve daha doğal konuşma kontrolüne iter."
    }
  ]
};

const faqs = {
  en: [
    {
      question: "Is SpeakAce an official IELTS scoring service?",
      answer:
        "No. SpeakAce is an AI-powered IELTS and TOEFL speaking practice platform that gives estimated scores and feedback for preparation."
    },
    {
      question: "Can I improve my IELTS speaking score with daily AI practice?",
      answer:
        "Yes. Daily speaking practice with transcript review, feedback, and retry sessions can help you improve fluency, confidence, and answer structure."
    },
    {
      question: "Who is SpeakAce for?",
      answer:
        "SpeakAce is built for IELTS students, TOEFL students, language learners, teachers, and language schools that want stronger speaking practice."
    }
  ],
  tr: [
    {
      question: "SpeakAce resmi IELTS puanlama servisi mi?",
      answer:
        "Hayır. SpeakAce, hazırlık sürecinde tahmini skor ve geri bildirim sunan yapay zekâ destekli bir IELTS ve TOEFL speaking çalışma platformudur."
    },
    {
      question: "Günlük AI speaking pratiğiyle IELTS speaking skoru gelişir mi?",
      answer:
        "Evet. Günlük speaking çalışması, transcript incelemesi, geri bildirim ve tekrar denemeleri akıcılığı, özgüveni ve cevap yapısını geliştirmeye yardımcı olabilir."
    },
    {
      question: "SpeakAce kimler için uygun?",
      answer:
        "SpeakAce, IELTS ve TOEFL öğrencileri, İngilizce öğrenenler, öğretmenler ve speaking pratiğini güçlendirmek isteyen dil kursları için tasarlanmıştır."
    }
  ]
};

const dailyPrompts = {
  en: [
    "Describe a useful object you use every day and explain why it matters to you.",
    "Talk about a person who helped you improve your English speaking confidence.",
    "Describe a place where you feel relaxed and explain why it is special.",
    "Do you think people communicate better online or face to face? Why?"
  ],
  tr: [
    "Her gün kullandığın faydalı bir nesneyi anlat ve neden önemli olduğunu açıkla.",
    "İngilizce konuşma özgüvenini geliştirmene yardımcı olan bir kişiyi anlat.",
    "Kendini rahat hissettiğin bir yeri anlat ve neden özel olduğunu açıkla.",
    "Sence insanlar çevrim içi mi yoksa yüz yüze mi daha iyi iletişim kuruyor? Neden?"
  ]
};

const answerUpgrade = {
  en: {
    weakTitle: "A weaker answer",
    strongTitle: "A stronger retry",
    weak:
      "I use my phone every day. It is useful because I can message people and check information. I think it is important and I like using it.",
    strong:
      "One useful object I use every day is my phone. I rely on it for messaging, maps, and quick study tasks, so it saves me a lot of time. For example, when I travel to university, I use it to check directions and review English notes at the same time. That is why it feels practical rather than just entertaining.",
    note: "The stronger version gives one clear use case, one example, and a more mature closing idea."
  },
  tr: {
    weakTitle: "Daha zayıf cevap",
    strongTitle: "Daha güçlü tekrar denemesi",
    weak:
      "Telefonumu her gün kullanırım. Faydalıdır çünkü insanlara mesaj atabilirim ve bilgi bakabilirim. Bence önemlidir ve kullanmayı seviyorum.",
    strong:
      "Her gün kullandığım faydalı eşyalardan biri telefonum. Mesajlaşma, harita ve kısa çalışma işleri için ona güveniyorum, bu yüzden bana ciddi zaman kazandırıyor. Mesela üniversiteye giderken hem yol tarifi kontrol ediyor hem de İngilizce notlarıma hızlıca bakıyorum. Bu nedenle benim için sadece eğlenceli değil, gerçekten pratik bir araç.",
    note: "Daha güçlü versiyon tek bir net kullanım alanı, bir örnek ve daha olgun bir kapanış fikri veriyor."
  }
};

const examWeekChecklist = {
  en: [
    "Repeat two familiar prompts instead of chasing ten new ones.",
    "Use one mock speaking session to calm exam-day pressure.",
    "Review one transcript and fix one repeated weak habit.",
    "Sleep and routine matter more than one last heavy study block."
  ],
  tr: [
    "On yeni soru kovalamak yerine iki tanıdık prompt’u tekrar çöz.",
    "Sınav günü baskısını azaltmak için bir mock speaking oturumu yap.",
    "Bir transcript incele ve tekrar eden tek bir zayıf alışkanlığı düzelt.",
    "Son bir ağır çalışma yerine uyku ve düzen daha çok önemlidir."
  ]
};

const speakingIdentities = {
  en: [
    {
      title: "Fast but thin",
      signal: "You answer quickly but your ideas stay too shallow.",
      move: "Use one reason plus one concrete example before you stop.",
      badge: "Band lift comes from depth"
    },
    {
      title: "Careful but slow",
      signal: "Your grammar feels controlled, but pauses break your rhythm.",
      move: "Shorter sentence patterns and lighter linking improve flow.",
      badge: "Band lift comes from rhythm"
    },
    {
      title: "Natural but repetitive",
      signal: "You sound comfortable, but key words repeat too often.",
      move: "Swap one repeated phrase for a stronger topic-specific expression.",
      badge: "Band lift comes from range"
    },
    {
      title: "Structured but flat",
      signal: "Your answer is organized, but it lacks vivid examples.",
      move: "Add one real-life detail that makes the answer feel lived-in.",
      badge: "Band lift comes from specificity"
    }
  ],
  tr: [
    {
      title: "Hızlı ama ince",
      signal: "Cevabı hızlı veriyorsun ama fikirlerin fazla yüzeyde kalıyor.",
      move: "Bitirmeden önce bir neden ve bir somut örnek ekle.",
      badge: "Band artışı derinlikten gelir"
    },
    {
      title: "Dikkatli ama yavaş",
      signal: "Dilbilgisi kontrollü ama duraksamalar ritmi bozuyor.",
      move: "Daha kısa cümle kalıpları ve daha hafif bağlaçlar akışı iyileştirir.",
      badge: "Band artışı ritimden gelir"
    },
    {
      title: "Doğal ama tekrarcı",
      signal: "Konuşman rahat ama ana kelimeleri fazla tekrar ediyorsun.",
      move: "Tekrar eden bir ifadeyi konuya uygun daha güçlü bir kelimeyle değiştir.",
      badge: "Band artışı kelime çeşitliliğinden gelir"
    },
    {
      title: "Yapılı ama düz",
      signal: "Cevabın düzenli ama güçlü bir örnek eksik kalıyor.",
      move: "Cevabı daha canlı yapmak için tek bir gerçek hayat detayı ekle.",
      badge: "Band artışı özgüllükten gelir"
    }
  ]
};

const scoreLadders = {
  en: [
    { label: "5.5 -> 6.0", note: "Stop fragment answers and finish your idea cleanly." },
    { label: "6.0 -> 6.5", note: "Add clearer examples and smoother links between points." },
    { label: "6.5 -> 7.0", note: "Sound more natural, less repetitive, and more controlled under pressure." }
  ],
  tr: [
    { label: "5.5 -> 6.0", note: "Parçalı cevapları bırak ve fikrini temiz şekilde tamamla." },
    { label: "6.0 -> 6.5", note: "Daha net örnekler ve daha akıcı bağlantılar ekle." },
    { label: "6.5 -> 7.0", note: "Baskı altında daha doğal, daha az tekrarlı ve daha kontrollü konuş." }
  ]
};

const howItWorks = {
  en: [
    {
      title: "Choose your exam and task",
      description:
        "Pick IELTS or TOEFL, then start the speaking task that matches what you want to improve."
    },
    {
      title: "Record your answer under time pressure",
      description:
        "Use your browser microphone and practice with a flow that feels closer to the real exam."
    },
    {
      title: "Review transcript, score estimate, and feedback",
      description:
        "See what you said, what sounds weak, and what can move your score higher."
    },
    {
      title: "Retry with a stronger plan",
      description:
        "Use the improved answer, pronunciation notes, and next-step guidance to make your next attempt better."
    }
  ],
  tr: [
    {
      title: "Sınavını ve görev tipini seç",
      description:
        "IELTS veya TOEFL seç, sonra geliştirmek istediğin speaking görevini başlat."
    },
    {
      title: "Süre baskısı altında cevabını kaydet",
      description:
        "Tarayıcı mikrofonunu kullan ve gerçek sınava daha çok benzeyen bir akışla pratik yap."
    },
    {
      title: "Transcript, skor tahmini ve geri bildirimi incele",
      description:
        "Ne söylediğini, nerede zayıf kaldığını ve skoru yükseltmek için neyi geliştirmen gerektiğini gör."
    },
    {
      title: "Daha güçlü bir planla tekrar dene",
      description:
        "Geliştirilmiş örnek cevap, telaffuz notları ve sonraki adımlarla bir sonraki denemeni daha iyi hale getir."
    }
  ]
};

const pricingReasons = {
  en: [
    "One good speaking lesson or mock interview can cost more than a full week of SpeakAce.",
    "For $3.99/week, learners can practice more often, get feedback faster, and build a real speaking routine.",
    "The value is not just AI feedback. It is the speed of the feedback loop, the quality of the transcript review, and the number of score-improving repetitions you can fit into one focused week."
  ],
  tr: [
    "Tek bir iyi speaking dersi veya mock görüşme, SpeakAce’in bir haftalık ücretinden daha pahalı olabilir.",
    "Haftalık $3.99 ile öğrenciler daha sık pratik yapabilir, daha hızlı geri bildirim alabilir ve gerçek bir speaking rutini kurabilir.",
    "Değer sadece AI geri bildiriminde değil; geri bildirim döngüsünün hızında, transcript incelemesinin kalitesinde ve bir hafta içinde yapabileceğin gelişim odaklı tekrar sayısında."
  ]
};

const shortLandingCopy = {
  en: {
    title: "Short landing page version",
    cta: "Start IELTS speaking practice"
  },
  tr: {
    title: "Kısa landing sürümü",
    cta: "IELTS speaking çalışmasına başla"
  }
};

const minimalMarketingCopy = {
  en: {
    title: "Increase your IELTS Speaking score with AI practice",
    description: "Practice real questions, get instant feedback, and improve your English speaking fluency faster.",
    cta: "Start Speaking Now",
    free: "Free • No signup required",
    learners: "Used by 1,000+ learners",
    demo: "Quick demo",
    userPrompt: 'User: "Describe your hometown"',
    estimatedScore: "Estimated IELTS speaking score",
    aiFeedback: "AI feedback",
    aiFeedbackText: "Add a specific example to improve clarity.",
    fluency: "Fluency",
    pronunciation: "Pronunciation",
    structure: "Structure",
    reasonsEyebrow: "Score improvement",
    reasonsTitle: "Why learners use SpeakAce",
    reasonCards: [
      {
        title: "Practice real IELTS tasks",
        description: "Timed tasks feel closer to the exam, so your progress stays connected to the test you actually want to pass."
      },
      {
        title: "See what keeps your band score low",
        description: "Instead of vague praise, you can spot weak fluency, pronunciation, structure, and idea support."
      },
      {
        title: "Turn every retry into a stronger answer",
        description: "Score signals, grammar fixes, and a better sample answer make the next attempt more useful."
      }
    ],
    fluencyEyebrow: "Fluency",
    fluencyTitle: "Improve your English speaking fluency",
    fluencyP1: "SpeakAce makes IELTS speaking practice online feel more structured. You do not just record an answer and move on. You also see how your answer is built, where fluency drops, and whether your example really supports your point.",
    fluencyP2: "Fluency improves when speaking becomes clearer, steadier, and more controlled under pressure. That is why SpeakAce is built as a score improvement system rather than a generic AI tool.",
    tasksEyebrow: "Real tasks",
    tasksTitle: "Practice real IELTS questions",
    tasksP1: "Many learners prepare with random prompts and never get close to the rhythm of the real test. SpeakAce helps you practice question types that feel closer to actual exam expectations.",
    tasksP2: "If you want a faster starting point, you can open the free test, browse IELTS speaking topics, or read practical study guides before your first session.",
    freeTest: "Open the free IELTS speaking test",
    topicHub: "Browse IELTS speaking topics",
    blog: "Read study guides on the blog",
    instantEyebrow: "Instant insight",
    instantTitle: "Get instant feedback",
    instantP1: "SpeakAce does more than show a transcript. It shows why an answer feels weak and what should change next.",
    instantP2: "That means the first free session already creates real value: answer once, see a score, fix one weakness, and retry with more confidence.",
    firstStepEyebrow: "First step",
    firstStepTitle: "Take your first speaking test in 30 seconds",
    firstStepText: "Make the first action obvious: speak, see your score, then unlock deeper feedback if you want more.",
    scoreTitle: "See the score first, unlock full feedback later",
    scoreText: "SpeakAce shows value before upgrade pressure: take one attempt, see your score, then move to Plus for full feedback and more retries.",
    unlock: "Unlock full feedback",
    faqTitle: "Frequently asked questions",
    faq: [
      {
        question: "Is SpeakAce an official IELTS scoring service?",
        answer: "No. SpeakAce is an AI-powered IELTS and TOEFL speaking practice platform that gives estimated scores and feedback for preparation."
      },
      {
        question: "Can daily AI practice improve IELTS speaking?",
        answer: "Yes. Daily speaking practice with transcript review and retry sessions can improve fluency, confidence, and answer structure."
      },
      {
        question: "Who is SpeakAce for?",
        answer: "SpeakAce is built for IELTS students, TOEFL students, teachers, and language schools that want stronger speaking practice."
      }
    ]
  },
  tr: {
    title: "Yapay zekayla IELTS speaking skorunu yükselt",
    description: "Gerçek sorularla çalış, anında geri bildirim al ve İngilizce konuşma akıcılığını daha hızlı geliştir.",
    cta: "Konuşmaya başla",
    free: "Ücretsiz • Kayıt olmadan kullanılabilir",
    learners: "1.000+ öğrenci tarafından kullanılıyor",
    demo: "Hızlı demo",
    userPrompt: 'Kullanıcı: "Doğduğun yeri anlat"',
    estimatedScore: "Tahmini IELTS speaking skoru",
    aiFeedback: "Yapay zeka geri bildirimi",
    aiFeedbackText: "Netliği artırmak için tek bir somut örnek ekle.",
    fluency: "Akıcılık",
    pronunciation: "Telaffuz",
    structure: "Yapı",
    reasonsEyebrow: "Skor artışı",
    reasonsTitle: "Öğrenciler neden SpeakAce kullanıyor",
    reasonCards: [
      { title: "Gerçek IELTS görevleriyle çalış", description: "Süreli görevler pratiği gerçek sınava daha yakın hale getirir." },
      { title: "Band skorunu neyin düşürdüğünü gör", description: "Akıcılık, telaffuz, yapı ve fikir desteğindeki zayıf noktaları fark et." },
      { title: "Her tekrarı daha güçlü cevaba çevir", description: "Skor sinyalleri ve düzeltmeler bir sonraki denemeyi daha faydalı kılar." }
    ],
    fluencyEyebrow: "Akıcılık",
    fluencyTitle: "İngilizce konuşma akıcılığını geliştir",
    fluencyP1: "SpeakAce, IELTS speaking pratiğini daha düzenli hissettirmek için kuruldu. Sadece kayıt almaz; cevabının nasıl kurulduğunu ve nerede dağıldığını da gösterir.",
    fluencyP2: "Akıcılık sadece daha fazla konuşmakla değil, daha net ve daha dengeli konuşmakla gelişir. Bu yüzden SpeakAce genel bir araç değil, skor geliştirme sistemi olarak tasarlandı.",
    tasksEyebrow: "Gerçek görevler",
    tasksTitle: "Gerçek IELTS sorularıyla pratik yap",
    tasksP1: "Rastgele sorular yerine gerçek sınav beklentisine daha yakın görevlerle çalışarak daha sınav-hazır cevaplar kurarsın.",
    tasksP2: "Hızlı bir giriş istiyorsan ücretsiz testi açabilir, konu sayfalarına geçebilir veya blog rehberlerini okuyabilirsin.",
    freeTest: "Ücretsiz IELTS speaking testini aç",
    topicHub: "IELTS speaking konularını gör",
    blog: "Blog rehberlerini oku",
    instantEyebrow: "Anında içgörü",
    instantTitle: "Anında geri bildirim al",
    instantP1: "SpeakAce sadece transcript vermez; cevabın neden zayıf göründüğünü ve bir sonraki denemede neyi düzeltmen gerektiğini gösterir.",
    instantP2: "Bu yüzden ilk ücretsiz deneme bile gerçek değer üretir: konuş, skorunu gör, bir zayıflığı düzelt ve daha güçlü tekrar dene.",
    firstStepEyebrow: "İlk adım",
    firstStepTitle: "İlk speaking denemeni 30 saniyede başlat",
    firstStepText: "İlk hareket net olsun: konuş, skorunu gör, sonra istersen daha derin geri bildirimi aç.",
    scoreTitle: "Önce skoru gör, sonra tam geri bildirimi aç",
    scoreText: "SpeakAce değeri önce gösterir: bir deneme yap, skorunu gör, sonra tam analiz ve daha fazla tekrar için Plus’a geç.",
    unlock: "Tam geri bildirimi aç",
    faqTitle: "Sık sorulan sorular",
    faq: [
      { question: "SpeakAce resmi IELTS puanlama servisi mi?", answer: "Hayır. SpeakAce, hazırlık için tahmini skor ve geri bildirim sunan bir IELTS ve TOEFL speaking çalışma platformudur." },
      { question: "Günlük AI pratiği IELTS speaking’i geliştirir mi?", answer: "Evet. Transcript incelemesi ve tekrar denemeleri akıcılığı, özgüveni ve cevap yapısını geliştirebilir." },
      { question: "SpeakAce kimler için uygun?", answer: "SpeakAce, IELTS ve TOEFL öğrencileri, öğretmenler ve dil okulları için tasarlanmıştır." }
    ]
  },
  de: {
    title: "Steigere deinen IELTS-Speaking-Score mit KI-Training",
    description: "Übe echte Fragen, erhalte sofortiges Feedback und verbessere deine Sprechflüssigkeit schneller.",
    cta: "Jetzt sprechen",
    free: "Kostenlos • Keine Registrierung nötig",
    learners: "Von über 1.000 Lernenden genutzt",
    demo: "Schnelldemo",
    userPrompt: 'Nutzer: „Beschreibe deine Heimatstadt“',
    estimatedScore: "Geschätzter IELTS-Speaking-Score",
    aiFeedback: "KI-Feedback",
    aiFeedbackText: "Füge ein konkretes Beispiel hinzu, um klarer zu klingen.",
    fluency: "Flüssigkeit",
    pronunciation: "Aussprache",
    structure: "Struktur",
    reasonsEyebrow: "Score-Wachstum",
    reasonsTitle: "Warum Lernende SpeakAce nutzen",
    reasonCards: [
      { title: "Mit echten IELTS-Aufgaben üben", description: "Zeitgesteuerte Aufgaben fühlen sich näher an der Prüfung an." },
      { title: "Sehen, was den Band-Score bremst", description: "Erkenne Schwächen bei Flüssigkeit, Aussprache und Struktur." },
      { title: "Jeden Retry stärker machen", description: "Score-Signale und Korrekturen machen den nächsten Versuch nützlicher." }
    ],
    fluencyEyebrow: "Flüssigkeit",
    fluencyTitle: "Verbessere deine englische Sprechflüssigkeit",
    fluencyP1: "SpeakAce macht IELTS-Speaking-Training strukturierter. Du nimmst nicht nur auf, sondern siehst auch, wie deine Antwort aufgebaut ist.",
    fluencyP2: "Flüssigkeit wächst durch klareres und kontrollierteres Sprechen. Darum ist SpeakAce ein System für Score-Verbesserung statt nur ein Tool.",
    tasksEyebrow: "Echte Aufgaben",
    tasksTitle: "Übe mit echten IELTS-Fragen",
    tasksP1: "Statt zufälliger Prompts trainierst du mit Formaten, die näher an echten Prüfungsfragen liegen.",
    tasksP2: "Wenn du schneller starten willst, öffne den Gratis-Test, die Themen-Seiten oder die Leitfäden im Blog.",
    freeTest: "Gratis-IELTS-Test öffnen",
    topicHub: "IELTS-Themen ansehen",
    blog: "Leitfäden im Blog lesen",
    instantEyebrow: "Sofortige Einsicht",
    instantTitle: "Sofort Feedback erhalten",
    instantP1: "SpeakAce zeigt nicht nur ein Transcript, sondern warum eine Antwort schwach wirkt und was du als Nächstes verbessern solltest.",
    instantP2: "So schafft schon die erste kostenlose Sitzung echten Wert: sprechen, Score sehen, eine Schwäche korrigieren und besser wiederholen.",
    firstStepEyebrow: "Erster Schritt",
    firstStepTitle: "Starte deinen ersten Speaking-Test in 30 Sekunden",
    firstStepText: "Die erste Aktion soll klar sein: sprechen, Score sehen und danach bei Bedarf mehr Feedback freischalten.",
    scoreTitle: "Zuerst den Score sehen, dann volles Feedback freischalten",
    scoreText: "SpeakAce zeigt den Wert zuerst: ein Versuch, ein Score und danach volles Feedback mit Plus.",
    unlock: "Volles Feedback freischalten",
    faqTitle: "Häufige Fragen",
    faq: [
      { question: "Ist SpeakAce ein offizieller IELTS-Bewertungsdienst?", answer: "Nein. SpeakAce bietet geschätzte Scores und Feedback zur Vorbereitung." },
      { question: "Hilft tägliches KI-Training beim IELTS Speaking?", answer: "Ja. Tägliche Übung mit Transcript-Review und Wiederholungen verbessert Struktur und Flüssigkeit." },
      { question: "Für wen ist SpeakAce gedacht?", answer: "Für IELTS- und TOEFL-Lernende, Lehrkräfte und Sprachschulen." }
    ]
  },
  es: {
    title: "Mejora tu puntuación de IELTS Speaking con práctica con IA",
    description: "Practica preguntas reales, recibe feedback instantáneo y mejora tu fluidez en inglés más rápido.",
    cta: "Empieza a hablar ahora",
    free: "Gratis • Sin registro",
    learners: "Usado por más de 1.000 estudiantes",
    demo: "Demo rápida",
    userPrompt: 'Usuario: "Describe tu ciudad natal"',
    estimatedScore: "Puntuación estimada de IELTS speaking",
    aiFeedback: "Feedback de IA",
    aiFeedbackText: "Añade un ejemplo concreto para mejorar la claridad.",
    fluency: "Fluidez",
    pronunciation: "Pronunciación",
    structure: "Estructura",
    reasonsEyebrow: "Mejora de puntuación",
    reasonsTitle: "Por qué los estudiantes usan SpeakAce",
    reasonCards: [
      { title: "Practica tareas reales de IELTS", description: "Las tareas cronometradas se sienten más cercanas al examen real." },
      { title: "Detecta qué baja tu banda", description: "Observa debilidades de fluidez, pronunciación y estructura." },
      { title: "Convierte cada intento en una respuesta mejor", description: "Las señales de puntuación y las correcciones hacen más útil el siguiente intento." }
    ],
    fluencyEyebrow: "Fluidez",
    fluencyTitle: "Mejora tu fluidez en inglés",
    fluencyP1: "SpeakAce hace que la práctica online de IELTS speaking sea más estructurada. No solo grabas una respuesta: también ves cómo está construida y dónde pierde claridad.",
    fluencyP2: "La fluidez mejora cuando hablas con más claridad y control bajo presión. Por eso SpeakAce funciona como un sistema de mejora de puntuación y no como una simple herramienta.",
    tasksEyebrow: "Tareas reales",
    tasksTitle: "Practica preguntas reales de IELTS",
    tasksP1: "En lugar de prompts aleatorios, trabajas con formatos que se parecen más a las expectativas del examen.",
    tasksP2: "Si quieres empezar rápido, abre la prueba gratuita, explora los temas de IELTS o lee las guías del blog.",
    freeTest: "Abrir prueba gratuita de IELTS",
    topicHub: "Ver temas de IELTS",
    blog: "Leer guías en el blog",
    instantEyebrow: "Visión inmediata",
    instantTitle: "Recibe feedback al instante",
    instantP1: "SpeakAce no solo muestra un transcript: muestra por qué una respuesta parece débil y qué deberías cambiar después.",
    instantP2: "Así, incluso la primera sesión gratuita ya crea valor real: hablas, ves tu puntuación, corriges una debilidad y lo intentas de nuevo.",
    firstStepEyebrow: "Primer paso",
    firstStepTitle: "Haz tu primera prueba oral en 30 segundos",
    firstStepText: "La primera acción debe ser clara: hablar, ver tu puntuación y luego desbloquear más feedback si lo necesitas.",
    scoreTitle: "Primero ve tu puntuación, después desbloquea el feedback completo",
    scoreText: "SpeakAce muestra valor antes de presionar con el upgrade: prueba una vez, mira tu puntuación y luego pasa a Plus para análisis completo.",
    unlock: "Desbloquear feedback completo",
    faqTitle: "Preguntas frecuentes",
    faq: [
      { question: "¿SpeakAce es un servicio oficial de puntuación IELTS?", answer: "No. SpeakAce ofrece puntuaciones estimadas y feedback para preparación." },
      { question: "¿La práctica diaria con IA mejora IELTS speaking?", answer: "Sí. La práctica diaria con revisión de transcript e intentos repetidos mejora la fluidez y la estructura." },
      { question: "¿Para quién está pensado SpeakAce?", answer: "Para estudiantes de IELTS y TOEFL, profesores y escuelas de idiomas." }
    ]
  },
  fr: {
    title: "Augmentez votre score IELTS Speaking avec la pratique IA",
    description: "Travaillez de vraies questions, recevez un retour immédiat et améliorez plus vite votre fluidité en anglais.",
    cta: "Commencer à parler",
    free: "Gratuit • Sans inscription",
    learners: "Utilisé par plus de 1 000 apprenants",
    demo: "Démo rapide",
    userPrompt: 'Utilisateur : « Décrivez votre ville natale »',
    estimatedScore: "Score IELTS speaking estimé",
    aiFeedback: "Retour IA",
    aiFeedbackText: "Ajoutez un exemple concret pour améliorer la clarté.",
    fluency: "Fluidité",
    pronunciation: "Prononciation",
    structure: "Structure",
    reasonsEyebrow: "Progression du score",
    reasonsTitle: "Pourquoi les apprenants utilisent SpeakAce",
    reasonCards: [
      { title: "Travaillez de vraies tâches IELTS", description: "Les tâches chronométrées ressemblent davantage à l’examen réel." },
      { title: "Repérez ce qui bloque votre score", description: "Repérez les faiblesses de fluidité, de prononciation et de structure." },
      { title: "Transformez chaque nouvelle tentative en meilleure réponse", description: "Les signaux de score et les corrections rendent l’essai suivant plus utile." }
    ],
    fluencyEyebrow: "Fluidité",
    fluencyTitle: "Améliorez votre fluidité en anglais",
    fluencyP1: "SpeakAce rend la pratique IELTS speaking en ligne plus structurée. Vous n’enregistrez pas seulement une réponse : vous voyez aussi comment elle est construite et où elle se fragilise.",
    fluencyP2: "La fluidité progresse quand la parole devient plus claire et plus stable sous pression. C’est pourquoi SpeakAce est pensé comme un système d’amélioration du score.",
    tasksEyebrow: "Vraies tâches",
    tasksTitle: "Travaillez de vraies questions IELTS",
    tasksP1: "Au lieu de prompts aléatoires, vous pratiquez des formats plus proches des attentes de l’examen.",
    tasksP2: "Pour démarrer plus vite, ouvrez le test gratuit, parcourez les thèmes IELTS ou lisez les guides du blog.",
    freeTest: "Ouvrir le test IELTS gratuit",
    topicHub: "Voir les thèmes IELTS",
    blog: "Lire les guides du blog",
    instantEyebrow: "Retour immédiat",
    instantTitle: "Obtenez un feedback instantané",
    instantP1: "SpeakAce ne montre pas seulement un transcript : il explique pourquoi une réponse semble faible et quoi changer ensuite.",
    instantP2: "Ainsi, même la première session gratuite crée une vraie valeur : parler, voir son score, corriger une faiblesse et réessayer.",
    firstStepEyebrow: "Première étape",
    firstStepTitle: "Lancez votre premier test oral en 30 secondes",
    firstStepText: "La première action doit être évidente : parler, voir son score, puis débloquer plus de feedback si besoin.",
    scoreTitle: "Voyez d’abord le score, débloquez le feedback complet ensuite",
    scoreText: "SpeakAce montre la valeur avant la pression du passage payant : faites une tentative, voyez votre score, puis passez à Plus.",
    unlock: "Débloquer le feedback complet",
    faqTitle: "Questions fréquentes",
    faq: [
      { question: "SpeakAce est-il un service officiel de notation IELTS ?", answer: "Non. SpeakAce fournit des scores estimés et des retours pour la préparation." },
      { question: "La pratique quotidienne avec IA aide-t-elle en IELTS speaking ?", answer: "Oui. La pratique quotidienne avec transcript et nouvelles tentatives améliore la fluidité et la structure." },
      { question: "Pour qui SpeakAce est-il conçu ?", answer: "Pour les apprenants IELTS et TOEFL, les enseignants et les écoles de langues." }
    ]
  },
  it: {
    title: "Aumenta il tuo punteggio IELTS Speaking con la pratica IA",
    description: "Fai pratica con domande reali, ricevi feedback immediato e migliora più velocemente la tua fluidità in inglese.",
    cta: "Inizia a parlare",
    free: "Gratis • Nessuna registrazione",
    learners: "Usato da oltre 1.000 studenti",
    demo: "Demo rapida",
    userPrompt: 'Utente: "Descrivi la tua città natale"',
    estimatedScore: "Punteggio IELTS speaking stimato",
    aiFeedback: "Feedback IA",
    aiFeedbackText: "Aggiungi un esempio concreto per migliorare la chiarezza.",
    fluency: "Fluidità",
    pronunciation: "Pronuncia",
    structure: "Struttura",
    reasonsEyebrow: "Crescita del punteggio",
    reasonsTitle: "Perché gli studenti usano SpeakAce",
    reasonCards: [
      { title: "Pratica attività IELTS reali", description: "Le attività a tempo sono più vicine all’esame vero." },
      { title: "Vedi cosa abbassa il tuo punteggio", description: "Individua debolezze di fluidità, pronuncia e struttura." },
      { title: "Rendi ogni retry più forte", description: "Segnali di punteggio e correzioni rendono il tentativo successivo più utile." }
    ],
    fluencyEyebrow: "Fluidità",
    fluencyTitle: "Migliora la tua fluidità in inglese",
    fluencyP1: "SpeakAce rende la pratica IELTS speaking online più strutturata. Non registri soltanto una risposta: vedi anche come è costruita e dove perde forza.",
    fluencyP2: "La fluidità cresce quando il parlato diventa più chiaro e più controllato sotto pressione. Per questo SpeakAce è un sistema di miglioramento del punteggio.",
    tasksEyebrow: "Attività reali",
    tasksTitle: "Pratica domande IELTS reali",
    tasksP1: "Invece di prompt casuali, lavori con formati più vicini alle vere aspettative dell’esame.",
    tasksP2: "Per iniziare più velocemente puoi aprire il test gratuito, esplorare i topic IELTS o leggere le guide del blog.",
    freeTest: "Apri il test IELTS gratuito",
    topicHub: "Vedi i topic IELTS",
    blog: "Leggi le guide nel blog",
    instantEyebrow: "Insight immediato",
    instantTitle: "Ricevi feedback immediato",
    instantP1: "SpeakAce non mostra solo un transcript: spiega perché una risposta sembra debole e cosa cambiare dopo.",
    instantP2: "Così anche la prima sessione gratuita crea valore reale: parli, vedi il punteggio, correggi una debolezza e riprovi.",
    firstStepEyebrow: "Primo passo",
    firstStepTitle: "Fai il tuo primo test orale in 30 secondi",
    firstStepText: "La prima azione deve essere chiara: parla, guarda il punteggio e poi sblocca più feedback se vuoi.",
    scoreTitle: "Prima vedi il punteggio, poi sblocca il feedback completo",
    scoreText: "SpeakAce mostra valore prima della spinta all’upgrade: un tentativo, il punteggio e poi Plus per l’analisi completa.",
    unlock: "Sblocca feedback completo",
    faqTitle: "Domande frequenti",
    faq: [
      { question: "SpeakAce è un servizio ufficiale di valutazione IELTS?", answer: "No. SpeakAce offre punteggi stimati e feedback per la preparazione." },
      { question: "La pratica quotidiana con IA aiuta IELTS speaking?", answer: "Sì. La pratica quotidiana con transcript e retry migliora fluidità e struttura." },
      { question: "Per chi è pensato SpeakAce?", answer: "Per studenti IELTS e TOEFL, docenti e scuole di lingua." }
    ]
  },
  pt: {
    title: "Aumente sua pontuação no IELTS Speaking com prática por IA",
    description: "Pratique perguntas reais, receba feedback instantâneo e melhore sua fluência em inglês mais rápido.",
    cta: "Comece a falar",
    free: "Grátis • Sem cadastro",
    learners: "Usado por mais de 1.000 alunos",
    demo: "Demo rápida",
    userPrompt: 'Usuário: "Descreva sua cidade natal"',
    estimatedScore: "Pontuação estimada de IELTS speaking",
    aiFeedback: "Feedback de IA",
    aiFeedbackText: "Adicione um exemplo específico para melhorar a clareza.",
    fluency: "Fluência",
    pronunciation: "Pronúncia",
    structure: "Estrutura",
    reasonsEyebrow: "Melhora de pontuação",
    reasonsTitle: "Por que os alunos usam SpeakAce",
    reasonCards: [
      { title: "Pratique tarefas reais de IELTS", description: "As tarefas com tempo parecem mais próximas do exame real." },
      { title: "Veja o que está segurando sua banda", description: "Perceba fraquezas de fluência, pronúncia e estrutura." },
      { title: "Transforme cada nova tentativa em uma resposta melhor", description: "Os sinais de pontuação e as correções tornam a próxima tentativa mais útil." }
    ],
    fluencyEyebrow: "Fluência",
    fluencyTitle: "Melhore sua fluência em inglês",
    fluencyP1: "O SpeakAce torna a prática online de IELTS speaking mais estruturada. Você não apenas grava uma resposta: também vê como ela foi construída e onde perde força.",
    fluencyP2: "A fluência melhora quando a fala fica mais clara e estável sob pressão. Por isso o SpeakAce é um sistema de melhoria de pontuação.",
    tasksEyebrow: "Tarefas reais",
    tasksTitle: "Pratique perguntas reais de IELTS",
    tasksP1: "Em vez de prompts aleatórios, você pratica formatos mais próximos das expectativas reais do exame.",
    tasksP2: "Se quiser começar mais rápido, abra o teste grátis, explore os tópicos de IELTS ou leia os guias no blog.",
    freeTest: "Abrir teste grátis de IELTS",
    topicHub: "Ver tópicos de IELTS",
    blog: "Ler guias no blog",
    instantEyebrow: "Insight imediato",
    instantTitle: "Receba feedback instantâneo",
    instantP1: "O SpeakAce não mostra só um transcript: ele explica por que uma resposta parece fraca e o que deve mudar depois.",
    instantP2: "Assim, até a primeira sessão gratuita já gera valor real: fale, veja sua pontuação, corrija um ponto fraco e tente de novo.",
    firstStepEyebrow: "Primeiro passo",
    firstStepTitle: "Faça seu primeiro teste oral em 30 segundos",
    firstStepText: "A primeira ação deve ser clara: falar, ver a pontuação e depois desbloquear mais feedback se quiser.",
    scoreTitle: "Veja a pontuação primeiro, desbloqueie o feedback completo depois",
    scoreText: "O SpeakAce mostra valor antes da pressão do upgrade: faça uma tentativa, veja sua pontuação e então migre para o Plus.",
    unlock: "Desbloquear feedback completo",
    faqTitle: "Perguntas frequentes",
    faq: [
      { question: "O SpeakAce é um serviço oficial de pontuação IELTS?", answer: "Não. O SpeakAce fornece pontuações estimadas e feedback para preparação." },
      { question: "A prática diária com IA ajuda no IELTS speaking?", answer: "Sim. A prática diária com transcript e novas tentativas melhora a fluência e a estrutura." },
      { question: "Para quem o SpeakAce foi criado?", answer: "Para alunos de IELTS e TOEFL, professores e escolas de idiomas." }
    ]
  },
  nl: {
    title: "Verhoog je IELTS Speaking-score met AI-oefening",
    description: "Oefen met echte vragen, krijg direct feedback en verbeter je Engelse spreekvloeiendheid sneller.",
    cta: "Begin nu met spreken",
    free: "Gratis • Geen registratie nodig",
    learners: "Gebruikt door 1.000+ leerlingen",
    demo: "Snelle demo",
    userPrompt: 'Gebruiker: "Beschrijf je woonplaats"',
    estimatedScore: "Geschatte IELTS-speaking-score",
    aiFeedback: "AI-feedback",
    aiFeedbackText: "Voeg een concreet voorbeeld toe om duidelijker te worden.",
    fluency: "Vloeiendheid",
    pronunciation: "Uitspraak",
    structure: "Structuur",
    reasonsEyebrow: "Scoreverbetering",
    reasonsTitle: "Waarom leerlingen SpeakAce gebruiken",
    reasonCards: [
      { title: "Oefen met echte IELTS-taken", description: "Taken met tijdslimiet voelen dichter bij het echte examen." },
      { title: "Zie wat je bandscore laag houdt", description: "Zie zwakke punten in vloeiendheid, uitspraak en structuur." },
      { title: "Maak elke retry sterker", description: "Scoresignalen en correcties maken de volgende poging nuttiger." }
    ],
    fluencyEyebrow: "Vloeiendheid",
    fluencyTitle: "Verbeter je Engelse spreekvloeiendheid",
    fluencyP1: "SpeakAce maakt online IELTS-speaking-oefening gestructureerder. Je neemt niet alleen een antwoord op, je ziet ook hoe het is opgebouwd en waar het zwakker wordt.",
    fluencyP2: "Vloeiendheid groeit wanneer spreken duidelijker en stabieler wordt onder druk. Daarom is SpeakAce een scoreverbeteringssysteem in plaats van alleen een tool.",
    tasksEyebrow: "Echte taken",
    tasksTitle: "Oefen met echte IELTS-vragen",
    tasksP1: "In plaats van willekeurige prompts oefen je met formats die dichter bij echte examenvragen liggen.",
    tasksP2: "Wil je sneller beginnen, open dan de gratis test, bekijk de IELTS-onderwerpen of lees de bloggidsen.",
    freeTest: "Open de gratis IELTS-test",
    topicHub: "Bekijk IELTS-onderwerpen",
    blog: "Lees gidsen op de blog",
    instantEyebrow: "Direct inzicht",
    instantTitle: "Krijg direct feedback",
    instantP1: "SpeakAce laat niet alleen een transcript zien, maar ook waarom een antwoord zwak voelt en wat je hierna moet aanpassen.",
    instantP2: "Zo levert zelfs de eerste gratis sessie al echte waarde op: spreek, zie je score, verbeter één zwak punt en probeer opnieuw.",
    firstStepEyebrow: "Eerste stap",
    firstStepTitle: "Doe je eerste spreektest in 30 seconden",
    firstStepText: "De eerste actie moet duidelijk zijn: spreken, je score zien en daarna meer feedback ontgrendelen als je wilt.",
    scoreTitle: "Zie eerst je score, ontgrendel later volledige feedback",
    scoreText: "SpeakAce laat eerst de waarde zien: één poging, je score en daarna Plus voor volledige analyse.",
    unlock: "Ontgrendel volledige feedback",
    faqTitle: "Veelgestelde vragen",
    faq: [
      { question: "Is SpeakAce een officiële IELTS-beoordelingsdienst?", answer: "Nee. SpeakAce geeft geschatte scores en feedback voor voorbereiding." },
      { question: "Helpt dagelijkse AI-oefening bij IELTS speaking?", answer: "Ja. Dagelijkse oefening met transcriptreview en retries verbetert vloeiendheid en structuur." },
      { question: "Voor wie is SpeakAce bedoeld?", answer: "Voor IELTS- en TOEFL-leerlingen, docenten en taalscholen." }
    ]
  },
  pl: {
    title: "Podnieś wynik IELTS Speaking dzięki ćwiczeniom z AI",
    description: "Ćwicz na prawdziwych pytaniach, otrzymuj natychmiastowy feedback i szybciej poprawiaj płynność mówienia po angielsku.",
    cta: "Zacznij mówić teraz",
    free: "Za darmo • Bez rejestracji",
    learners: "Używane przez ponad 1000 uczniów",
    demo: "Szybkie demo",
    userPrompt: 'Użytkownik: „Opisz swoje rodzinne miasto”',
    estimatedScore: "Szacowany wynik IELTS speaking",
    aiFeedback: "Feedback AI",
    aiFeedbackText: "Dodaj konkretny przykład, aby zwiększyć klarowność.",
    fluency: "Płynność",
    pronunciation: "Wymowa",
    structure: "Struktura",
    reasonsEyebrow: "Poprawa wyniku",
    reasonsTitle: "Dlaczego uczniowie używają SpeakAce",
    reasonCards: [
      { title: "Ćwicz prawdziwe zadania IELTS", description: "Zadania z limitem czasu są bliższe prawdziwemu egzaminowi." },
      { title: "Zobacz, co obniża twój wynik", description: "Zauważ słabe strony płynności, wymowy i struktury." },
      { title: "Zamień każdą kolejną próbę w lepszą odpowiedź", description: "Sygnały punktacji i poprawki czynią kolejną próbę bardziej użyteczną." }
    ],
    fluencyEyebrow: "Płynność",
    fluencyTitle: "Popraw płynność mówienia po angielsku",
    fluencyP1: "SpeakAce sprawia, że ćwiczenie IELTS speaking online jest bardziej uporządkowane. Nie tylko nagrywasz odpowiedź, ale widzisz też, jak została zbudowana i gdzie się załamuje.",
    fluencyP2: "Płynność rośnie, gdy mówienie staje się wyraźniejsze i stabilniejsze pod presją. Dlatego SpeakAce to system poprawy wyniku, a nie tylko narzędzie.",
    tasksEyebrow: "Prawdziwe zadania",
    tasksTitle: "Ćwicz prawdziwe pytania IELTS",
    tasksP1: "Zamiast losowych promptów pracujesz na formatach bliższych realnym oczekiwaniom egzaminu.",
    tasksP2: "Jeśli chcesz zacząć szybciej, otwórz darmowy test, przejrzyj tematy IELTS lub przeczytaj poradniki na blogu.",
    freeTest: "Otwórz darmowy test IELTS",
    topicHub: "Zobacz tematy IELTS",
    blog: "Czytaj poradniki na blogu",
    instantEyebrow: "Natychmiastowy wgląd",
    instantTitle: "Otrzymaj natychmiastowy feedback",
    instantP1: "SpeakAce nie pokazuje tylko transcriptu, ale wyjaśnia też, dlaczego odpowiedź brzmi słabo i co poprawić dalej.",
    instantP2: "Dzięki temu nawet pierwsza darmowa sesja daje realną wartość: mówisz, widzisz wynik, poprawiasz jedną słabość i próbujesz ponownie.",
    firstStepEyebrow: "Pierwszy krok",
    firstStepTitle: "Zrób pierwszy test mówienia w 30 sekund",
    firstStepText: "Pierwsze działanie powinno być proste: mówisz, widzisz wynik, a potem odblokowujesz więcej feedbacku, jeśli chcesz.",
    scoreTitle: "Najpierw zobacz wynik, potem odblokuj pełny feedback",
    scoreText: "SpeakAce pokazuje wartość przed presją upgrade’u: jedna próba, wynik, a potem Plus dla pełnej analizy.",
    unlock: "Odblokuj pełny feedback",
    faqTitle: "Najczęstsze pytania",
    faq: [
      { question: "Czy SpeakAce to oficjalna usługa oceniania IELTS?", answer: "Nie. SpeakAce daje szacowane wyniki i feedback do przygotowania." },
      { question: "Czy codzienna praktyka z AI pomaga w IELTS speaking?", answer: "Tak. Codzienna praktyka z transcript review i ponownymi próbami poprawia płynność i strukturę." },
      { question: "Dla kogo jest SpeakAce?", answer: "Dla uczniów IELTS i TOEFL, nauczycieli oraz szkół językowych." }
    ]
  },
  ru: {
    title: "Повышайте балл IELTS Speaking с практикой на ИИ",
    description: "Практикуйтесь на реальных вопросах, получайте мгновенную обратную связь и быстрее улучшайте беглость английской речи.",
    cta: "Начать говорить",
    free: "Бесплатно • Без регистрации",
    learners: "Используют более 1000 учеников",
    demo: "Быстрая демо-версия",
    userPrompt: 'Пользователь: «Опишите свой родной город»',
    estimatedScore: "Примерный балл IELTS speaking",
    aiFeedback: "Обратная связь ИИ",
    aiFeedbackText: "Добавьте конкретный пример, чтобы сделать ответ яснее.",
    fluency: "Беглость",
    pronunciation: "Произношение",
    structure: "Структура",
    reasonsEyebrow: "Рост балла",
    reasonsTitle: "Почему ученики выбирают SpeakAce",
    reasonCards: [
      { title: "Практика на реальных заданиях IELTS", description: "Задания с таймером ближе к настоящему экзамену." },
      { title: "Поймите, что тянет балл вниз", description: "Замечайте слабые места в беглости, произношении и структуре." },
      { title: "Делайте каждую новую попытку сильнее", description: "Сигналы балла и исправления делают следующую попытку полезнее." }
    ],
    fluencyEyebrow: "Беглость",
    fluencyTitle: "Улучшайте беглость английской речи",
    fluencyP1: "SpeakAce делает онлайн-практику IELTS speaking более структурированной. Вы не просто записываете ответ, но и видите, как он построен и где теряет силу.",
    fluencyP2: "Беглость растет, когда речь становится более ясной и устойчивой под давлением. Поэтому SpeakAce — это система улучшения балла, а не просто инструмент.",
    tasksEyebrow: "Реальные задания",
    tasksTitle: "Практикуйте реальные вопросы IELTS",
    tasksP1: "Вместо случайных подсказок вы тренируетесь на форматах, которые ближе к настоящим ожиданиям экзамена.",
    tasksP2: "Чтобы начать быстрее, откройте бесплатный тест, просмотрите темы IELTS или прочитайте гайды в блоге.",
    freeTest: "Открыть бесплатный тест IELTS",
    topicHub: "Смотреть темы IELTS",
    blog: "Читать гайды в блоге",
    instantEyebrow: "Мгновенное понимание",
    instantTitle: "Получайте мгновенную обратную связь",
    instantP1: "SpeakAce показывает не только transcript, но и объясняет, почему ответ кажется слабым и что нужно изменить дальше.",
    instantP2: "Поэтому даже первая бесплатная сессия уже дает реальную ценность: говорите, видите балл, исправляете слабость и пробуете снова.",
    firstStepEyebrow: "Первый шаг",
    firstStepTitle: "Запустите первый speaking-тест за 30 секунд",
    firstStepText: "Первое действие должно быть очевидным: сказать ответ, увидеть балл, а затем при желании открыть полный разбор.",
    scoreTitle: "Сначала увидьте балл, затем откройте полный разбор",
    scoreText: "SpeakAce сначала показывает ценность: одна попытка, балл и затем Plus для полного анализа.",
    unlock: "Открыть полный разбор",
    faqTitle: "Частые вопросы",
    faq: [
      { question: "SpeakAce — это официальный сервис оценки IELTS?", answer: "Нет. SpeakAce дает примерные баллы и обратную связь для подготовки." },
      { question: "Помогает ли ежедневная практика с ИИ в IELTS speaking?", answer: "Да. Ежедневная практика с разбором transcript и повторными попытками улучшает беглость и структуру." },
      { question: "Для кого создан SpeakAce?", answer: "Для студентов IELTS и TOEFL, преподавателей и языковых школ." }
    ]
  },
  ar: {
    title: "ارفع درجة IELTS Speaking بالتدريب بالذكاء الاصطناعي",
    description: "تدرّب على أسئلة حقيقية، واحصل على ملاحظات فورية، وطوّر طلاقتك في التحدث بالإنجليزية بشكل أسرع.",
    cta: "ابدأ التحدث الآن",
    free: "مجانًا • بدون تسجيل",
    learners: "يستخدمه أكثر من 1000 متعلم",
    demo: "عرض سريع",
    userPrompt: 'المستخدم: "صف مدينتك الأصلية"',
    estimatedScore: "درجة IELTS speaking التقديرية",
    aiFeedback: "ملاحظات الذكاء الاصطناعي",
    aiFeedbackText: "أضف مثالًا محددًا لتحسين الوضوح.",
    fluency: "الطلاقة",
    pronunciation: "النطق",
    structure: "البنية",
    reasonsEyebrow: "تحسين الدرجة",
    reasonsTitle: "لماذا يستخدم المتعلمون SpeakAce",
    reasonCards: [
      { title: "تدرّب على مهام IELTS حقيقية", description: "المهام المحددة بالوقت أقرب إلى الاختبار الفعلي." },
      { title: "اعرف ما الذي يخفض درجتك", description: "اكتشف نقاط الضعف في الطلاقة والنطق والبنية." },
      { title: "حوّل كل إعادة محاولة إلى إجابة أقوى", description: "إشارات الدرجة والتصحيحات تجعل المحاولة التالية أكثر فائدة." }
    ],
    fluencyEyebrow: "الطلاقة",
    fluencyTitle: "حسّن طلاقتك في التحدث بالإنجليزية",
    fluencyP1: "يجعل SpeakAce التدريب على IELTS speaking عبر الإنترنت أكثر تنظيمًا. أنت لا تسجل الإجابة فقط، بل ترى أيضًا كيف بُنيت وأين تضعف.",
    fluencyP2: "تتحسن الطلاقة عندما يصبح الكلام أوضح وأكثر ثباتًا تحت الضغط. لذلك صُمم SpeakAce كنظام لتحسين الدرجة وليس كأداة عامة.",
    tasksEyebrow: "مهام حقيقية",
    tasksTitle: "تدرّب على أسئلة IELTS حقيقية",
    tasksP1: "بدلًا من الأسئلة العشوائية، تتدرّب على صيغ أقرب إلى توقعات الاختبار الحقيقية.",
    tasksP2: "إذا أردت بداية أسرع، افتح الاختبار المجاني أو تصفح موضوعات IELTS أو اقرأ أدلة المدونة.",
    freeTest: "افتح اختبار IELTS المجاني",
    topicHub: "تصفح موضوعات IELTS",
    blog: "اقرأ الأدلة في المدونة",
    instantEyebrow: "فهم فوري",
    instantTitle: "احصل على ملاحظات فورية",
    instantP1: "لا يعرض SpeakAce transcript فقط، بل يوضح لماذا تبدو الإجابة ضعيفة وما الذي يجب تغييره بعد ذلك.",
    instantP2: "ولهذا تمنحك حتى الجلسة المجانية الأولى قيمة حقيقية: تحدث، شاهد درجتك، أصلح نقطة ضعف واحدة، ثم حاول مرة أخرى بثقة أكبر.",
    firstStepEyebrow: "الخطوة الأولى",
    firstStepTitle: "ابدأ أول اختبار speaking خلال 30 ثانية",
    firstStepText: "يجب أن تكون الخطوة الأولى واضحة: تحدث، شاهد درجتك، ثم افتح الملاحظات الكاملة إذا أردت المزيد.",
    scoreTitle: "شاهد الدرجة أولًا ثم افتح الملاحظات الكاملة لاحقًا",
    scoreText: "يعرض SpeakAce القيمة قبل الضغط نحو الترقية: محاولة واحدة، ثم الدرجة، ثم Plus للملاحظات الكاملة.",
    unlock: "افتح الملاحظات الكاملة",
    faqTitle: "الأسئلة الشائعة",
    faq: [
      { question: "هل SpeakAce خدمة رسمية لتقييم IELTS؟", answer: "لا. يقدم SpeakAce درجات تقديرية وملاحظات للتحضير." },
      { question: "هل يساعد التدريب اليومي بالذكاء الاصطناعي في IELTS speaking؟", answer: "نعم. التدريب اليومي مع مراجعة transcript وإعادة المحاولة يحسن الطلاقة والبنية." },
      { question: "لمن تم تصميم SpeakAce؟", answer: "لمتعلمي IELTS وTOEFL والمعلمين ومدارس اللغات." }
    ]
  },
  ja: {
    title: "AI練習でIELTS Speakingスコアを伸ばす",
    description: "実際の質問で練習し、すぐにフィードバックを受け取り、英語の流暢さをより速く伸ばしましょう。",
    cta: "今すぐ話し始める",
    free: "無料 • 登録不要",
    learners: "1,000人以上の学習者が利用",
    demo: "クイックデモ",
    userPrompt: 'ユーザー:「あなたの地元について説明してください」',
    estimatedScore: "IELTS speaking 推定スコア",
    aiFeedback: "AIフィードバック",
    aiFeedbackText: "具体例を1つ加えると、より明確になります。",
    fluency: "流暢さ",
    pronunciation: "発音",
    structure: "構成",
    reasonsEyebrow: "スコア向上",
    reasonsTitle: "学習者がSpeakAceを使う理由",
    reasonCards: [
      { title: "本物のIELTSタスクを練習", description: "時間制限付きタスクで本番に近い感覚を得られます。" },
      { title: "スコアを下げる原因が見える", description: "流暢さ・発音・構成の弱点を見つけられます。" },
      { title: "再挑戦のたびに答えを強くする", description: "スコアの手がかりと修正で次の挑戦がより有益になります。" }
    ],
    fluencyEyebrow: "流暢さ",
    fluencyTitle: "英語の話す流暢さを伸ばす",
    fluencyP1: "SpeakAceはIELTS speakingのオンライン練習をより構造的にします。録音するだけでなく、回答の組み立て方や弱くなる部分も見えます。",
    fluencyP2: "流暢さは、プレッシャーの中でもより明確で安定した話し方になることで伸びます。だからSpeakAceは単なるツールではなく、スコア改善システムです。",
    tasksEyebrow: "実際のタスク",
    tasksTitle: "本物のIELTS質問を練習する",
    tasksP1: "ランダムなプロンプトではなく、本番の期待に近い形式で練習できます。",
    tasksP2: "すぐ始めたい場合は、無料テスト、IELTSトピック、またはブログガイドを開いてください。",
    freeTest: "無料IELTSテストを開く",
    topicHub: "IELTSトピックを見る",
    blog: "ブログガイドを読む",
    instantEyebrow: "即時の気づき",
    instantTitle: "すぐにフィードバックを得る",
    instantP1: "SpeakAceはtranscriptを見せるだけでなく、なぜ回答が弱く見えるのか、次に何を変えるべきかも示します。",
    instantP2: "そのため、最初の無料セッションでも本当の価値があります。話し、スコアを見て、弱点を1つ直し、もう一度挑戦できます。",
    firstStepEyebrow: "最初の一歩",
    firstStepTitle: "30秒で最初のspeakingテストを始める",
    firstStepText: "最初の行動は明確であるべきです。話し、スコアを見て、必要なら詳細フィードバックを解放します。",
    scoreTitle: "まずスコアを見て、あとで完全フィードバックを解放",
    scoreText: "SpeakAceはアップグレード前に価値を見せます。まず1回試し、スコアを確認し、完全分析はPlusで解放します。",
    unlock: "完全フィードバックを解放",
    faqTitle: "よくある質問",
    faq: [
      { question: "SpeakAceは公式のIELTS採点サービスですか？", answer: "いいえ。SpeakAceは準備向けの推定スコアとフィードバックを提供します。" },
      { question: "毎日のAI練習はIELTS speakingに役立ちますか？", answer: "はい。transcriptの確認と再挑戦を含む毎日の練習は流暢さと構成を改善します。" },
      { question: "SpeakAceは誰向けですか？", answer: "IELTS・TOEFL学習者、教師、語学学校向けです。" }
    ]
  },
  ko: {
    title: "AI 연습으로 IELTS Speaking 점수를 높이세요",
    description: "실제 질문으로 연습하고 즉시 피드백을 받아 영어 말하기 유창성을 더 빠르게 높이세요.",
    cta: "지금 말하기 시작",
    free: "무료 • 회원가입 불필요",
    learners: "1,000명 이상의 학습자가 사용",
    demo: "빠른 데모",
    userPrompt: '사용자: "당신의 고향을 설명해 보세요"',
    estimatedScore: "예상 IELTS speaking 점수",
    aiFeedback: "AI 피드백",
    aiFeedbackText: "명확성을 높이기 위해 구체적인 예시를 추가하세요.",
    fluency: "유창성",
    pronunciation: "발음",
    structure: "구조",
    reasonsEyebrow: "점수 향상",
    reasonsTitle: "학습자들이 SpeakAce를 사용하는 이유",
    reasonCards: [
      { title: "실제 IELTS 과제로 연습", description: "시간 제한이 있는 과제가 실제 시험과 더 비슷합니다." },
      { title: "점수를 낮추는 원인 파악", description: "유창성, 발음, 구조의 약점을 확인할 수 있습니다." },
      { title: "재시도마다 더 강한 답변 만들기", description: "점수 신호와 수정이 다음 시도를 더 유익하게 만듭니다." }
    ],
    fluencyEyebrow: "유창성",
    fluencyTitle: "영어 말하기 유창성을 높이세요",
    fluencyP1: "SpeakAce는 IELTS speaking 온라인 연습을 더 구조적으로 만들어 줍니다. 단순히 녹음만 하는 것이 아니라 답변이 어떻게 구성됐는지도 볼 수 있습니다.",
    fluencyP2: "유창성은 압박 속에서도 더 명확하고 안정적으로 말할 때 향상됩니다. 그래서 SpeakAce는 단순한 도구가 아니라 점수 향상 시스템입니다.",
    tasksEyebrow: "실전 과제",
    tasksTitle: "실제 IELTS 질문으로 연습하세요",
    tasksP1: "무작위 프롬프트 대신 실제 시험 기대치에 더 가까운 형식으로 연습합니다.",
    tasksP2: "빠르게 시작하고 싶다면 무료 테스트를 열거나 IELTS 주제를 보거나 블로그 가이드를 읽어 보세요.",
    freeTest: "무료 IELTS 테스트 열기",
    topicHub: "IELTS 주제 보기",
    blog: "블로그 가이드 읽기",
    instantEyebrow: "즉시 인사이트",
    instantTitle: "즉시 피드백 받기",
    instantP1: "SpeakAce는 transcript만 보여주는 것이 아니라 왜 답변이 약하게 들리는지, 다음에 무엇을 바꿔야 하는지도 보여줍니다.",
    instantP2: "그래서 첫 무료 세션만으로도 실제 가치가 생깁니다. 말하고, 점수를 보고, 약점 하나를 고치고, 다시 시도할 수 있습니다.",
    firstStepEyebrow: "첫 단계",
    firstStepTitle: "30초 안에 첫 speaking 테스트 시작",
    firstStepText: "첫 행동은 분명해야 합니다. 말하고, 점수를 보고, 필요하면 더 깊은 피드백을 여세요.",
    scoreTitle: "먼저 점수를 보고, 나중에 전체 피드백을 여세요",
    scoreText: "SpeakAce는 업그레이드 압박보다 먼저 가치를 보여줍니다. 한 번 시도하고 점수를 본 뒤 Plus로 전체 분석을 여세요.",
    unlock: "전체 피드백 열기",
    faqTitle: "자주 묻는 질문",
    faq: [
      { question: "SpeakAce는 공식 IELTS 채점 서비스인가요?", answer: "아니요. SpeakAce는 준비용 예상 점수와 피드백을 제공합니다." },
      { question: "매일 AI 연습이 IELTS speaking에 도움이 되나요?", answer: "네. transcript 검토와 재시도를 포함한 매일의 연습은 유창성과 구조를 개선합니다." },
      { question: "SpeakAce는 누구를 위한 서비스인가요?", answer: "IELTS·TOEFL 학습자, 교사, 어학원을 위한 서비스입니다." }
    ]
  }
} as const;

function getMinimalCopy(language: string) {
  return minimalMarketingCopy[language as keyof typeof minimalMarketingCopy] ?? minimalMarketingCopy.en;
}

export function MarketingPage({
  eyebrow,
  title,
  description,
  focus,
  ctaHref,
  variant = "full"
}: {
  eyebrow: string;
  title: string;
  description: string;
  focus: string;
  ctaHref: Route;
  variant?: "full" | "minimal";
}) {
  const { language } = useAppState();
  const tr = language === "tr";
  const localizedFaqs = tr ? faqs.tr : faqs.en;
  const localizedHow = tr ? howItWorks.tr : howItWorks.en;
  const localizedPricingReasons = tr ? pricingReasons.tr : pricingReasons.en;
  const shortCopy = tr ? shortLandingCopy.tr : shortLandingCopy.en;
  const localizedTrustSignals = tr ? trustSignals.tr : trustSignals.en;
  const localizedTestimonials = tr ? testimonials.tr : testimonials.en;
  const localizedUseCases = tr ? useCases.tr : useCases.en;
  const localizedComparisonPoints = tr ? comparisonPoints.tr : comparisonPoints.en;
  const localizedDailyPrompt = tr ? dailyPrompts.tr : dailyPrompts.en;
  const localizedStudyTracks = tr ? studyTracks.tr : studyTracks.en;
  const localizedFreePacks = tr ? freePacks.tr : freePacks.en;
  const localizedRoadmap = tr ? roadmapCards.tr : roadmapCards.en;
  const localizedAnswerUpgrade = tr ? answerUpgrade.tr : answerUpgrade.en;
  const localizedExamWeekChecklist = tr ? examWeekChecklist.tr : examWeekChecklist.en;
  const localizedSpeakingIdentities = tr ? speakingIdentities.tr : speakingIdentities.en;
  const localizedScoreLadders = tr ? scoreLadders.tr : scoreLadders.en;
  const planComparison = getPlanComparison(tr);
  const minimalCopy = getMinimalCopy(language);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: localizedFaqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "3.99",
      priceCurrency: "USD"
    },
    description: siteConfig.description
  };

  if (variant === "minimal") {
    return (
      <main>
        <section className="page-shell section home-hero">
          <div className="hero-copy">
            <span className="eyebrow">{eyebrow}</span>
            <h1>{minimalCopy.title}</h1>
            <p className="hero-description">{minimalCopy.description}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href={ctaHref}>
                {minimalCopy.cta}
              </Link>
            </div>
            <p className="practice-meta" style={{ marginTop: "0.9rem" }}>
              {minimalCopy.free}
            </p>
            <p className="practice-meta" style={{ marginTop: "0.45rem" }}>
              {minimalCopy.learners}
            </p>
          </div>

          <aside className="card hero-result">
            <div className="pill">{minimalCopy.demo}</div>
            <div className="practice-meta" style={{ marginBottom: "0.8rem" }}>
              {minimalCopy.userPrompt}
            </div>
            <div className="score-showcase">
              <div className="score-value">6.5</div>
              <div className="score-label">{minimalCopy.estimatedScore}</div>
            </div>
            <div className="card spotlight-card">
              <strong>{minimalCopy.aiFeedback}</strong>
              <p>{minimalCopy.aiFeedbackText}</p>
            </div>
            <div className="metrics-grid">
              <MiniMetric label={minimalCopy.fluency} value="7.0" />
              <MiniMetric label={minimalCopy.pronunciation} value="6.5" />
              <MiniMetric label={minimalCopy.structure} value="6.5" />
            </div>
          </aside>
        </section>

        <section className="page-shell section" style={{ paddingTop: 0 }}>
          <div className="section-head">
            <span className="eyebrow">{minimalCopy.reasonsEyebrow}</span>
            <h2>{minimalCopy.reasonsTitle}</h2>
          </div>
          <div className="marketing-grid">
            {minimalCopy.reasonCards.map((item) => (
              <FeatureCard
                key={item.title}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>

        <section className="page-shell section">
          <div className="section-head">
            <span className="eyebrow">{minimalCopy.fluencyEyebrow}</span>
            <h2>{minimalCopy.fluencyTitle}</h2>
          </div>
          <div className="card quick-pitch">
            <div className="stack" style={{ gap: "1rem" }}>
              <p className="practice-copy">{minimalCopy.fluencyP1}</p>
              <p className="practice-copy">{minimalCopy.fluencyP2}</p>
            </div>
          </div>
        </section>

        <section className="page-shell section">
          <div className="section-head">
            <span className="eyebrow">{minimalCopy.tasksEyebrow}</span>
            <h2>{minimalCopy.tasksTitle}</h2>
          </div>
          <div className="card quick-pitch">
            <div className="stack" style={{ gap: "1rem" }}>
              <p className="practice-copy">{minimalCopy.tasksP1}</p>
              <p className="practice-copy">{minimalCopy.tasksP2}</p>
              <div className="lead-capture-actions">
                <Link className="button button-secondary" href="/free-ielts-speaking-test">
                  {minimalCopy.freeTest}
                </Link>
                <Link className="button button-secondary" href="/ielts-speaking-topics">
                  {minimalCopy.topicHub}
                </Link>
                <Link className="button button-secondary" href="/blog">
                  {minimalCopy.blog}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell section">
          <div className="section-head">
            <span className="eyebrow">{minimalCopy.instantEyebrow}</span>
            <h2>{minimalCopy.instantTitle}</h2>
          </div>
          <div className="card quick-pitch">
            <div className="stack" style={{ gap: "1rem" }}>
              <p className="practice-copy">{minimalCopy.instantP1}</p>
              <p className="practice-copy">{minimalCopy.instantP2}</p>
            </div>
          </div>
        </section>

        <section className="page-shell section">
          <div className="section-head">
            <span className="eyebrow">{minimalCopy.firstStepEyebrow}</span>
            <h2>{minimalCopy.firstStepTitle}</h2>
            <p>{minimalCopy.firstStepText}</p>
          </div>
          <div className="steps-grid">
            {localizedHow.slice(0, 3).map((item, index) => (
              <StepCard
                key={item.title}
                index={`0${index + 1}`}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </section>

        <section className="page-shell section">
          <div className="card quick-pitch">
            <div className="quick-pitch-grid">
              <div>
                <h2 style={{ marginBottom: "0.8rem" }}>{minimalCopy.scoreTitle}</h2>
                <p className="practice-copy">{minimalCopy.scoreText}</p>
              </div>
              <div className="lead-capture-actions">
                <Link className="button button-primary" href="/app/practice?quickStart=1">
                  {minimalCopy.cta}
                </Link>
                <Link className="button button-secondary" href="/pricing">
                  {minimalCopy.unlock}
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell section">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>{minimalCopy.faqTitle}</h2>
          </div>
          <div className="marketing-grid">
            {minimalCopy.faq.map((item) => (
              <article key={item.question} className="card feature-card">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      </main>
    );
  }

  return (
    <main>
      <section className="page-shell section home-hero">
        <div className="hero-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1>
            {tr
              ? "IELTS speaking pratiğini gerçek sınav baskısına daha yakın, daha akıllı bir AI koçla güçlendir."
              : title}
          </h1>
          <p className="hero-description">
            {tr
              ? "Cevabını kaydet, transcript’ini incele, tahmini band skorunu gör ve speaking puanını yükseltmek için sana en çok yardımcı olacak geri bildirimi al."
              : description}
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={ctaHref}>
              {tr ? "Konuşmaya başla" : "Start Speaking Now"}
            </Link>
          </div>
          <p className="practice-meta" style={{ marginTop: "0.9rem" }}>
            {tr ? "Ücretsiz • Kayıt olmadan kullanılabilir" : "Free • No signup required"}
          </p>
          <div className="hero-outcomes">
            {coreKeywords.slice(0, 5).map((keyword) => (
              <span key={keyword} className="pill">
                {keyword}
              </span>
            ))}
          </div>
          <div className="hero-proof">
            <div className="card proof-tile">
              <strong>{tr ? "Skoru yükseltmeye odaklan" : "Focus on score improvement"}</strong>
              <p>
                {tr
                  ? "Her deneme sana sadece puan değil, bir sonraki cevabı nasıl daha güçlü kuracağını da gösterir."
                  : "Every attempt gives you more than a score estimate. It shows how to make the next answer stronger."}
              </p>
            </div>
            <div className="card proof-tile">
              <strong>{tr ? "Daha çok konuş, daha hızlı öğren" : "Practice more, learn faster"}</strong>
              <p>
                {tr
                  ? "Hızlı kayıt, transcript ve geri bildirim döngüsü günlük speaking pratiğini daha sürdürülebilir yapar."
                  : "A fast record-review-retry loop makes daily IELTS speaking practice easier to maintain."}
              </p>
            </div>
          </div>
        </div>

        <aside className="card hero-result">
          <div className="pill">{tr ? "Hızlı demo" : "Quick demo"}</div>
          <div className="practice-meta" style={{ marginBottom: "0.8rem" }}>
            {tr ? 'Kullanıcı: "Doğduğun yeri anlat"' : 'User: "Describe your hometown"'}
          </div>
          <div className="score-showcase">
            <div className="score-value">6.5</div>
            <div className="score-label">
              {tr ? "Tahmini IELTS speaking skoru" : "Estimated IELTS speaking score"}
            </div>
          </div>
          <div className="card spotlight-card">
            <strong>{tr ? "AI geri bildirimi" : "AI feedback"}</strong>
            <p>
              {tr
                ? "Daha net olmak için tek bir spesifik örnek ekle."
                : "Add a specific example to improve clarity."}
            </p>
          </div>
          <div className="metrics-grid">
            <MiniMetric label={tr ? "Akıcılık" : "Fluency"} value="7.0" />
            <MiniMetric label={tr ? "Telaffuz" : "Pronunciation"} value="6.5" />
            <MiniMetric label={tr ? "Yapı" : "Structure"} value="6.5" />
          </div>
        </aside>
      </section>

      <section className="page-shell section" style={{ paddingTop: 0 }}>
        <div className="stats-strip">
          {localizedTrustSignals.map((item) => (
            <div key={item.label} className="card stat-strip-card">
              <div className="practice-meta">{item.label}</div>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell section" style={{ paddingTop: 0 }}>
        <div className="card quick-pitch">
          <div className="quick-pitch-grid">
            <div>
              <span className="eyebrow">{tr ? "İlk adım" : "First step"}</span>
              <h2 style={{ margin: "0.8rem 0" }}>
                {tr ? "İlk speaking testini 30 saniyede başlat" : "Take your first speaking test in 30 seconds"}
              </h2>
              <p className="practice-copy">
                {tr
                  ? "Önce bir soruya cevap ver, skorunu gör, sonra tam geri bildirim ve daha fazla tekrar için Plus’ı aç."
                  : "Answer one question first, see your score, then unlock full feedback and more retries with Plus."}
              </p>
            </div>
            <div className="lead-capture-actions">
              <Link className="button button-primary" href="/app/practice?quickStart=1">
                {tr ? "Konuşmaya başla" : "Start Speaking Now"}
              </Link>
              <Link className="button button-secondary" href="/pricing">
                {tr ? "Tam geri bildirimi gör" : "Unlock full feedback"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingDemoShowcase tr={tr} />

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Speaking DNA" : "Speaking DNA"}</span>
          <h2>{tr ? "Kendi speaking tipini hemen tani" : "Recognize your speaking pattern immediately"}</h2>
          <p>
            {tr
              ? "Çoğu ürün sadece puan verir. SpeakAce ise öğrencinin nasıl cevap verdiğini adlandırıp doğru sonraki hamleyi gösterir."
              : "Most products stop at a score. SpeakAce also names the learner pattern and points to the smartest next move."}
          </p>
        </div>
        <div className="marketing-grid">
          {localizedSpeakingIdentities.map((item) => (
            <article key={item.title} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>{item.badge}</div>
              <h3>{item.title}</h3>
              <p style={{ marginBottom: "0.8rem" }}>{item.signal}</p>
              <div className="practice-meta">{item.move}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Skor merdiveni" : "Score ladder"}</span>
          <h2>{tr ? "Skor yükselirken ne değişmeli?" : "What should change as the score rises?"}</h2>
          <p>
            {tr
              ? "Skor artışı tek bir numarayla gelmez. Her aralıkta fark yaratan davranış biraz değişir."
              : "Score growth does not come from one trick. The behavior that matters changes slightly at each band range."}
          </p>
        </div>
        <div className="marketing-grid">
          {localizedScoreLadders.map((item) => (
            <article key={item.label} className="card feature-card">
              <h3>{item.label}</h3>
              <p>{item.note}</p>
              <Link href="/pricing" className="button button-secondary">
                {tr ? "Bu araligi calis" : "Train this jump"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Neden SpeakAce" : "Why SpeakAce"}</span>
          <h2>
            {tr
              ? "Konuşma pratiğini daha fazla denemeye, daha net geri bildirime ve daha yüksek IELTS speaking skoruna çevir"
              : "Turn more speaking attempts into better IELTS answers and stronger score growth"}
          </h2>
          <p>
            {tr
              ? "SpeakAce genel İngilizce sohbet için değil; IELTS speaking practice, IELTS speaking AI, improve IELTS speaking score ve speaking test simulator IELTS gibi yüksek niyetli aramalara gerçek değer üretmek için tasarlandı."
              : focus}
          </p>
        </div>
        <div className="marketing-grid">
          {whySpeakAce.map((item) => (
            <FeatureCard
              key={item.title.en}
              title={tr ? item.title.tr : item.title.en}
              description={tr ? item.description.tr : item.description.en}
            />
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Kime uygun" : "Use cases"}</span>
          <h2>
            {tr
              ? "Aynı ürün içinde hem bireysel öğrenci hem de kurs kullanımı"
              : "One product for individual learners, teachers, and schools"}
          </h2>
          <p>
            {tr
              ? "Rakiplerde öne çıkan en güçlü şeylerden biri tek bir kullanım alanına sıkışmamak. SpeakAce bu yüzden hem bireysel practice hem de sınıf yönetimini aynı yapı içinde sunuyor."
              : "A big conversion advantage in this space is serving more than one use case well. SpeakAce is built for both solo practice and class workflows."}
          </p>
        </div>
        <div className="marketing-grid">
          {localizedUseCases.map((item) => (
            <FeatureCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "30 güçlü özellik" : "30 high-value features"}</span>
          <h2>
            {tr
              ? "Öğrencilerin daha akıcı konuşmasına, daha güvenli hissetmesine ve IELTS speaking skorunu yükseltmesine yardımcı olan özellikler"
              : "Features designed to improve fluency, confidence, and IELTS speaking score"}
          </h2>
          <p>
            {tr
              ? "Bu özellikler sadece daha fazla araç sunmak için değil; daha iyi speaking cevabı kurmak, daha net telaffuz etmek ve sınav günü daha kontrollü konuşmak için tasarlandı."
              : "These features are built to improve real speaking performance, not just to add more buttons to the product."}
          </p>
        </div>
        <div className="marketing-grid">
          {standoutFeatures.map((item) => (
            <FeatureCard
              key={item.title.en}
              title={tr ? item.title.tr : item.title.en}
              description={tr ? item.description.tr : item.description.en}
            />
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Neden şimdi" : "Why now"}</span>
          <h2>
            {tr
              ? "İnsanlar neden böyle bir ürüne para öder?"
              : "Why would someone pay for SpeakAce instead of using generic tools?"}
          </h2>
        </div>
        <div className="marketing-grid">
          {localizedComparisonPoints.map((item) => (
            <FeatureCard key={item.title} title={item.title} description={item.description} />
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Güven" : "Proof"}</span>
          <h2>{tr ? "Ürünü kullanan kişilerden kısa sinyaller" : "Short signals from the kind of users this product is built for"}</h2>
          <p>
            {tr
              ? "Sosyal kanıt tek başına satış yaratmaz, ama ziyaretçinin ürünü zihninde daha gerçek bir yere koymasına yardım eder."
              : "Social proof does not close the sale alone, but it helps visitors place the product in a more real and trustworthy category."}
          </p>
        </div>
        <TestimonialTicker items={localizedTestimonials} />
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Çalışma yolları" : "Study tracks"}</span>
          <h2>{tr ? "Farklı hedefler için farklı giriş noktaları" : "Different entry points for different improvement goals"}</h2>
          <p>
            {tr
              ? "Herkes aynı yerden başlamaz. Bu yüzden SpeakAce, ziyaretçiyi daha doğru sayfaya taşıyan farklı çalışma yolları sunar."
              : "Not every learner starts from the same place. SpeakAce uses different tracks to pull visitors into the most relevant next step."}
          </p>
        </div>
        <div className="marketing-grid">
          {localizedStudyTracks.map((item) => (
            <article key={item.title} className="card feature-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href as Route} className="button button-secondary">
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Nasıl çalışır" : "How it works"}</span>
          <h2>
            {tr
              ? "4 basit adımda daha iyi IELTS speaking pratiği"
              : "A simple 4-step system for smarter IELTS speaking practice"}
          </h2>
        </div>
        <div className="steps-grid">
          {localizedHow.map((item, index) => (
            <StepCard
              key={item.title}
              index={`0${index + 1}`}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Önce / sonra" : "Before / after"}</span>
          <h2>{tr ? "Daha güçlü cevap hissi nasıl oluşuyor?" : "What does a stronger IELTS answer actually look like?"}</h2>
        </div>
        <div className="marketing-grid">
          <article className="card feature-card">
            <div className="pill" style={{ marginBottom: "0.8rem" }}>{localizedAnswerUpgrade.weakTitle}</div>
            <p style={{ marginBottom: "1rem" }}>{localizedAnswerUpgrade.weak}</p>
            <div className="practice-meta">{tr ? "Daha kısa, daha genel ve daha az destekli." : "Shorter, more general, and less supported."}</div>
          </article>
          <article className="card feature-card">
            <div className="pill" style={{ marginBottom: "0.8rem" }}>{localizedAnswerUpgrade.strongTitle}</div>
            <p style={{ marginBottom: "1rem" }}>{localizedAnswerUpgrade.strong}</p>
            <div className="practice-meta">{localizedAnswerUpgrade.note}</div>
          </article>
        </div>
      </section>

      <section id="pricing" className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Fiyat değeri" : "Pricing value"}</span>
          <h2>
            {tr
              ? "Neden haftalık $3.99 ödemeye değer?"
              : "Why $3.99/week is worth it for IELTS speaking practice"}
          </h2>
          <p>
            {tr
              ? "SpeakAce, tek bir özel dersin veya kısa bir mock speaking seansının maliyetinden daha düşük bir seviyede, düzenli AI English speaking practice sunar."
              : "SpeakAce is priced to feel lighter than booking repeated mock sessions while still giving daily speaking value."}
          </p>
        </div>
        <div className="marketing-grid">
          {localizedPricingReasons.map((item) => (
            <FeatureCard key={item} title={tr ? "Neden değerli?" : "Why it matters"} description={item} />
          ))}
            <PricingCard
            ctaLabel={tr ? "Plus ile şimdi başla" : "Start Plus now"}
            name={commerceConfig.plusPlanName.replace(" Weekly", "")}
            price={commerceConfig.plusMonthlyPrice}
            features={
              tr
                ? [
                    "Daha fazla günlük speaking süresi",
                    "Daha ayrıntılı transcript ve skor analizi",
                    "Tekrar denemeleriyle daha hızlı gelişim"
                  ]
                : [
                    "More daily speaking time",
                    "Deeper transcript and score analysis",
                    "Faster improvement through repeat attempts"
                ]
            }
            href={commerceConfig.plusCheckoutPath}
            featured
          />
        </div>
        <div className="card comparison-card">
          <h3 style={{ marginBottom: "0.9rem" }}>{tr ? "Free ve Plus karşılaştırması" : "Free vs Plus"}</h3>
          <div className="comparison-table">
            <div className="comparison-head">{tr ? "Özellik" : "Feature"}</div>
            <div className="comparison-head">Free</div>
            <div className="comparison-head">Plus</div>
            {planComparison.map((item) => (
              <FragmentRow key={item.label} label={item.label} free={item.free} plus={item.plus} />
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Ücretsiz paketler" : "Free packs"}</span>
          <h2>{tr ? "Önce ücretsiz gir, sonra düzen kur" : "Enter through a free pack, then build a real study rhythm"}</h2>
        </div>
        <div className="marketing-grid">
          {localizedFreePacks.map((item) => (
            <article key={item.title} className="card feature-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href as Route} className="button button-primary">
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Hızlı versiyon" : "Short landing page version"}</span>
          <h2>
            {tr
              ? "Kısa anlatım: SpeakAce ne sunuyor?"
              : "The fast version: what SpeakAce helps you do"}
          </h2>
        </div>
        <div className="card quick-pitch">
          <div className="quick-pitch-grid">
            <div>
              <h3 style={{ marginBottom: "0.8rem" }}>{shortCopy.title}</h3>
              <ul className="compact-list">
                {shortLandingPoints.map((item) => (
                  <li key={item.en}>{tr ? item.tr : item.en}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="practice-copy" style={{ marginBottom: "1rem" }}>
                {tr
                  ? "IELTS speaking practice, AI speaking feedback, tahmini band skorları ve speaking simulator deneyimini tek web uygulamasında birleştiriyoruz."
                  : "We combine IELTS speaking practice, AI speaking feedback, estimated band score support, and a speaking test simulator in one web product."}
              </p>
              <a className="button button-primary" href={commerceConfig.plusCheckoutPath}>
                {tr ? "Plus planını al" : "Get Plus"}
              </a>
              <Link className="button button-secondary" href={ctaHref} style={{ marginLeft: "0.7rem" }}>
                {shortCopy.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Yol haritası" : "Roadmap"}</span>
          <h2>{tr ? "Ziyaretçiyi kullanıcılığa taşıyan üç adım" : "Three steps that move a visitor toward active usage"}</h2>
        </div>
        <div className="marketing-grid">
          {localizedRoadmap.map((item) => (
            <article key={item.title} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>{item.title}</div>
              <p>{item.description}</p>
              <Link href={item.href as Route} className="button button-secondary">
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Demo feedback" : "Demo feedback"}</span>
          <h2>
            {tr
              ? "Öğrenci ne söyledi, sistem ne önerdi?"
              : "What the student said, and how SpeakAce makes the next answer stronger"}
          </h2>
          <p>
            {tr
              ? "Rakip ürünlerde öne çıkan en güçlü dönüşüm anlarından biri somut önce-sonra farkıdır. SpeakAce bunu transcript ve stronger answer akışıyla gösterir."
              : "One of the strongest conversion patterns in this category is a clear before-and-after example. SpeakAce shows that through transcript review and stronger sample answers."}
          </p>
        </div>
        <div className="marketing-grid">
          <article className="card testimonial-card">
            <span className="eyebrow">{tr ? "Ham cevap" : "Raw answer"}</span>
            <h3>{tr ? "Önce" : "Before"}</h3>
            <p>
              {tr
                ? "I think phone is useful because I use every day and it helps my communication and studying."
                : "I think phone is useful because I use every day and it helps my communication and studying."}
            </p>
          </article>
          <article className="card testimonial-card">
            <span className="eyebrow">{tr ? "Daha güçlü versiyon" : "Stronger version"}</span>
            <h3>{tr ? "Sonra" : "After"}</h3>
            <p>
              {tr
                ? "My phone is one of the most useful objects in my daily life because it helps me stay in touch with people, organise my study routine, and access information quickly."
                : "My phone is one of the most useful objects in my daily life because it helps me stay in touch with people, organise my study routine, and access information quickly."}
            </p>
          </article>
          <article className="card testimonial-card">
            <span className="eyebrow">{tr ? "Neden fark yaratır" : "Why it matters"}</span>
            <h3>{tr ? "Skor etkisi" : "Score impact"}</h3>
            <p>
              {tr
                ? "Daha net yapı, daha güçlü kelime seçimi ve daha olgun fikir geliştirme daha yüksek band potansiyeli yaratır."
                : "Clearer structure, stronger vocabulary, and more developed ideas create higher band potential."}
            </p>
            <Link className="button button-secondary" href="/reviews">
              {tr ? "Yorumlari oku" : "Read reviews"}
            </Link>
          </article>
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Sınav haftası" : "Exam week"}</span>
          <h2>{tr ? "Sınava yakın dönemde neye odaklanmalı?" : "What should learners focus on in the final stretch?"}</h2>
        </div>
        <div className="marketing-grid">
          {localizedExamWeekChecklist.map((item) => (
            <article key={item} className="card feature-card">
              <h3>{tr ? "Checklist item" : "Checklist item"}</h3>
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Günün speaking sorusu" : "Prompt of the day"}</span>
          <h2>
            {tr
              ? "Ziyaretçiyi anında speaking moduna sokan günlük soru bandı"
              : "A daily IELTS speaking prompt that moves visitors into practice fast"}
          </h2>
          <p>
            {tr
              ? "Aramadan gelen ziyaretçi, tek bir iyi soru ve net bir CTA görünce ürünü daha hızlı dener."
              : "Search visitors are more likely to try the product when they see one useful prompt and one clear next step."}
          </p>
        </div>
        <div className="card daily-prompt-card">
          <div>
            <span className="eyebrow">{tr ? "Bugünün görevi" : "Today’s task"}</span>
            <h3 style={{ margin: "0.75rem 0 0.6rem" }}>{localizedDailyPrompt[0]}</h3>
            <p className="practice-copy">
              {tr
                ? "Bunu 45-60 saniyede cevapla, transcript’ini incele ve aynı soruyu daha güçlü yapıyla tekrar dene."
                : "Answer this in 45-60 seconds, review the transcript, and retry the same prompt with a stronger structure."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-primary" href="/app/practice">
              {tr ? "Bu soruyla başla" : "Practice this prompt"}
            </Link>
            <Link className="button button-secondary" href="/weekly-ielts-speaking-challenge">
              {tr ? "Haftalık challenge" : "Weekly challenge"}
            </Link>
          </div>
        </div>
        <div className="daily-prompt-list">
          {localizedDailyPrompt.slice(1).map((prompt) => (
            <article key={prompt} className="card daily-prompt-item">
              <strong>{prompt}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Sosyal kanıt" : "Social proof"}</span>
          <h2>
            {tr
              ? "Ziyaretçi neden güven duymalı?"
              : "Why this can feel worth paying for"}
          </h2>
        </div>
        <div className="marketing-grid">
          {localizedTestimonials.map((item) => (
            <article key={item.quote} className="card testimonial-card">
              <p style={{ lineHeight: 1.8, marginBottom: "1rem" }}>&ldquo;{item.quote}&rdquo;</p>
              <strong>{item.author}</strong>
              <div className="practice-meta">{item.role}</div>
            </article>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <Link className="button button-secondary" href="/reviews">
            {tr ? "Tüm yorumları aç" : "Open all reviews"}
          </Link>
        </div>
        <TestimonialTicker items={localizedTestimonials} />
      </section>

      <section className="page-shell section">
        <div className="card institution-cta">
          <div>
            <span className="eyebrow">{tr ? "Kurslar için" : "For schools"}</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>
              {tr
                ? "Kurslara satılabilecek bir speaking practice altyapısı"
                : "A speaking practice platform that also works for schools and teachers"}
            </h2>
            <p className="practice-copy">
              {tr
                ? "Öğretmen paneli, sınıf kodları, ödev atama, riskli öğrenci uyarıları ve kurum analitiği ile SpeakAce sadece öğrenci aracı değil, aynı zamanda eğitim kurumu ürünü de olabilir."
                : "With teacher dashboards, class codes, homework assignment, risk alerts, and institution analytics, SpeakAce is not only a student tool but a school-ready product."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
            <Link className="button button-secondary" href="/app/teacher">
              {tr ? "Öğretmen akışını gör" : "See teacher workflow"}
            </Link>
            <a className="button button-primary" href={buildPlanCheckoutPath({ coupon: couponCatalog.LAUNCH20.code, campaign: "schools_cta" })}>
              {tr ? "Ödeme akışını test et" : "Test checkout"}
            </a>
          </div>
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Kaynak merkezi" : "Resource hub"}</span>
          <h2>
            {tr
              ? "Doğru kaynak sayfalarıyla daha fazla keşif ve daha net dönüşüm yolu"
              : "Resource pages designed to attract the right learners and guide them into practice"}
          </h2>
          <p>
            {tr
              ? "Topic listeleri, band score rehberleri ve task bazlı sayfalar sayesinde ziyaretçi önce doğru içeriğe, sonra practice ve Plus akışına girer."
              : "With topic pages, band score guides, and task-specific landing pages, visitors can enter through search and move cleanly toward practice and Plus."}
          </p>
        </div>
        <div className="marketing-grid">
          {[
            {
              href: "/resources",
              title: tr ? "Kaynak merkezi" : "Resource hub",
              description: tr
                ? "Tüm IELTS speaking rehberlerini, konu sayfalarını ve faydalı giriş noktalarını tek yerde topla."
                : "Collect all IELTS speaking guides, topic pages, and useful entry points in one place."
            },
            {
              href: "/ielts-speaking-topics",
              title: tr ? "IELTS speaking topics" : "IELTS speaking topics",
              description: tr
                ? "Konu bazlı arama yapan öğrencileri practice akışına taşıyan sayfa."
                : "A topic page that helps curious visitors move into real practice."
            },
            {
              href: "/ielts-band-score-guide",
              title: tr ? "Band score rehberi" : "Band score guide",
              description: tr
                ? "Skor hedefi olan öğrenciler için daha güçlü bir giriş kapısı."
                : "A stronger entry page for students who search around score improvement."
            }
          ].map((item) => (
            <article key={item.href} className="card feature-card">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link className="button button-secondary" href={item.href as Route}>
                {tr ? "Sayfayı aç" : "Open page"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">Blog</span>
          <h2>
            {tr
              ? "IELTS speaking skorunu yükseltmek isteyenler için içerikler"
              : "Content built to help learners improve IELTS speaking score"}
          </h2>
          <p>
            {tr
              ? "IELTS speaking pratiğini daha iyi anlamak isteyen öğrenciler için hazırlanmış faydalı içerikler."
              : "Useful articles for learners who want clearer IELTS speaking practice, stronger answers, and better scores."}
          </p>
        </div>
        <div className="marketing-grid">
          {blogPosts.map((post) => (
            <article key={post.slug} className="card feature-card">
              <div className="pill" style={{ marginBottom: "0.8rem" }}>
                {post.keywords[0]}
              </div>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <Link href={`/blog/${post.slug}`} className="button button-secondary" style={{ marginTop: "0.7rem" }}>
                {tr ? "Yazıyı aç" : "Read article"}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="page-shell section">
        <div className="card lead-capture-card">
          <div>
            <span className="eyebrow">{tr ? "Ücretsiz lead magnet" : "Free lead magnet"}</span>
            <h2 style={{ margin: "0.8rem 0 0.5rem" }}>
              {tr
                ? "Ücretsiz speaking checklist ve challenge akışını aç"
                : "Unlock the free speaking checklist and challenge flow"}
            </h2>
            <p className="practice-copy">
              {tr
                ? "Ziyaretçiyi önce ücretsiz test, sonra challenge ve ardından Plus teklifine taşıyan daha net bir email yakalama akışı."
                : "A cleaner lead-capture path that moves visitors from a free test to a challenge and then toward the Plus offer."}
            </p>
          </div>
          <div className="lead-capture-actions">
            <LeadCaptureForm source="home_lead" />
            <Link className="button button-secondary" href="/free-ielts-speaking-test">
              {tr ? "Ücretsiz testi gör" : "Open free test"}
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">{tr ? "Günlük giriş" : "Daily entry point"}</span>
          <h2>{tr ? "Her gün yeni bir speaking girişiyle geri dön" : "Come back through a fresh daily speaking entry point"}</h2>
          <p>
            {tr
              ? "Günlük prompt ve case study sayfaları, organik trafikten gelen kullanıcıyı tekrar practice ve Plus akışına taşıyor."
              : "The daily prompt and case study pages create repeatable traffic entry points that guide visitors back into practice and Plus."}
          </p>
        </div>
        <div className="lead-capture-actions">
          <Link className="button button-secondary" href="/daily-ielts-speaking-prompt">
            {tr ? "Günlük prompt sayfasını aç" : "Open daily prompt page"}
          </Link>
          <Link className="button button-ghost" href="/case-studies">
            {tr ? "Case study'leri gör" : "See case studies"}
          </Link>
        </div>
      </section>

      <section className="page-shell section">
        <div className="section-head">
          <span className="eyebrow">FAQ</span>
          <h2>{tr ? "Sık sorulan sorular" : "Frequently asked questions"}</h2>
        </div>
        <FaqTicker items={localizedFaqs} />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="card feature-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function StepCard({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <article className="card step-card">
      <span>{index}</span>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="card mini-metric">
      <div>{label}</div>
      <strong>{value}</strong>
    </div>
  );
}

function FaqTicker({
  items
}: {
  items: Array<{ question: string; answer: string }>;
}) {
  const loopItems = [...items, ...items];

  return (
    <div className="faq-ticker-shell">
      <div className="faq-ticker-track">
        {loopItems.map((faq, index) => (
          <article key={`${faq.question}-${index}`} className="card faq-ticker-card">
            <span className="eyebrow">FAQ</span>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function TestimonialTicker({
  items
}: {
  items: Array<{ quote: string; author: string; role: string }>;
}) {
  const loopItems = [...items, ...items];

  return (
    <div className="testimonial-ticker-shell">
      <div className="testimonial-ticker-track">
        {loopItems.map((item, index) => (
          <article key={`${item.author}-${index}`} className="card testimonial-ticker-card">
            <p>&ldquo;{item.quote}&rdquo;</p>
            <strong>{item.author}</strong>
            <div className="practice-meta">{item.role}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PricingCard({
  name,
  price,
  features,
  ctaLabel,
  href,
  featured = false
}: {
  name: string;
  price: string;
  features: string[];
  ctaLabel: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <article className="card pricing-card" data-featured={featured ? "true" : "false"}>
      <h3>{name}</h3>
      <div className="price-tag">{price}</div>
      <ul>
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <a className={`button ${featured ? "button-primary" : "button-secondary"}`} href={href} target="_blank" rel="noreferrer">
        {ctaLabel}
      </a>
    </article>
  );
}

function FragmentRow({ label, free, plus }: { label: string; free: string; plus: string }) {
  return (
    <>
      <div className="comparison-cell comparison-label">{label}</div>
      <div className="comparison-cell">{free}</div>
      <div className="comparison-cell">{plus}</div>
    </>
  );
}

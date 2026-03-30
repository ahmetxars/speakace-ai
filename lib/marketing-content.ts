export type LocalizedText = {
  en: string;
  tr: string;
};

export type FeatureItem = {
  title: LocalizedText;
  description: LocalizedText;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  sections: Array<{
    title: string;
    body: string[];
  }>;
};

export const coreKeywords = [
  "IELTS speaking practice",
  "IELTS speaking AI",
  "improve IELTS speaking score",
  "IELTS band score speaking",
  "AI English speaking practice",
  "speaking test simulator IELTS",
  "IELTS speaking feedback",
  "IELTS speaking mock test",
  "IELTS pronunciation practice",
  "IELTS fluency practice"
];

export const whySpeakAce: FeatureItem[] = [
  {
    title: {
      en: "Practice with exam pressure, not random chat",
      tr: "Rastgele sohbet yerine gerçek sınav baskısıyla çalış"
    },
    description: {
      en: "SpeakAce gives you timed IELTS-style speaking tasks so your practice feels close to the real speaking test.",
      tr: "SpeakAce, IELTS speaking sınavına benzeyen süreli görevler sunar; böylece çalışma deneyimin gerçek sınava daha çok yaklaşır."
    }
  },
  {
    title: {
      en: "See why your answer sounds weak",
      tr: "Cevabının neden zayıf kaldığını net gör"
    },
    description: {
      en: "Instead of generic praise, you get clear feedback on fluency, structure, vocabulary, and speaking control.",
      tr: "Genel övgüler yerine akıcılık, yapı, kelime kullanımı ve konuşma kontrolü hakkında net geri bildirim alırsın."
    }
  },
  {
    title: {
      en: "Turn every attempt into a better next attempt",
      tr: "Her denemeyi bir sonraki daha iyi denemeye çevir"
    },
    description: {
      en: "Your transcript, score estimate, model answer, and next-step guidance make each session useful for real score growth.",
      tr: "Transcript, puan tahmini, örnek güçlü cevap ve sonraki çalışma önerisi her oturumu gerçek skor gelişimi için daha değerli hale getirir."
    }
  }
];

export const standoutFeatures: FeatureItem[] = [
  {
    title: { en: "AI IELTS speaking feedback", tr: "AI destekli IELTS speaking geri bildirimi" },
    description: { en: "Get clear feedback after every response so you know exactly what to fix before your next speaking test.", tr: "Her cevaptan sonra net geri bildirim al ve bir sonraki speaking denemenden önce neyi düzeltmen gerektiğini açıkça gör." }
  },
  {
    title: { en: "Band score estimation", tr: "Band puan tahmini" },
    description: { en: "See an estimated speaking band score to understand how close you are to your IELTS target.", tr: "Hedef IELTS puanına ne kadar yakın olduğunu görmek için tahmini speaking band skorunu incele." }
  },
  {
    title: { en: "Pronunciation analysis", tr: "Telaffuz analizi" },
    description: { en: "Spot unclear sounds, weak endings, and rhythm issues that lower your speaking score.", tr: "Skorunu düşüren belirsiz sesleri, zayıf kelime sonlarını ve ritim sorunlarını fark et." }
  },
  {
    title: { en: "Real-time speaking evaluation flow", tr: "Gerçek zamanlı değerlendirme akışı" },
    description: { en: "Move from recording to transcript to feedback in one fast workflow that keeps practice simple.", tr: "Kayıttan transcript’e ve geri bildirime tek, hızlı bir akış içinde geçerek çalışmayı daha kolay hale getir." }
  },
  {
    title: { en: "IELTS-style questions", tr: "IELTS tarzı soru yapısı" },
    description: { en: "Train with questions built around IELTS speaking habits so your answers feel more exam-ready.", tr: "Cevapların sınava daha hazır hissedilsin diye IELTS speaking yapısına uygun sorularla çalış." }
  },
  {
    title: { en: "Speaking test simulator", tr: "Speaking test simülatörü" },
    description: { en: "Practice under timed conditions and build confidence before your real IELTS speaking exam.", tr: "Süreli koşullarda pratik yap ve gerçek IELTS speaking sınavından önce özgüven kazan." }
  },
  {
    title: { en: "Fluency improvement coaching", tr: "Akıcılık geliştirme koçluğu" },
    description: { en: "Learn how to speak longer, smoother, and with fewer pauses that interrupt your answer.", tr: "Cevabını bölen duraksamaları azaltarak daha uzun ve daha akıcı konuşmayı öğren." }
  },
  {
    title: { en: "Grammar correction guidance", tr: "Dil bilgisi düzeltme yönlendirmesi" },
    description: { en: "See where your grammar reduces clarity and how to answer in a cleaner, more natural way.", tr: "Dil bilginin netliği nerede düşürdüğünü gör ve daha temiz, daha doğal cevap kurmayı öğren." }
  },
  {
    title: { en: "Vocabulary upgrade suggestions", tr: "Kelime yükseltme önerileri" },
    description: { en: "Replace weak or repeated words with stronger vocabulary that fits IELTS speaking better.", tr: "Tekrarlanan veya zayıf kelimeleri IELTS speaking’e daha uygun güçlü kelimelerle değiştir." }
  },
  {
    title: { en: "Exact transcript review", tr: "Ham transcript inceleme" },
    description: { en: "Read what the system heard so you can catch unclear speech, pace issues, and missing words.", tr: "Sistemin ne duyduğunu okuyarak belirsiz konuşmayı, hız sorunlarını ve eksik kelimeleri fark et." }
  },
  {
    title: { en: "Improved sample answer", tr: "Geliştirilmiş örnek cevap" },
    description: { en: "See how your idea can be turned into a higher-quality IELTS answer without losing the main meaning.", tr: "Ana fikri kaybetmeden cevabının daha güçlü bir IELTS cevabına nasıl dönüştürülebileceğini gör." }
  },
  {
    title: { en: "Line-by-line rewrite support", tr: "Satır satır yeniden yazım desteği" },
    description: { en: "Understand how each part of your answer can sound clearer, stronger, and more score-friendly.", tr: "Cevabının her bölümünün nasıl daha net, daha güçlü ve skora daha uygun hale gelebileceğini anla." }
  },
  {
    title: { en: "Cue card practice", tr: "Cue card pratiği" },
    description: { en: "Practice IELTS Speaking Part 2 with structured cue-card prompts and preparation flow.", tr: "IELTS Speaking Part 2’yi yapılandırılmış cue-card akışıyla çalış." }
  },
  {
    title: { en: "Part-by-part IELTS training", tr: "Parça bazlı IELTS çalışması" },
    description: { en: "Train separately for Part 1, Part 2, and Part 3 so you improve the exact format you need.", tr: "İhtiyacın olan formata özel gelişmek için Part 1, Part 2 ve Part 3’ü ayrı ayrı çalış." }
  },
  {
    title: { en: "TOEFL speaking mode", tr: "TOEFL speaking modu" },
    description: { en: "Use the same platform to practice TOEFL tasks with timed integrated speaking structure.", tr: "Aynı platformda TOEFL speaking görevlerini de süreli integrated yapı ile çalış." }
  },
  {
    title: { en: "Pronunciation-only drill mode", tr: "Sadece telaffuz odaklı çalışma modu" },
    description: { en: "Focus only on clarity, endings, stress, and sound control when pronunciation needs extra work.", tr: "Telaffuz daha fazla çalışma istiyorsa sadece netlik, vurgu, son sesler ve ses kontrolüne odaklan." }
  },
  {
    title: { en: "Goal-based practice drills", tr: "Hedef odaklı çalışma drill’leri" },
    description: { en: "Choose fluency, pronunciation, or topic development drills based on your weakest speaking skill.", tr: "En zayıf speaking alanına göre akıcılık, telaffuz veya konu geliştirme drill’leri seç." }
  },
  {
    title: { en: "Adaptive question selection", tr: "Uyarlanabilir soru seçimi" },
    description: { en: "The platform can push you toward the task types and skills that need the most practice.", tr: "Platform seni en çok çalışman gereken görev tiplerine ve becerilere yönlendirebilir." }
  },
  {
    title: { en: "Retry the same question", tr: "Aynı soruyu yeniden dene" },
    description: { en: "Repeat a weak answer immediately and measure whether your second attempt is actually better.", tr: "Zayıf bir cevabı hemen tekrar dene ve ikinci denemenin gerçekten daha iyi olup olmadığını gör." }
  },
  {
    title: { en: "Progress tracking dashboard", tr: "İlerleme takip paneli" },
    description: { en: "Track score trend, best score, weak skills, and next study focus in one place.", tr: "Skor trendini, en iyi skorunu, zayıf alanlarını ve sonraki çalışma odağını tek yerde izle." }
  },
  {
    title: { en: "Streak and weekly goals", tr: "Seri ve haftalık hedefler" },
    description: { en: "Stay consistent with streaks and small weekly goals that make IELTS speaking practice easier to sustain.", tr: "IELTS speaking pratiğini daha sürdürülebilir kılan küçük haftalık hedefler ve çalışma serileriyle düzenini koru." }
  },
  {
    title: { en: "Saved retry queue", tr: "Kayıtlı tekrar kuyruğu" },
    description: { en: "Save hard prompts and come back later when you want focused score improvement practice.", tr: "Zorlandığın soruları kaydet ve hedefli gelişim çalışması yapmak istediğinde onlara geri dön." }
  },
  {
    title: { en: "Bookmark and study lists", tr: "Yer işaretleri ve çalışma listeleri" },
    description: { en: "Organize useful prompts into study lists so revision feels structured, not random.", tr: "Faydalı soruları çalışma listelerinde toplayarak tekrar sürecini rastgele değil daha planlı hale getir." }
  },
  {
    title: { en: "Mock exam mode", tr: "Mock exam modu" },
    description: { en: "Simulate a fuller speaking experience and build the focus needed for the real exam day.", tr: "Daha tam bir speaking deneyimini simüle et ve gerçek sınav günü için gereken odak gücünü geliştir." }
  },
  {
    title: { en: "Session replay", tr: "Oturum tekrar ekranı" },
    description: { en: "Replay audio, transcript, model answer, and notes so you can learn from one attempt more deeply.", tr: "Ses kaydı, transcript, örnek cevap ve notları tekrar inceleyerek tek bir denemeden daha derin öğren." }
  },
  {
    title: { en: "Teacher and class tools", tr: "Öğretmen ve sınıf araçları" },
    description: { en: "Language schools and teachers can track student speaking progress, assign homework, and review attempts.", tr: "Dil kursları ve öğretmenler öğrenci speaking gelişimini izleyebilir, ödev atayabilir ve denemeleri inceleyebilir." }
  },
  {
    title: { en: "Homework and coaching flow", tr: "Ödev ve koçluk akışı" },
    description: { en: "Teachers can turn weak speaking patterns into homework that targets the next score jump.", tr: "Öğretmenler zayıf speaking alışkanlıklarını bir sonraki skor artışını hedefleyen ödevlere çevirebilir." }
  },
  {
    title: { en: "Notifications and reminders", tr: "Bildirimler ve hatırlatmalar" },
    description: { en: "Keep learners moving with reminders, pending tasks, and clear next-step prompts.", tr: "Hatırlatmalar, bekleyen görevler ve net sonraki adımlarla öğrencinin çalışmaya devam etmesini sağla." }
  },
  {
    title: { en: "Institution analytics", tr: "Kurum analitiği" },
    description: { en: "Schools can see active learners, weak-skill patterns, and progress signals across classes.", tr: "Kurumlar sınıflar genelinde aktif öğrenci, zayıf beceri desenleri ve gelişim sinyallerini görebilir." }
  },
  {
    title: { en: "Live web app with no install", tr: "Kurulum gerektirmeyen canlı web uygulaması" },
    description: { en: "Users can start speaking practice in the browser without downloading extra software.", tr: "Kullanıcılar ekstra program indirmeden doğrudan tarayıcıdan speaking pratiğine başlayabilir." }
  }
];

export const shortLandingPoints: LocalizedText[] = [
  {
    en: "Timed IELTS speaking practice with AI feedback",
    tr: "AI geri bildirimli süreli IELTS speaking pratiği"
  },
  {
    en: "Estimated band score after each answer",
    tr: "Her cevaptan sonra tahmini band skoru"
  },
  {
    en: "Pronunciation, fluency, grammar, and structure review",
    tr: "Telaffuz, akıcılık, dil bilgisi ve yapı incelemesi"
  },
  {
    en: "Perfect for students who want a better IELTS speaking score",
    tr: "IELTS speaking skorunu yükseltmek isteyen öğrenciler için ideal"
  }
];

export const blogPosts: BlogPost[] = [
  {
    slug: "improve-ielts-speaking-score",
    title: "How to Improve Your IELTS Speaking Score Faster",
    description: "Simple ways to improve your IELTS speaking score with better fluency, clearer answers, and smarter daily practice.",
    keywords: ["improve IELTS speaking score", "IELTS speaking practice", "IELTS band score speaking"],
    intro: "Improving your IELTS speaking score is not only about speaking more. It is about speaking in a clearer, more organized, and more confident way under test conditions.",
    sections: [
      {
        title: "Start with timed practice",
        body: [
          "Many students speak well in casual conversation but freeze when a timer starts. Timed practice helps you build the speaking control you need on exam day.",
          "When you practice with realistic timing, you learn how to start faster, organize ideas better, and finish with less panic."
        ]
      },
      {
        title: "Fix fluency before advanced vocabulary",
        body: [
          "A smoother answer with simple but clear English often scores better than a broken answer with difficult words.",
          "Work on fewer pauses, cleaner linking, and steady speech before chasing fancy vocabulary."
        ]
      },
      {
        title: "Review your transcript",
        body: [
          "Your transcript shows where your answer becomes unclear, repetitive, or off-topic.",
          "If you can see your exact response, it becomes much easier to understand why your score is stuck."
        ]
      },
      {
        title: "Repeat weak questions",
        body: [
          "One of the fastest ways to improve is to retry the same prompt and aim for a better second answer.",
          "This helps you turn feedback into action instead of reading tips and forgetting them."
        ]
      }
    ]
  },
  {
    slug: "ielts-speaking-practice-with-ai",
    title: "Why IELTS Speaking Practice with AI Can Save You Time",
    description: "See how AI IELTS speaking practice can help you get faster feedback, more daily speaking practice, and clearer next steps.",
    keywords: ["IELTS speaking AI", "AI English speaking practice", "IELTS speaking feedback"],
    intro: "Students often waste time because they do not know what is wrong with their speaking answers. AI practice can shorten that loop.",
    sections: [
      {
        title: "Get feedback after every answer",
        body: [
          "Instead of waiting for a teacher or mock test, you can see your transcript, score estimate, and next-step advice right after a speaking attempt.",
          "This makes daily practice easier to sustain because every answer teaches you something."
        ]
      },
      {
        title: "Practice more often with less friction",
        body: [
          "A browser-based speaking tool removes setup friction. You can open the app, answer a prompt, and review your result in minutes.",
          "That speed matters because IELTS speaking improvement comes from repetition, not from occasional long study sessions."
        ]
      },
      {
        title: "Learn from model answers",
        body: [
          "Seeing a stronger sample answer helps you understand structure, idea development, and natural phrasing.",
          "This is especially useful for students who know English but struggle to sound organized in speaking tasks."
        ]
      }
    ]
  },
  {
    slug: "speaking-test-simulator-ielts",
    title: "How an IELTS Speaking Test Simulator Builds Real Confidence",
    description: "Use an IELTS speaking test simulator to practice under exam pressure and improve your confidence before test day.",
    keywords: ["speaking test simulator IELTS", "IELTS mock speaking", "IELTS speaking confidence"],
    intro: "Confidence does not come from reading tips. It comes from repeating the speaking process until the exam feels familiar.",
    sections: [
      {
        title: "Pressure becomes normal",
        body: [
          "When you train inside a speaking simulator, timers and exam-style tasks stop feeling scary.",
          "You begin to expect the pressure instead of reacting badly to it."
        ]
      },
      {
        title: "You learn to recover quickly",
        body: [
          "Even strong students make small mistakes. The real skill is knowing how to continue without losing control.",
          "Simulation practice teaches you to keep speaking even when an answer starts badly."
        ]
      },
      {
        title: "Your weak task types become visible",
        body: [
          "Some students do fine in Part 1 but struggle in Part 2. Others lose clarity in follow-up discussion tasks.",
          "A speaking simulator helps you see exactly which format needs more work."
        ]
      }
    ]
  }
];

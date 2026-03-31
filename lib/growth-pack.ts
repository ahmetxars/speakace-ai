export type GrowthCard = {
  title: string;
  description: string;
  href: string;
  cta: string;
};

export type LocalizedGrowthCards = {
  en: GrowthCard[];
  tr: GrowthCard[];
};

export const studyTracks: LocalizedGrowthCards = {
  en: [
    {
      title: "Band 5.5 to 6.0 track",
      description: "Start with easier structures, stronger Part 1 answers, and fewer long pauses.",
      href: "/guides/ielts-speaking-answer-structure",
      cta: "Open structure guide"
    },
    {
      title: "Band 6.0 to 6.5 track",
      description: "Build stronger examples, cleaner transitions, and more stable follow-up answers.",
      href: "/guides/ielts-speaking-band-6-to-7",
      cta: "See score path"
    },
    {
      title: "Pronunciation repair track",
      description: "Use clarity, stress, and rhythm drills when your answers sound weaker than your ideas.",
      href: "/guides/improve-ielts-speaking-pronunciation",
      cta: "Practice pronunciation"
    },
    {
      title: "Teacher and school track",
      description: "Use classes, homework, analytics, and study lists to keep speaking practice active between lessons.",
      href: "/for-teachers",
      cta: "Open teacher page"
    }
  ],
  tr: [
    {
      title: "Band 5.5 to 6.0 yolu",
      description: "Daha basit yapı, daha güçlü Part 1 cevapları ve daha az uzun duraksamayla başla.",
      href: "/guides/ielts-speaking-answer-structure",
      cta: "Yapı rehberini aç"
    },
    {
      title: "Band 6.0 to 6.5 yolu",
      description: "Daha iyi örnekler, daha temiz geçişler ve daha stabil follow-up cevapları kur.",
      href: "/guides/ielts-speaking-band-6-to-7",
      cta: "Skor yolunu gör"
    },
    {
      title: "Telaffuz onarım yolu",
      description: "Fikirlerin iyi ama cevaplar zayıf duyuluyorsa netlik, vurgu ve ritim drill’leri kullan.",
      href: "/guides/improve-ielts-speaking-pronunciation",
      cta: "Telaffuz çalış"
    },
    {
      title: "Öğretmen ve kurum yolu",
      description: "Sınıf, ödev, analitik ve study list yapısıyla speaking pratiğini ders arasında da canlı tut.",
      href: "/for-teachers",
      cta: "Öğretmen sayfasını aç"
    }
  ]
};

export const freePacks: LocalizedGrowthCards = {
  en: [
    {
      title: "7-day speaking restart",
      description: "A gentle challenge for learners who lost momentum and need an easy way back in.",
      href: "/weekly-ielts-speaking-challenge",
      cta: "Start challenge"
    },
    {
      title: "Free speaking test",
      description: "Record one answer, check the transcript, and feel how the product works before paying.",
      href: "/free-ielts-speaking-test",
      cta: "Take free test"
    },
    {
      title: "Daily prompt archive",
      description: "Use one practical prompt a day when you want speaking consistency without extra planning.",
      href: "/daily-ielts-speaking-prompt",
      cta: "See daily prompt"
    },
    {
      title: "Sample answers library",
      description: "Study real answer shapes before you record your own version.",
      href: "/ielts-speaking-sample-answers",
      cta: "Open sample answers"
    }
  ],
  tr: [
    {
      title: "7 günlük speaking dönüşü",
      description: "Düzeni bozulan öğrenciler için kolay geri dönüş sağlayan yumuşak bir challenge.",
      href: "/weekly-ielts-speaking-challenge",
      cta: "Challenge’ı başlat"
    },
    {
      title: "Ücretsiz speaking test",
      description: "Bir cevap kaydet, transcript’i incele ve ürünü ödeme yapmadan önce hisset.",
      href: "/free-ielts-speaking-test",
      cta: "Ücretsiz testi çöz"
    },
    {
      title: "Günlük prompt arşivi",
      description: "Ekstra plan yapmadan speaking düzeni kurmak için her gün tek kullanımlık pratik prompt’lar.",
      href: "/daily-ielts-speaking-prompt",
      cta: "Günlük prompt’u gör"
    },
    {
      title: "Örnek cevap kütüphanesi",
      description: "Kendi cevabını kaydetmeden önce gerçek cevap yapılarını incele.",
      href: "/ielts-speaking-sample-answers",
      cta: "Örnek cevapları aç"
    }
  ]
};

export const roadmapCards: LocalizedGrowthCards = {
  en: [
    {
      title: "Today",
      description: "Do one timed answer, review the transcript, and fix one repeated weakness.",
      href: "/app/practice",
      cta: "Start today"
    },
    {
      title: "This week",
      description: "Repeat one weak prompt, finish one challenge session, and compare your second answer.",
      href: "/app/study-lists",
      cta: "Open weekly plan"
    },
    {
      title: "This month",
      description: "Use mock sessions, topic pages, and study lists to turn practice into a stable score habit.",
      href: "/resources",
      cta: "Open resources"
    }
  ],
  tr: [
    {
      title: "Bugün",
      description: "Bir süreli cevap çöz, transcript’i incele ve tekrar eden tek bir zayıf noktayı düzelt.",
      href: "/app/practice",
      cta: "Bugünü başlat"
    },
    {
      title: "Bu hafta",
      description: "Bir zayıf soruyu tekrar çöz, bir challenge oturumunu tamamla ve ikinci cevabını kıyasla.",
      href: "/app/study-lists",
      cta: "Haftalık planı aç"
    },
    {
      title: "Bu ay",
      description: "Mock oturumlar, topic sayfaları ve study list’lerle pratiği düzenli skor alışkanlığına çevir.",
      href: "/resources",
      cta: "Kaynakları aç"
    }
  ]
};

export const dashboardRecommendations: Record<string, { href: string; label: string; trLabel: string }> = {
  "Fluency and Coherence": {
    href: "/guides/ielts-speaking-fluency-tips",
    label: "Open fluency guide",
    trLabel: "Akıcılık rehberini aç"
  },
  "Lexical Resource": {
    href: "/guides/ielts-speaking-vocabulary-tips",
    label: "Open vocabulary guide",
    trLabel: "Kelime rehberini aç"
  },
  "Grammatical Range and Accuracy": {
    href: "/guides/ielts-speaking-answer-structure",
    label: "Open structure guide",
    trLabel: "Yapı rehberini aç"
  },
  Pronunciation: {
    href: "/guides/improve-ielts-speaking-pronunciation",
    label: "Open pronunciation guide",
    trLabel: "Telaffuz rehberini aç"
  },
  Delivery: {
    href: "/guides/how-to-reduce-pauses-in-ielts-speaking",
    label: "Open pace guide",
    trLabel: "Ritim rehberini aç"
  },
  "Language Use": {
    href: "/guides/ielts-speaking-vocabulary-tips",
    label: "Open language guide",
    trLabel: "Dil kullanım rehberini aç"
  },
  "Topic Development": {
    href: "/ielts-speaking-sample-answers",
    label: "See sample answers",
    trLabel: "Örnek cevapları gör"
  }
};

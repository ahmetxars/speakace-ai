export const copy = {
  en: {
    brand: "SpeakAce AI",
    tagline: "Practice TOEFL and IELTS speaking with an AI coach.",
    nav: {
      practice: "Practice",
      pricing: "Pricing",
      billing: "Billing",
      settings: "Settings",
      signIn: "Sign in",
      signOut: "Sign out",
      dashboard: "Dashboard"
    }
  },
  tr: {
    brand: "SpeakAce AI",
    tagline: "TOEFL ve IELTS speaking icin yapay zeka kocuyla pratik yap.",
    nav: {
      practice: "Pratik",
      pricing: "Fiyatlar",
      billing: "Odeme",
      settings: "Ayarlar",
      signIn: "Giris yap",
      signOut: "Cikis yap",
      dashboard: "Panel"
    }
  }
} as const;

export type Language = keyof typeof copy;

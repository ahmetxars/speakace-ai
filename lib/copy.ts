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
    tagline: "TOEFL ve IELTS speaking için yapay zekâ destekli koçla pratik yap.",
    nav: {
      practice: "Pratik",
      pricing: "Fiyatlar",
      billing: "Ödeme",
      settings: "Ayarlar",
      signIn: "Giriş yap",
      signOut: "Çıkış yap",
      dashboard: "Panel"
    }
  }
} as const;

export type Language = keyof typeof copy;

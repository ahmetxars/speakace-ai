export const localeOptions = [
  { code: "en", flag: "🇺🇸", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "tr", flag: "🇹🇷", label: "Turkish", nativeLabel: "Türkçe", dir: "ltr" },
  { code: "de", flag: "🇩🇪", label: "German", nativeLabel: "Deutsch", dir: "ltr" },
  { code: "es", flag: "🇪🇸", label: "Spanish", nativeLabel: "Español", dir: "ltr" },
  { code: "fr", flag: "🇫🇷", label: "French", nativeLabel: "Français", dir: "ltr" },
  { code: "it", flag: "🇮🇹", label: "Italian", nativeLabel: "Italiano", dir: "ltr" },
  { code: "pt", flag: "🇵🇹", label: "Portuguese", nativeLabel: "Português", dir: "ltr" },
  { code: "nl", flag: "🇳🇱", label: "Dutch", nativeLabel: "Nederlands", dir: "ltr" },
  { code: "pl", flag: "🇵🇱", label: "Polish", nativeLabel: "Polski", dir: "ltr" },
  { code: "ru", flag: "🇷🇺", label: "Russian", nativeLabel: "Русский", dir: "ltr" },
  { code: "ar", flag: "🇸🇦", label: "Arabic", nativeLabel: "العربية", dir: "rtl" },
  { code: "ja", flag: "🇯🇵", label: "Japanese", nativeLabel: "日本語", dir: "ltr" },
  { code: "ko", flag: "🇰🇷", label: "Korean", nativeLabel: "한국어", dir: "ltr" }
] as const;

export type Language = (typeof localeOptions)[number]["code"];
export type LocaleMeta = (typeof localeOptions)[number];

type CopyShape = {
  brand: string;
  tagline: string;
  nav: {
    practice: string;
    pricing: string;
    billing: string;
    settings: string;
    signIn: string;
    signOut: string;
    dashboard: string;
  };
};

const copyMap: Record<Language, CopyShape> = {
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
  },
  de: {
    brand: "SpeakAce AI",
    tagline: "Übe TOEFL- und IELTS-Speaking mit einem KI-Coach.",
    nav: {
      practice: "Üben",
      pricing: "Preise",
      billing: "Abrechnung",
      settings: "Einstellungen",
      signIn: "Anmelden",
      signOut: "Abmelden",
      dashboard: "Dashboard"
    }
  },
  es: {
    brand: "SpeakAce AI",
    tagline: "Practica speaking de TOEFL e IELTS con un coach de IA.",
    nav: {
      practice: "Practicar",
      pricing: "Precios",
      billing: "Pagos",
      settings: "Ajustes",
      signIn: "Iniciar sesión",
      signOut: "Cerrar sesión",
      dashboard: "Panel"
    }
  },
  fr: {
    brand: "SpeakAce AI",
    tagline: "Travaille l’oral TOEFL et IELTS avec un coach IA.",
    nav: {
      practice: "Pratique",
      pricing: "Tarifs",
      billing: "Paiement",
      settings: "Réglages",
      signIn: "Connexion",
      signOut: "Déconnexion",
      dashboard: "Tableau"
    }
  },
  it: {
    brand: "SpeakAce AI",
    tagline: "Esercitati nello speaking TOEFL e IELTS con un coach IA.",
    nav: {
      practice: "Pratica",
      pricing: "Prezzi",
      billing: "Pagamenti",
      settings: "Impostazioni",
      signIn: "Accedi",
      signOut: "Esci",
      dashboard: "Dashboard"
    }
  },
  pt: {
    brand: "SpeakAce AI",
    tagline: "Pratique speaking de TOEFL e IELTS com um coach de IA.",
    nav: {
      practice: "Praticar",
      pricing: "Preços",
      billing: "Cobrança",
      settings: "Configurações",
      signIn: "Entrar",
      signOut: "Sair",
      dashboard: "Painel"
    }
  },
  nl: {
    brand: "SpeakAce AI",
    tagline: "Oefen TOEFL- en IELTS-spreken met een AI-coach.",
    nav: {
      practice: "Oefenen",
      pricing: "Prijzen",
      billing: "Facturatie",
      settings: "Instellingen",
      signIn: "Inloggen",
      signOut: "Uitloggen",
      dashboard: "Dashboard"
    }
  },
  pl: {
    brand: "SpeakAce AI",
    tagline: "Ćwicz speaking TOEFL i IELTS z trenerem AI.",
    nav: {
      practice: "Ćwiczenia",
      pricing: "Cennik",
      billing: "Płatności",
      settings: "Ustawienia",
      signIn: "Zaloguj się",
      signOut: "Wyloguj się",
      dashboard: "Panel"
    }
  },
  ru: {
    brand: "SpeakAce AI",
    tagline: "Практикуйте speaking TOEFL и IELTS с AI-коучем.",
    nav: {
      practice: "Практика",
      pricing: "Цены",
      billing: "Оплата",
      settings: "Настройки",
      signIn: "Войти",
      signOut: "Выйти",
      dashboard: "Панель"
    }
  },
  ar: {
    brand: "SpeakAce AI",
    tagline: "تدرّب على محادثة TOEFL وIELTS مع مدرب ذكاء اصطناعي.",
    nav: {
      practice: "التدريب",
      pricing: "الأسعار",
      billing: "الفوترة",
      settings: "الإعدادات",
      signIn: "تسجيل الدخول",
      signOut: "تسجيل الخروج",
      dashboard: "اللوحة"
    }
  },
  ja: {
    brand: "SpeakAce AI",
    tagline: "AIコーチとTOEFL・IELTSスピーキングを練習。",
    nav: {
      practice: "練習",
      pricing: "料金",
      billing: "請求",
      settings: "設定",
      signIn: "ログイン",
      signOut: "ログアウト",
      dashboard: "ダッシュボード"
    }
  },
  ko: {
    brand: "SpeakAce AI",
    tagline: "AI 코치와 TOEFL·IELTS 스피킹을 연습하세요.",
    nav: {
      practice: "연습",
      pricing: "요금",
      billing: "결제",
      settings: "설정",
      signIn: "로그인",
      signOut: "로그아웃",
      dashboard: "대시보드"
    }
  }
};

export const copy = copyMap;
export const defaultLanguage: Language = "en";
export const languageMeta = Object.fromEntries(localeOptions.map((item) => [item.code, item])) as Record<Language, LocaleMeta>;

export function isSupportedLanguage(value: string | null | undefined): value is Language {
  if (!value) return false;
  return localeOptions.some((item) => item.code === value);
}

export function getLanguageDirection(language: Language) {
  return languageMeta[language].dir;
}

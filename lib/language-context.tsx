"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "tr" | "nl" | "de" | "fr" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations: Record<Language, Record<string, string>> = {
  en: {
    "nav.home": "Home",
    "nav.pricing": "Pricing",
    "nav.blog": "Blog",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin",
    "nav.logout": "Logout",
    "nav.login": "Login",
    "hero.title": "Your IELTS Speaking Score, Finally Moving",
    "hero.subtitle": "Practice real exam questions. Get instant AI feedback. Retry smarter.",
    "hero.cta": "Start Speaking Free",
    "hero.no-signup": "No signup required",
    "hero.free-forever": "Free forever",
    "hero.active-learners": "1,000+ active learners",
    "footer.copyright": "© 2024 SpeakAce. All rights reserved.",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.contact": "Contact"
  },
  tr: {
    "nav.home": "Anasayfa",
    "nav.pricing": "Fiyatlandırma",
    "nav.blog": "Blog",
    "nav.about": "Hakkında",
    "nav.contact": "İletişim",
    "nav.dashboard": "Kontrol Paneli",
    "nav.admin": "Yönetici",
    "nav.logout": "Çıkış",
    "nav.login": "Giriş",
    "hero.title": "IELTS Konuşma Puanınız, Sonunda İlerleme Yapıyor",
    "hero.subtitle": "Gerçek sınav sorularını pratik yapın. Anında yapay zeka geri bildirimi alın. Daha akıllı bir şekilde yeniden deneyin.",
    "hero.cta": "Ücretsiz Konuşmaya Başla",
    "hero.no-signup": "Kayıt gerekli değil",
    "hero.free-forever": "Sonsuza kadar ücretsiz",
    "hero.active-learners": "1.000+ aktif öğrenci",
    "footer.copyright": "© 2024 SpeakAce. Tüm hakları saklıdır.",
    "footer.privacy": "Gizlilik Politikası",
    "footer.terms": "Hizmet Şartları",
    "footer.contact": "İletişim"
  },
  nl: {
    "nav.home": "Startpagina",
    "nav.pricing": "Prijzen",
    "nav.blog": "Blog",
    "nav.about": "Over ons",
    "nav.contact": "Contact",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Beheerder",
    "nav.logout": "Afmelden",
    "nav.login": "Aanmelden",
    "hero.title": "Je IELTS-spreekvaardigheid, eindelijk vooruitgang",
    "hero.subtitle": "Oefen echte examenopgaven. Krijg instant AI-feedback. Probeer slimmer opnieuw.",
    "hero.cta": "Gratis spreken starten",
    "hero.no-signup": "Geen registratie vereist",
    "hero.free-forever": "Altijd gratis",
    "hero.active-learners": "1.000+ actieve leerlingen",
    "footer.copyright": "© 2024 SpeakAce. Alle rechten voorbehouden.",
    "footer.privacy": "Privacybeleid",
    "footer.terms": "Servicevoorwaarden",
    "footer.contact": "Contact"
  },
  de: {
    "nav.home": "Startseite",
    "nav.pricing": "Preise",
    "nav.blog": "Blog",
    "nav.about": "Über uns",
    "nav.contact": "Kontakt",
    "nav.dashboard": "Dashboard",
    "nav.admin": "Administrator",
    "nav.logout": "Abmelden",
    "nav.login": "Anmelden",
    "hero.title": "Deine IELTS-Sprechfähigkeit, endlich Fortschritt",
    "hero.subtitle": "Übe echte Prüfungsfragen. Erhalte sofortiges KI-Feedback. Versuche es intelligenter.",
    "hero.cta": "Kostenlos sprechen beginnen",
    "hero.no-signup": "Keine Registrierung erforderlich",
    "hero.free-forever": "Immer kostenlos",
    "hero.active-learners": "1.000+ aktive Lernende",
    "footer.copyright": "© 2024 SpeakAce. Alle Rechte vorbehalten.",
    "footer.privacy": "Datenschutzrichtlinie",
    "footer.terms": "Nutzungsbedingungen",
    "footer.contact": "Kontakt"
  },
  fr: {
    "nav.home": "Accueil",
    "nav.pricing": "Tarification",
    "nav.blog": "Blog",
    "nav.about": "À propos",
    "nav.contact": "Contact",
    "nav.dashboard": "Tableau de bord",
    "nav.admin": "Administrateur",
    "nav.logout": "Déconnexion",
    "nav.login": "Connexion",
    "hero.title": "Votre score d'expression orale IELTS, enfin en progrès",
    "hero.subtitle": "Pratiquez des questions d'examen réelles. Obtenez des commentaires IA instantanés. Réessayez plus intelligemment.",
    "hero.cta": "Commencer à parler gratuitement",
    "hero.no-signup": "Aucune inscription requise",
    "hero.free-forever": "Toujours gratuit",
    "hero.active-learners": "1 000+ apprenants actifs",
    "footer.copyright": "© 2024 SpeakAce. Tous droits réservés.",
    "footer.privacy": "Politique de confidentialité",
    "footer.terms": "Conditions d'utilisation",
    "footer.contact": "Contact"
  },
  es: {
    "nav.home": "Inicio",
    "nav.pricing": "Precios",
    "nav.blog": "Blog",
    "nav.about": "Acerca de",
    "nav.contact": "Contacto",
    "nav.dashboard": "Panel de control",
    "nav.admin": "Administrador",
    "nav.logout": "Cerrar sesión",
    "nav.login": "Iniciar sesión",
    "hero.title": "Tu puntuación de expresión oral IELTS, finalmente avanzando",
    "hero.subtitle": "Practica preguntas de examen reales. Obtén comentarios de IA instantáneos. Intenta de nuevo de manera más inteligente.",
    "hero.cta": "Comenzar a hablar gratis",
    "hero.no-signup": "No se requiere registro",
    "hero.free-forever": "Siempre gratis",
    "hero.active-learners": "1.000+ alumnos activos",
    "footer.copyright": "© 2024 SpeakAce. Todos los derechos reservados.",
    "footer.privacy": "Política de privacidad",
    "footer.terms": "Términos de servicio",
    "footer.contact": "Contacto"
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load language from localStorage
    const saved = localStorage.getItem("language") as Language | null;
    if (saved && Object.keys(translations).includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string, defaultValue?: string): string => {
    return translations[language]?.[key] || defaultValue || key;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

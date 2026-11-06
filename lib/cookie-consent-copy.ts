import type { PublicLanguage } from "@/lib/copy";

type CookieCopy = {
  settings: string;
  label: string;
  title: string;
  body: string;
  policy: string;
  necessary: string;
  necessaryBody: string;
  analytics: string;
  analyticsBody: string;
  disabled: string;
  reject: string;
  allow: string;
  save: string;
  manage: string;
};
export const cookieConsentCopy: Record<PublicLanguage, CookieCopy> = {
  en: {
    settings: "Cookie settings",
    label: "Cookie preferences",
    title: "Your privacy. Your choice.",
    body: "Necessary cookies keep sign-in and your chosen settings working. Optional usage analytics run only with your permission. You can use the site if you decline.",
    policy: "Cookie policy",
    necessary: "Necessary",
    necessaryBody:
      "Sign-in, security, language and your consent choice. Always on.",
    analytics: "Analytics",
    analyticsBody:
      "Helps us understand which pages and features are used. Off by default.",
    disabled: "Advertising and third-party session recording are disabled.",
    reject: "Reject optional",
    allow: "Allow analytics",
    save: "Save preferences",
    manage: "Manage preferences",
  },
  tr: {
    settings: "Çerez tercihleri",
    label: "Çerez tercihleri",
    title: "Gizlilik senin elinde.",
    body: "Oturum açma ve seçtiğin ayarları hatırlamak için gerekli çerezleri kullanıyoruz. İsteğe bağlı kullanım analitiği yalnızca izin verirsen çalışır. Reddederek de siteyi kullanabilirsin.",
    policy: "Çerez politikası",
    necessary: "Gerekli",
    necessaryBody: "Oturum, güvenlik, dil ve izin tercihin. Her zaman açık.",
    analytics: "Analitik",
    analyticsBody:
      "Hangi sayfa ve özelliklerin kullanıldığını anlamamıza yardımcı olur. Varsayılan kapalı.",
    disabled: "Reklam ve üçüncü taraf oturum kaydı araçları devre dışı.",
    reject: "İsteğe bağlıları reddet",
    allow: "Analitiğe izin ver",
    save: "Tercihlerimi kaydet",
    manage: "Tercihleri düzenle",
  },
  de: {
    settings: "Cookie-Einstellungen",
    label: "Cookie-Präferenzen",
    title: "Deine Privatsphäre. Deine Wahl.",
    body: "Notwendige Cookies ermöglichen Anmeldung und gewählte Einstellungen. Optionale Nutzungsanalysen laufen nur mit deiner Erlaubnis. Du kannst die Website auch bei Ablehnung nutzen.",
    policy: "Cookie-Richtlinie",
    necessary: "Notwendig",
    necessaryBody:
      "Anmeldung, Sicherheit, Sprache und Einwilligung. Immer aktiv.",
    analytics: "Analyse",
    analyticsBody:
      "Hilft uns zu verstehen, welche Seiten und Funktionen genutzt werden. Standardmäßig aus.",
    disabled:
      "Werbung und Sitzungsaufzeichnungen durch Drittanbieter sind deaktiviert.",
    reject: "Optionale ablehnen",
    allow: "Analyse erlauben",
    save: "Auswahl speichern",
    manage: "Auswahl anpassen",
  },
  es: {
    settings: "Ajustes de cookies",
    label: "Preferencias de cookies",
    title: "Tu privacidad. Tu elección.",
    body: "Las cookies necesarias permiten iniciar sesión y recordar tus ajustes. Las analíticas opcionales solo funcionan con tu permiso. Puedes usar la web aunque las rechaces.",
    policy: "Política de cookies",
    necessary: "Necesarias",
    necessaryBody:
      "Inicio de sesión, seguridad, idioma y consentimiento. Siempre activas.",
    analytics: "Analítica",
    analyticsBody:
      "Nos ayuda a entender qué páginas y funciones se utilizan. Desactivada por defecto.",
    disabled:
      "La publicidad y la grabación de sesiones por terceros están desactivadas.",
    reject: "Rechazar opcionales",
    allow: "Permitir analítica",
    save: "Guardar preferencias",
    manage: "Gestionar preferencias",
  },
  fr: {
    settings: "Réglages des cookies",
    label: "Préférences des cookies",
    title: "Votre vie privée. Votre choix.",
    body: "Les cookies nécessaires assurent la connexion et mémorisent vos réglages. Les analyses facultatives ne fonctionnent qu’avec votre permission. Le site reste accessible en cas de refus.",
    policy: "Politique de cookies",
    necessary: "Nécessaires",
    necessaryBody:
      "Connexion, sécurité, langue et consentement. Toujours actifs.",
    analytics: "Analyse",
    analyticsBody:
      "Nous aide à comprendre l’utilisation des pages et fonctions. Désactivée par défaut.",
    disabled:
      "La publicité et l’enregistrement de sessions par des tiers sont désactivés.",
    reject: "Refuser les facultatifs",
    allow: "Autoriser l’analyse",
    save: "Enregistrer les choix",
    manage: "Gérer les choix",
  },
};

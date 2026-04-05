import type { Metadata } from "next";
import type { Language } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

const termsCopy = {
  en: {
    title: "Terms of Use",
    description: "Read the terms that apply when using SpeakAce.",
    eyebrow: "Terms",
    heading: "Terms of Use",
    intro:
      "By using SpeakAce, you agree to use the platform responsibly and only for lawful personal, educational, or school-related purposes.",
    service: "Use of the service",
    serviceText:
      "SpeakAce provides AI-assisted speaking practice, estimated feedback, and study tools. The service is for preparation and learning support, not official exam scoring.",
    accounts: "Accounts",
    accountsText:
      "You are responsible for the accuracy of your account information and for keeping your login credentials secure.",
    payments: "Payments and subscriptions",
    paymentsText:
      "Paid plans may unlock extra speaking minutes, deeper feedback, and advanced product features. Pricing and plan terms can change over time.",
    contact: "Contact",
    contactText: "If you have a legal or account question, contact us at"
  },
  tr: {
    title: "Kullanım Şartları",
    description: "SpeakAce kullanırken geçerli olan şartları okuyun.",
    eyebrow: "Şartlar",
    heading: "Kullanım Şartları",
    intro:
      "SpeakAce'i kullanarak platformu sorumlu şekilde ve yalnızca yasal kişisel, eğitim veya okul amaçları için kullanmayı kabul etmiş olursunuz.",
    service: "Hizmetin kullanımı",
    serviceText:
      "SpeakAce, yapay zekâ destekli speaking pratiği, tahmini geri bildirim ve çalışma araçları sunar. Hizmet resmi sınav puanlaması değil, hazırlık ve öğrenme desteği içindir.",
    accounts: "Hesaplar",
    accountsText:
      "Hesap bilgilerinizin doğruluğundan ve giriş bilgilerinizin güvenliğini korumaktan siz sorumlusunuz.",
    payments: "Ödemeler ve abonelikler",
    paymentsText:
      "Ücretli planlar ek speaking dakikaları, daha derin geri bildirim ve gelişmiş ürün özellikleri açabilir. Fiyat ve plan şartları zamanla değişebilir.",
    contact: "İletişim",
    contactText: "Yasal veya hesapla ilgili sorular için bize şu adresten ulaşabilirsiniz:"
  },
  de: {
    title: "Nutzungsbedingungen",
    description: "Lies die Bedingungen, die bei der Nutzung von SpeakAce gelten.",
    eyebrow: "Bedingungen",
    heading: "Nutzungsbedingungen",
    intro: "Mit der Nutzung von SpeakAce stimmst du zu, die Plattform verantwortungsvoll und nur für legale persönliche, schulische oder Bildungszwecke zu nutzen.",
    service: "Nutzung des Dienstes",
    serviceText: "SpeakAce bietet KI-gestütztes Speaking-Training, geschätztes Feedback und Lernwerkzeuge. Der Dienst ist keine offizielle Prüfungsbewertung.",
    accounts: "Konten",
    accountsText: "Du bist für die Richtigkeit deiner Kontodaten und den Schutz deiner Zugangsdaten verantwortlich.",
    payments: "Zahlungen und Abos",
    paymentsText: "Bezahlte Pläne können mehr Speaking-Zeit, tieferes Feedback und zusätzliche Funktionen freischalten. Preise und Bedingungen können sich ändern.",
    contact: "Kontakt",
    contactText: "Bei rechtlichen oder kontobezogenen Fragen kontaktiere uns unter:"
  },
  fr: {
    title: "Conditions d’utilisation",
    description: "Lisez les conditions applicables à l’utilisation de SpeakAce.",
    eyebrow: "Conditions",
    heading: "Conditions d’utilisation",
    intro: "En utilisant SpeakAce, vous acceptez d’utiliser la plateforme de façon responsable et uniquement à des fins légales, éducatives ou scolaires.",
    service: "Utilisation du service",
    serviceText: "SpeakAce fournit de la pratique speaking assistée par IA, un feedback estimé et des outils d’étude. Le service n’est pas une notation officielle d’examen.",
    accounts: "Comptes",
    accountsText: "Vous êtes responsable de l’exactitude de vos informations de compte et de la sécurité de vos identifiants.",
    payments: "Paiements et abonnements",
    paymentsText: "Les plans payants peuvent débloquer plus de temps de speaking, un feedback plus profond et des fonctions avancées. Les tarifs peuvent évoluer.",
    contact: "Contact",
    contactText: "Pour toute question juridique ou liée au compte, contactez-nous à :"
  },
  nl: {
    title: "Gebruiksvoorwaarden",
    description: "Lees de voorwaarden die gelden bij het gebruik van SpeakAce.",
    eyebrow: "Voorwaarden",
    heading: "Gebruiksvoorwaarden",
    intro: "Door SpeakAce te gebruiken, ga je ermee akkoord het platform verantwoord en alleen voor legale persoonlijke, educatieve of schooldoeleinden te gebruiken.",
    service: "Gebruik van de dienst",
    serviceText: "SpeakAce biedt AI-ondersteunde speaking-oefening, geschatte feedback en studietools. De dienst is geen officiële examenbeoordeling.",
    accounts: "Accounts",
    accountsText: "Je bent verantwoordelijk voor de juistheid van je accountinformatie en voor het beveiligen van je inloggegevens.",
    payments: "Betalingen en abonnementen",
    paymentsText: "Betaalde plannen kunnen extra speaking-minuten, diepere feedback en geavanceerde functies ontgrendelen. Prijzen en voorwaarden kunnen veranderen.",
    contact: "Contact",
    contactText: "Voor juridische of accountvragen kun je contact opnemen via:"
  }
} as const;

function getTermsCopy(language: Language) {
  return ((termsCopy as unknown) as Partial<Record<Language, (typeof termsCopy)["en"]>>)[language] ?? termsCopy.en;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const copy = getTermsCopy(language);

  return {
    title: copy.title,
    description: copy.description
  };
}

export default async function TermsPage() {
  const language = await getServerLanguage();
  const copy = getTermsCopy(language);

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.heading}</h1>
        <p className="practice-copy">{copy.intro}</p>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.service}</strong>
          <p className="practice-copy">{copy.serviceText}</p>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.accounts}</strong>
          <p className="practice-copy">{copy.accountsText}</p>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.payments}</strong>
          <p className="practice-copy">{copy.paymentsText}</p>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.contact}</strong>
          <p className="practice-copy">
            {copy.contactText} <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

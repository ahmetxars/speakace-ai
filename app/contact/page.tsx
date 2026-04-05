import type { Metadata } from "next";
import type { Language } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

const contactCopy = {
  en: {
    title: "Contact",
    description: "Contact SpeakAce for support, school demos, product questions, or partnership inquiries.",
    eyebrow: "Contact",
    heading: "Contact SpeakAce",
    intro: "Reach out if you need account help, school demo details, billing support, or want to ask a product question.",
    email: "Email",
    reply: "We usually reply within 1 to 2 business days.",
    topics: "What you can contact us about",
    topicList: [
      "Account and login help",
      "Billing and subscription questions",
      "Teacher and school demos",
      "Product feedback and partnerships"
    ]
  },
  tr: {
    title: "İletişim",
    description: "Destek, okul demosu, ürün soruları veya iş birlikleri için SpeakAce ile iletişime geçin.",
    eyebrow: "İletişim",
    heading: "SpeakAce ile iletişime geçin",
    intro: "Hesap yardımı, okul demosu, ödeme desteği ya da ürün soruları için bize yazabilirsiniz.",
    email: "E-posta",
    reply: "Genelde 1-2 iş günü içinde dönüş yapıyoruz.",
    topics: "Bize hangi konularda yazabilirsiniz",
    topicList: [
      "Hesap ve giriş yardımı",
      "Ödeme ve abonelik soruları",
      "Öğretmen ve okul demoları",
      "Ürün geri bildirimi ve iş birlikleri"
    ]
  },
  de: {
    title: "Kontakt",
    description: "Kontaktiere SpeakAce für Support, Schul-Demos, Produktfragen oder Partnerschaften.",
    eyebrow: "Kontakt",
    heading: "SpeakAce kontaktieren",
    intro: "Melde dich bei uns, wenn du Hilfe zum Konto, zu Schul-Demos, zur Zahlung oder zum Produkt brauchst.",
    email: "E-Mail",
    reply: "Wir antworten in der Regel innerhalb von 1 bis 2 Werktagen.",
    topics: "Wozu du uns schreiben kannst",
    topicList: ["Konto- und Login-Hilfe", "Fragen zu Zahlung und Abo", "Demos für Lehrkräfte und Schulen", "Produktfeedback und Partnerschaften"]
  },
  fr: {
    title: "Contact",
    description: "Contactez SpeakAce pour le support, les démos école, les questions produit ou les partenariats.",
    eyebrow: "Contact",
    heading: "Contacter SpeakAce",
    intro: "Écrivez-nous pour l’aide au compte, les démos école, les questions de paiement ou les questions produit.",
    email: "E-mail",
    reply: "Nous répondons généralement sous 1 à 2 jours ouvrés.",
    topics: "Vous pouvez nous contacter pour",
    topicList: ["Aide compte et connexion", "Questions de paiement et d’abonnement", "Démos pour enseignants et écoles", "Feedback produit et partenariats"]
  },
  nl: {
    title: "Contact",
    description: "Neem contact op met SpeakAce voor support, schooldemo's, productvragen of samenwerkingen.",
    eyebrow: "Contact",
    heading: "Neem contact op met SpeakAce",
    intro: "Stuur ons een bericht voor hulp met je account, schooldemo's, betalingen of productvragen.",
    email: "E-mail",
    reply: "We reageren meestal binnen 1 tot 2 werkdagen.",
    topics: "Waarover je ons kunt mailen",
    topicList: ["Hulp bij account en inloggen", "Vragen over betaling en abonnement", "Demo's voor docenten en scholen", "Productfeedback en samenwerkingen"]
  }
} as const;

function getContactCopy(language: Language) {
  return ((contactCopy as unknown) as Partial<Record<Language, (typeof contactCopy)["en"]>>)[language] ?? contactCopy.en;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const copy = getContactCopy(language);

  return {
    title: copy.title,
    description: copy.description
  };
}

export default async function ContactPage() {
  const language = await getServerLanguage();
  const copy = getContactCopy(language);

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.heading}</h1>
        <p className="practice-copy">{copy.intro}</p>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.65rem" }}>
          <strong>{copy.email}</strong>
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          <span className="practice-copy">{copy.reply}</span>
        </div>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.65rem" }}>
          <strong>{copy.topics}</strong>
          <ul className="seo-bullet-list">
            {copy.topicList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

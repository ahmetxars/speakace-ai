import type { Metadata } from "next";
import type { Language } from "@/lib/copy";
import { getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";

const privacyCopy = {
  en: {
    title: "Privacy Policy",
    description: "Read how SpeakAce collects, uses, and protects personal information.",
    eyebrow: "Privacy Policy",
    heading: "Privacy Policy",
    intro:
      "This policy explains what information SpeakAce collects, how it is used, and how users can contact us about privacy questions.",
    collect: "What we collect",
    collectText:
      "We may collect account details such as your name, email address, language preference, study settings, speaking session data, transcripts, and usage activity.",
    use: "How we use your information",
    useItems: [
      "To create and manage your account",
      "To provide speaking practice, feedback, and progress tracking",
      "To improve product quality, reliability, and user experience",
      "To send important account, billing, and support emails"
    ],
    third: "Third-party services",
    thirdText:
      "SpeakAce may use third-party services for hosting, payments, analytics, email delivery, and AI processing. These services only receive the information needed to perform their role.",
    contact: "Contact",
    contactText: "For privacy questions, contact us at"
  },
  tr: {
    title: "Gizlilik Politikası",
    description: "SpeakAce'in kişisel bilgileri nasıl topladığını, kullandığını ve koruduğunu okuyun.",
    eyebrow: "Gizlilik Politikası",
    heading: "Gizlilik Politikası",
    intro:
      "Bu politika, SpeakAce'in hangi bilgileri topladığını, bu bilgileri nasıl kullandığını ve gizlilik soruları için kullanıcıların nasıl iletişime geçebileceğini açıklar.",
    collect: "Neleri topluyoruz",
    collectText:
      "Ad, e-posta, dil tercihi, çalışma ayarları, speaking oturum verileri, transcript'ler ve kullanım hareketleri gibi hesap bilgilerini toplayabiliriz.",
    use: "Bilgileri nasıl kullanıyoruz",
    useItems: [
      "Hesabınızı oluşturmak ve yönetmek için",
      "Speaking pratiği, geri bildirim ve gelişim takibi sunmak için",
      "Ürün kalitesini, güvenilirliği ve deneyimi geliştirmek için",
      "Önemli hesap, ödeme ve destek e-postaları göndermek için"
    ],
    third: "Üçüncü taraf servisler",
    thirdText:
      "SpeakAce barındırma, ödeme, analitik, e-posta teslimi ve yapay zekâ işleme için üçüncü taraf servisler kullanabilir. Bu servisler yalnızca görevlerini yerine getirmek için gereken bilgiyi alır.",
    contact: "İletişim",
    contactText: "Gizlilik soruları için bize şu adresten ulaşabilirsiniz:"
  },
  de: {
    title: "Datenschutz",
    description: "Lies, wie SpeakAce persönliche Daten sammelt, nutzt und schützt.",
    eyebrow: "Datenschutz",
    heading: "Datenschutzerklärung",
    intro: "Diese Richtlinie erklärt, welche Informationen SpeakAce sammelt, wie sie verwendet werden und wie du uns bei Datenschutzfragen kontaktieren kannst.",
    collect: "Was wir erfassen",
    collectText: "Wir können Kontodaten wie Name, E-Mail, Spracheinstellungen, Lerndaten, Speaking-Sitzungen, Transkripte und Nutzungsaktivität erfassen.",
    use: "Wie wir Informationen verwenden",
    useItems: ["Zur Erstellung und Verwaltung deines Kontos", "Für Speaking-Training, Feedback und Fortschrittsansicht", "Zur Verbesserung von Produktqualität und Zuverlässigkeit", "Für wichtige E-Mails zu Konto, Zahlung und Support"],
    third: "Drittanbieter",
    thirdText: "SpeakAce kann Drittanbieter für Hosting, Zahlungen, Analysen, E-Mails und KI-Verarbeitung nutzen. Diese erhalten nur die dafür nötigen Daten.",
    contact: "Kontakt",
    contactText: "Bei Datenschutzfragen kontaktiere uns unter"
  },
  fr: {
    title: "Politique de confidentialité",
    description: "Lisez comment SpeakAce collecte, utilise et protège les données personnelles.",
    eyebrow: "Confidentialité",
    heading: "Politique de confidentialité",
    intro: "Cette politique explique quelles informations SpeakAce collecte, comment elles sont utilisées et comment nous contacter pour les questions de confidentialité.",
    collect: "Ce que nous collectons",
    collectText: "Nous pouvons collecter des données de compte comme le nom, l’e-mail, la langue, les réglages d’étude, les sessions speaking, les transcripts et l’activité d’utilisation.",
    use: "Comment nous utilisons vos informations",
    useItems: ["Créer et gérer votre compte", "Fournir la pratique speaking, le feedback et le suivi", "Améliorer la qualité et la fiabilité du produit", "Envoyer les e-mails importants liés au compte, au paiement et au support"],
    third: "Services tiers",
    thirdText: "SpeakAce peut utiliser des services tiers pour l’hébergement, les paiements, l’analytics, l’e-mail et le traitement IA. Ils ne reçoivent que les données nécessaires.",
    contact: "Contact",
    contactText: "Pour toute question sur la confidentialité, contactez-nous à"
  },
  nl: {
    title: "Privacybeleid",
    description: "Lees hoe SpeakAce persoonsgegevens verzamelt, gebruikt en beschermt.",
    eyebrow: "Privacy",
    heading: "Privacybeleid",
    intro: "Dit beleid legt uit welke informatie SpeakAce verzamelt, hoe die wordt gebruikt en hoe gebruikers contact kunnen opnemen over privacyvragen.",
    collect: "Wat we verzamelen",
    collectText: "We kunnen accountgegevens verzamelen zoals naam, e-mail, taalvoorkeur, studie-instellingen, speaking-sessies, transcripts en gebruiksactiviteit.",
    use: "Hoe we je informatie gebruiken",
    useItems: ["Om je account aan te maken en te beheren", "Om speaking-oefening, feedback en voortgang te bieden", "Om productkwaliteit en betrouwbaarheid te verbeteren", "Om belangrijke account-, facturatie- en supportmails te versturen"],
    third: "Derdediensten",
    thirdText: "SpeakAce kan externe diensten gebruiken voor hosting, betalingen, analytics, e-mail en AI-verwerking. Zij ontvangen alleen de informatie die ze nodig hebben.",
    contact: "Contact",
    contactText: "Voor privacyvragen kun je contact opnemen via"
  }
} as const;

function getPrivacyCopy(language: Language) {
  return ((privacyCopy as unknown) as Partial<Record<Language, (typeof privacyCopy)["en"]>>)[language] ?? privacyCopy.en;
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await getServerLanguage();
  const copy = getPrivacyCopy(language);

  return {
    title: copy.title,
    description: copy.description
  };
}

export default async function PrivacyPolicyPage() {
  const language = await getServerLanguage();
  const copy = getPrivacyCopy(language);

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{copy.eyebrow}</span>
        <h1>{copy.heading}</h1>
        <p className="practice-copy">{copy.intro}</p>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.collect}</strong>
          <p className="practice-copy">{copy.collectText}</p>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.use}</strong>
          <ul className="seo-bullet-list">
            {copy.useItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>{copy.third}</strong>
          <p className="practice-copy">{copy.thirdText}</p>
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

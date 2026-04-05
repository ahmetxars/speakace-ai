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

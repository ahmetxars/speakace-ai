import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read how SpeakAce collects, uses, and protects personal information."
};

export default function PrivacyPolicyPage() {
  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">Privacy Policy</span>
        <h1>Privacy Policy</h1>
        <p className="practice-copy">
          This policy explains what information SpeakAce collects, how it is used, and how users can contact us about privacy questions.
        </p>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>What we collect</strong>
          <p className="practice-copy">
            We may collect account details such as your name, email address, language preference, study settings, speaking session data, transcripts, and usage activity.
          </p>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>How we use your information</strong>
          <ul className="seo-bullet-list">
            <li>To create and manage your account</li>
            <li>To provide speaking practice, feedback, and progress tracking</li>
            <li>To improve product quality, reliability, and user experience</li>
            <li>To send important account, billing, and support emails</li>
          </ul>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>Third-party services</strong>
          <p className="practice-copy">
            SpeakAce may use third-party services for hosting, payments, analytics, email delivery, and AI processing. These services only receive the information needed to perform their role.
          </p>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>Contact</strong>
          <p className="practice-copy">
            For privacy questions, contact us at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Read the terms that apply when using SpeakAce."
};

export default function TermsPage() {
  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">Terms</span>
        <h1>Terms of Use</h1>
        <p className="practice-copy">
          By using SpeakAce, you agree to use the platform responsibly and only for lawful personal, educational, or school-related purposes.
        </p>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>Use of the service</strong>
          <p className="practice-copy">
            SpeakAce provides AI-assisted speaking practice, estimated feedback, and study tools. The service is for preparation and learning support, not official exam scoring.
          </p>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>Accounts</strong>
          <p className="practice-copy">
            You are responsible for the accuracy of your account information and for keeping your login credentials secure.
          </p>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>Payments and subscriptions</strong>
          <p className="practice-copy">
            Paid plans may unlock extra speaking minutes, deeper feedback, and advanced product features. Pricing and plan terms can change over time.
          </p>
        </section>

        <section className="card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
          <strong>Contact</strong>
          <p className="practice-copy">
            If you have a legal or account question, contact us at <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.
          </p>
        </section>
      </div>
    </main>
  );
}

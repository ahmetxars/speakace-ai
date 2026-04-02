import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact SpeakAce for support, school demos, product questions, or partnership inquiries."
};

export default function ContactPage() {
  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">Contact</span>
        <h1>Contact SpeakAce</h1>
        <p className="practice-copy">
          Reach out if you need account help, school demo details, billing support, or just want to ask a product question.
        </p>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.65rem" }}>
          <strong>Email</strong>
          <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          <span className="practice-copy">We usually reply within 1 to 2 business days.</span>
        </div>

        <div className="card" style={{ padding: "1rem", display: "grid", gap: "0.65rem" }}>
          <strong>What you can contact us about</strong>
          <ul className="seo-bullet-list">
            <li>Account and login help</li>
            <li>Billing and subscription questions</li>
            <li>Teacher and school demos</li>
            <li>Product feedback and partnerships</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

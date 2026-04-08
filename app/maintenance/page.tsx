import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Temporarily Offline",
  description: "SpeakAce is temporarily unavailable while we make improvements.",
  robots: {
    index: false,
    follow: false
  }
};

export default function MaintenancePage() {
  return (
    <main className="maintenance-shell">
      <section className="maintenance-card">
        <span className="maintenance-badge">Maintenance mode</span>
        <h1>We&apos;re making a few improvements.</h1>
        <p>
          SpeakAce is temporarily unavailable while we polish the experience. The site will be back soon with a
          cleaner, faster update.
        </p>
        <div className="maintenance-meta">
          <span>Practice will reopen soon</span>
          <span>Support: support@speakace.org</span>
        </div>
      </section>
    </main>
  );
}

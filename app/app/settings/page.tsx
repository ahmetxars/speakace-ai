"use client";

import { useAppState } from "@/components/providers";

export default function SettingsPage() {
  const { language, setLanguage, signedIn, signOut, currentUser } = useAppState();
  const tr = language === "tr";

  return (
    <main className="page-shell section">
      <div className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{tr ? "Ayarlar" : "Settings"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Uygulama tercihleri" : "App preferences"}</h1>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Arayüz dili" : "Interface language"}</strong>
            <p>{tr ? `Seçili dil: ${language.toUpperCase()}` : `Current selection: ${language.toUpperCase()}`}</p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button className="button button-secondary" type="button" onClick={() => setLanguage("en")}>
                English
              </button>
              <button className="button button-secondary" type="button" onClick={() => setLanguage("tr")}>
                Türkçe
              </button>
            </div>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Hesap durumu" : "Account state"}</strong>
            <p>{signedIn ? (tr ? "Güvenli oturum ile giriş yapıldı." : "Signed in with a secure session cookie.") : tr ? "Misafir modu açık." : "Guest mode is active."}</p>
            {signedIn ? (
              <button className="button button-secondary" type="button" onClick={signOut}>
                {tr ? "Çıkış yap" : "Sign out"}
              </button>
            ) : null}
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Üyelik durumu" : "Membership status"}</strong>
            <p>
              {currentUser?.id ?? "No user"} · {currentUser?.plan ?? "free"}
            </p>
            <p>{tr ? "Ücretli planlar elle açılmaz. Ödeme tamamlandıktan sonra otomatik olarak aktifleşir." : "Paid plans no longer unlock from manual buttons. They will activate from the billing flow after payment."}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

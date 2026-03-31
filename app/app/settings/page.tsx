"use client";

import { useState } from "react";
import { useAppState } from "@/components/providers";

export default function SettingsPage() {
  const { language, setLanguage, theme, setTheme, signedIn, signOut, currentUser } = useAppState();
  const tr = language === "tr";
  const [resetMessage, setResetMessage] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const requestPasswordReset = async () => {
    if (!currentUser?.email) return;
    setResetLoading(true);
    setResetMessage("");
    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email })
      });
      const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Password reset could not be started.");
      }
      setResetMessage(
        tr
          ? "Sifre degistirme linki e-posta adresine gonderildi. Mail onayi ile yeni sifre belirleyebilirsin."
          : "A password reset link was sent to your email. You can confirm by email and set a new password."
      );
    } catch (error) {
      setResetMessage(error instanceof Error ? error.message : tr ? "Sifre linki gonderilemedi." : "Password reset link could not be sent.");
    } finally {
      setResetLoading(false);
    }
  };

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
            <strong>{tr ? "Tema" : "Theme"}</strong>
            <p>{tr ? `Secili tema: ${theme === "dark" ? "Koyu" : "Aydinlik"}` : `Current theme: ${theme === "dark" ? "Dark" : "Light"}`}</p>
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
              <button className="button button-secondary" type="button" onClick={() => setTheme("light")}>
                {tr ? "Aydinlik" : "Light"}
              </button>
              <button className="button button-secondary" type="button" onClick={() => setTheme("dark")}>
                {tr ? "Koyu" : "Dark"}
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
            <p style={{ fontSize: "1.1rem", fontWeight: 700 }}>{formatPlanLabel(currentUser?.plan, tr)}</p>
            <p>{tr ? "Ücretli planlar elle açılmaz. Ödeme tamamlandıktan sonra otomatik olarak aktifleşir." : "Paid plans no longer unlock from manual buttons. They will activate from the billing flow after payment."}</p>
          </div>
          <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
            <strong>{tr ? "Şifre değiştir" : "Change password"}</strong>
            <p>
              {tr
                ? "Guvenlik icin e-posta onayli sifre degistirme linki gonderiyoruz."
                : "For security, we send a verified password reset link to your email."}
            </p>
            {signedIn ? (
              <button className="button button-secondary" type="button" onClick={requestPasswordReset} disabled={resetLoading}>
                {resetLoading ? (tr ? "Gönderiliyor..." : "Sending...") : tr ? "Sifre degistirme maili gonder" : "Send password reset email"}
              </button>
            ) : (
              <p>{tr ? "Bu ozellik icin once giris yap." : "Sign in first to use this feature."}</p>
            )}
            {resetMessage ? <p style={{ color: "var(--accent-cool)", marginBottom: 0 }}>{resetMessage}</p> : null}
          </div>
        </div>
      </div>
    </main>
  );
}

function formatPlanLabel(plan: string | undefined, tr: boolean) {
  if (plan === "plus") return tr ? "Plus" : "Plus";
  if (plan === "pro") return tr ? "Pro" : "Pro";
  return tr ? "Free" : "Free";
}

"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  CONSENT_VERSION,
  readCookieConsent,
} from "@/lib/cookie-consent";
import { useAppState } from "@/components/providers";

export function CookieConsentPanel() {
  const { language } = useAppState();
  const tr = language === "tr";
  const [open, setOpen] = useState(false);
  const [preferences, setPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  useEffect(() => {
    const consent = readCookieConsent();
    setOpen(!consent);
    setAnalytics(consent?.analytics ?? false);
  }, []);
  const save = (allowAnalytics: boolean) => {
    const previous = readCookieConsent();
    document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ version: CONSENT_VERSION, analytics: allowAnalytics, savedAt: Date.now() }))}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    if (!allowAnalytics) {
      for (const entry of document.cookie.split(";")) {
        const name = entry.trim().split("=")[0];
        if (
          /^(speakace_visitor_id|_ga|_gid|_gat|_gcl|_clck|_clsk|ph_)/.test(name)
        ) {
          for (const domain of [
            "",
            `; Domain=${location.hostname}`,
            "; Domain=.speakace.org",
          ])
            document.cookie = `${name}=; Max-Age=0; Path=/${domain}`;
        }
      }
      try {
        for (const key of Object.keys(localStorage))
          if (key.startsWith("ph_") || key === "speakace-share-attribution")
            localStorage.removeItem(key);
      } catch {
        /* Storage may be unavailable. */
      }
    }
    setAnalytics(allowAnalytics);
    setOpen(false);
    window.dispatchEvent(new Event("speakace-consent-change"));
    if (previous?.analytics && !allowAnalytics) location.reload();
  };
  return (
    <>
      <button
        className="cookie-settings-trigger"
        type="button"
        onClick={() => {
          setOpen(true);
          setPreferences(true);
        }}
      >
        {tr ? "Çerez tercihleri" : "Cookie settings"}
      </button>
      {open && (
        <section
          className="cookie-panel"
          aria-label={tr ? "Çerez tercihleri" : "Cookie preferences"}
        >
          <div className="cookie-panel-heading">
            <span aria-hidden="true">✳</span>
            <h2>
              {tr ? "Gizlilik senin elinde." : "Your privacy. Your choice."}
            </h2>
          </div>
          <p>
            {tr
              ? "Oturum açma ve seçtiğin ayarları hatırlamak için gerekli çerezleri kullanıyoruz. İsteğe bağlı kullanım analitiği yalnızca izin verirsen çalışır. Reddederek de siteyi kullanabilirsin."
              : "Necessary cookies keep sign-in and your chosen settings working. Optional usage analytics run only with your permission. You can use the site if you decline."}{" "}
            <Link href="/cookie-policy">
              {tr ? "Çerez politikası" : "Cookie policy"}
            </Link>
          </p>
          {preferences && (
            <div className="cookie-options">
              <label>
                <input type="checkbox" checked disabled />{" "}
                <span>
                  <strong>{tr ? "Gerekli" : "Necessary"}</strong> —{" "}
                  {tr
                    ? "Oturum, güvenlik, dil ve izin tercihin. Her zaman açık."
                    : "Sign-in, security, language and your consent choice. Always on."}
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                />{" "}
                <span>
                  <strong>{tr ? "Analitik" : "Analytics"}</strong> —{" "}
                  {tr
                    ? "Hangi sayfa ve özelliklerin kullanıldığını anlamamıza yardımcı olur. Varsayılan kapalı."
                    : "Helps us understand which pages and features are used. Off by default."}
                </span>
              </label>
              <p>
                {tr
                  ? "Reklam ve üçüncü taraf oturum kaydı araçları devre dışı."
                  : "Advertising and third-party session recording are disabled."}
              </p>
            </div>
          )}
          <div className="cookie-actions">
            <button type="button" onClick={() => save(false)}>
              {tr ? "İsteğe bağlıları reddet" : "Reject optional"}
            </button>
            <button type="button" onClick={() => save(true)}>
              {tr ? "Analitiğe izin ver" : "Allow analytics"}
            </button>
            <button
              type="button"
              onClick={() =>
                preferences ? save(analytics) : setPreferences(true)
              }
            >
              {preferences
                ? tr
                  ? "Tercihlerimi kaydet"
                  : "Save preferences"
                : tr
                  ? "Tercihleri düzenle"
                  : "Manage preferences"}
            </button>
          </div>
        </section>
      )}
    </>
  );
}

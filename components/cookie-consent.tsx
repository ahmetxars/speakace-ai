"use client";
import Link from "next/link";
import { normalizePublicLanguage } from "@/lib/copy";
import { cookieConsentCopy } from "@/lib/cookie-consent-copy";
import { useEffect, useRef, useState } from "react";
import {
  CONSENT_COOKIE,
  CONSENT_MAX_AGE,
  CONSENT_VERSION,
  readCookieConsent,
} from "@/lib/cookie-consent";
import { useAppState } from "@/components/providers";

export function CookieConsentPanel() {
  const { language } = useAppState();
  const t = cookieConsentCopy[normalizePublicLanguage(language)];
  const trigger = useRef<HTMLButtonElement>(null);
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
    requestAnimationFrame(() => trigger.current?.focus());
    window.dispatchEvent(new Event("speakace-consent-change"));
    if (previous?.analytics && !allowAnalytics) location.reload();
  };
  return (
    <>
      <button
        ref={trigger}
        className="cookie-settings-trigger"
        type="button"
        onClick={() => {
          setOpen(true);
          setPreferences(true);
        }}
      >
        {t.settings}
      </button>
      {open && (
        <section
          className="cookie-panel"
          aria-label={t.label}
        >
          <div className="cookie-panel-heading">
            <span aria-hidden="true">✳</span>
            <h2>
              {t.title}
            </h2>
          </div>
          <p>
            {t.body}{" "}
            <Link href="/cookie-policy">
              {t.policy}
            </Link>
          </p>
          {preferences && (
            <div className="cookie-options">
              <label>
                <input type="checkbox" checked disabled />{" "}
                <span>
                  <strong>{t.necessary}</strong> —{" "}
                  {t.necessaryBody}
                </span>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(event) => setAnalytics(event.target.checked)}
                />{" "}
                <span>
                  <strong>{t.analytics}</strong> —{" "}
                  {t.analyticsBody}
                </span>
              </label>
              <p>
                {t.disabled}
              </p>
            </div>
          )}
          <div className="cookie-actions">
            <button type="button" onClick={() => save(false)}>
              {t.reject}
            </button>
            <button type="button" onClick={() => save(true)}>
              {t.allow}
            </button>
            <button
              type="button"
              onClick={() =>
                preferences ? save(analytics) : setPreferences(true)
              }
            >
              {preferences ? t.save : t.manage}
            </button>
          </div>
        </section>
      )}
    </>
  );
}

"use client";

import { CreditCard, LockKeyhole, X } from "lucide-react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import {
  buildCheckoutRecoveryPath,
  CHECKOUT_ATTRIBUTION_COOKIE,
  type CheckoutRecoveryAttribution,
  parseCheckoutRecoveryAttribution
} from "@/lib/billing-recovery";

const recoveryCopy = {
  en: {
    eyebrow: "Your plan is still saved",
    title: "Continue your SpeakAce checkout",
    body: "Pick up where you left off. Your plan choice is ready in Lemon Squeezy's secure checkout.",
    secure: "Secure checkout",
    action: "Continue checkout",
    dismiss: "Dismiss checkout reminder"
  },
  tr: {
    eyebrow: "Plan seçimin hâlâ kayıtlı",
    title: "SpeakAce ödemene devam et",
    body: "Kaldığın yerden devam et. Plan seçimin Lemon Squeezy'nin güvenli ödeme ekranında hazır.",
    secure: "Güvenli ödeme",
    action: "Ödemeye devam et",
    dismiss: "Ödeme hatırlatıcısını kapat"
  },
  de: {
    eyebrow: "Dein Tarif ist noch gespeichert",
    title: "Setze deinen SpeakAce-Kauf fort",
    body: "Mache dort weiter, wo du aufgehört hast. Deine Auswahl wartet im sicheren Lemon-Squeezy-Checkout.",
    secure: "Sicherer Checkout",
    action: "Checkout fortsetzen",
    dismiss: "Checkout-Erinnerung schließen"
  },
  es: {
    eyebrow: "Tu plan sigue guardado",
    title: "Continúa tu compra de SpeakAce",
    body: "Retoma donde lo dejaste. Tu plan está listo en el pago seguro de Lemon Squeezy.",
    secure: "Pago seguro",
    action: "Continuar al pago",
    dismiss: "Cerrar recordatorio de pago"
  },
  fr: {
    eyebrow: "Votre formule est toujours enregistrée",
    title: "Reprenez votre achat SpeakAce",
    body: "Reprenez là où vous vous êtes arrêté. Votre choix vous attend dans le paiement sécurisé Lemon Squeezy.",
    secure: "Paiement sécurisé",
    action: "Continuer le paiement",
    dismiss: "Fermer le rappel de paiement"
  }
} as const;

type RecoveryLocale = keyof typeof recoveryCopy;

function readCheckoutAttributionCookie() {
  if (typeof document === "undefined") return null;
  const prefix = `${CHECKOUT_ATTRIBUTION_COOKIE}=`;
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(prefix));
  return cookie ? cookie.slice(prefix.length) : null;
}

function clearCheckoutAttributionCookie() {
  document.cookie = `${CHECKOUT_ATTRIBUTION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

function getRecoveryLocale(language: string): RecoveryLocale {
  return language in recoveryCopy ? language as RecoveryLocale : "en";
}

function getPlanLabel(attribution: CheckoutRecoveryAttribution) {
  if (attribution.plan === "lifetime") return "SpeakAce Lifetime";
  return attribution.plan === "pro" ? "SpeakAce Pro" : "SpeakAce Plus";
}

function getPriceLabel(attribution: CheckoutRecoveryAttribution, locale: RecoveryLocale) {
  const suffixes = {
    en: { week: "week", month: "month", year: "year", once: "one time" },
    tr: { week: "hafta", month: "ay", year: "yıl", once: "tek ödeme" },
    de: { week: "Woche", month: "Monat", year: "Jahr", once: "einmalig" },
    es: { week: "semana", month: "mes", year: "año", once: "pago único" },
    fr: { week: "semaine", month: "mois", year: "an", once: "paiement unique" }
  }[locale];

  if (attribution.plan === "lifetime") return `$129.99 ${suffixes.once}`;
  if (attribution.plan === "pro") return attribution.billing === "annual" ? `$99/${suffixes.year}` : `$12/${suffixes.month}`;
  return attribution.billing === "annual" ? `$49.99/${suffixes.year}` : `$3.99/${suffixes.week}`;
}

function isRecoveryExcludedPath(pathname: string) {
  return pathname.startsWith("/admin")
    || pathname.startsWith("/auth")
    || pathname.startsWith("/maintenance")
    || pathname.startsWith("/app/billing/success");
}

export function CheckoutRecoveryPrompt() {
  const pathname = usePathname();
  const { currentUser, language } = useAppState();
  const [attribution, setAttribution] = useState<CheckoutRecoveryAttribution | null>(null);
  const [visible, setVisible] = useState(false);
  const locale = getRecoveryLocale(language);
  const copy = recoveryCopy[locale];
  const checkoutHref = useMemo(
    () => attribution ? buildCheckoutRecoveryPath(attribution, pathname) : "#",
    [attribution, pathname]
  );

  useEffect(() => {
    let revealTimer: number | undefined;

    const syncRecovery = () => {
      if (!pathname || !currentUser || isRecoveryExcludedPath(pathname)) {
        setVisible(false);
        return;
      }
      if (currentUser.plan !== "free") {
        clearCheckoutAttributionCookie();
        setAttribution(null);
        setVisible(false);
        return;
      }

      const parsed = parseCheckoutRecoveryAttribution(readCheckoutAttributionCookie());
      if (!parsed) {
        setAttribution(null);
        setVisible(false);
        return;
      }

      setAttribution(parsed);
      window.clearTimeout(revealTimer);
      revealTimer = window.setTimeout(() => setVisible(true), 650);
    };

    const syncWhenVisible = () => {
      if (document.visibilityState === "visible") syncRecovery();
    };

    syncRecovery();
    window.addEventListener("pageshow", syncRecovery);
    window.addEventListener("focus", syncRecovery);
    document.addEventListener("visibilitychange", syncWhenVisible);

    return () => {
      window.clearTimeout(revealTimer);
      window.removeEventListener("pageshow", syncRecovery);
      window.removeEventListener("focus", syncRecovery);
      document.removeEventListener("visibilitychange", syncWhenVisible);
    };
  }, [currentUser, pathname]);

  useEffect(() => {
    if (!visible || !attribution) return;
    document.body.dataset.checkoutRecovery = "true";
    const eventId = `checkout-recovery-view:${attribution.checkoutId}`;
    const source = attribution.campaign ?? attribution.ctaPath ?? "unknown";

    void trackClientEvent({
      userId: currentUser?.id,
      event: "checkout_recovery_view",
      eventId,
      path: pathname ?? "/",
      source,
      plan: attribution.plan,
      locale
    });
    posthog.capture("checkout_recovery_view", {
      $insert_id: eventId,
      event_id: eventId,
      source,
      plan: attribution.plan,
      billing: attribution.billing,
      locale
    });

    return () => {
      delete document.body.dataset.checkoutRecovery;
    };
  }, [attribution, currentUser?.id, locale, pathname, visible]);

  if (!visible || !attribution) return null;

  const trackRecoveryAction = (event: "checkout_recovery_continued" | "checkout_recovery_dismissed") => {
    const eventId = `${event.replaceAll("_", "-")}:${attribution.checkoutId}`;
    const source = attribution.campaign ?? attribution.ctaPath ?? "unknown";
    void trackClientEvent({
      userId: currentUser?.id,
      event,
      eventId,
      path: pathname ?? "/",
      source,
      plan: attribution.plan,
      locale
    });
    posthog.capture(event, {
      $insert_id: eventId,
      event_id: eventId,
      source,
      plan: attribution.plan,
      billing: attribution.billing,
      locale
    });
  };

  const dismissRecovery = () => {
    trackRecoveryAction("checkout_recovery_dismissed");
    clearCheckoutAttributionCookie();
    setVisible(false);
    setAttribution(null);
  };

  return (
    <aside
      className="checkout-recovery"
      data-app-route={pathname?.startsWith("/app") ? "true" : "false"}
      aria-live="polite"
      aria-label={copy.title}
    >
      <div className="checkout-recovery__icon" aria-hidden="true">
        <CreditCard size={22} />
      </div>
      <div className="checkout-recovery__copy">
        <span>{copy.eyebrow}</span>
        <strong>{copy.title}</strong>
        <p>{copy.body}</p>
        <small>
          <LockKeyhole size={13} aria-hidden="true" />
          {copy.secure} · {getPlanLabel(attribution)} · {getPriceLabel(attribution, locale)}
        </small>
      </div>
      <a className="button button-primary" href={checkoutHref} onClick={() => trackRecoveryAction("checkout_recovery_continued")}>
        {copy.action}
      </a>
      <button
        className="checkout-recovery__dismiss"
        type="button"
        aria-label={copy.dismiss}
        onClick={dismissRecovery}
      >
        <X size={18} />
      </button>
    </aside>
  );
}

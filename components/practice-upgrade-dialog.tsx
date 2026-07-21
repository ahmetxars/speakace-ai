"use client";

import { useCallback, useEffect, useRef } from "react";
import posthog from "posthog-js";
import { TrackedLink } from "@/components/tracked-link";
import {
  buildPlanCheckoutPath,
  commerceNumbers,
  couponCatalog,
  getAnnualSavingsPercentFromWeekly
} from "@/lib/commerce";
import { normalizePublicLanguage } from "@/lib/copy";
import type { Language } from "@/lib/copy";

type UpgradePromptReason = "practice_limit_hit" | "result_retry_locked";

type UpgradeDialogCopy = {
  eyebrow: string;
  close: string;
  title: Record<UpgradePromptReason, string>;
  body: Record<UpgradePromptReason, string>;
  trial: string;
  today: string;
  afterTrial: string;
  bestStep: string;
  benefits: [string, string, string];
  primary: string;
  annualLead: string;
  annualCta: string;
  coupon: string;
  trust: string;
  dismiss: string;
};

const copy: Record<"en" | "tr" | "de" | "es" | "fr", UpgradeDialogCopy> = {
  en: {
    eyebrow: "Plus trial",
    close: "Close upgrade offer",
    title: {
      practice_limit_hit: "Keep practising while the feedback is fresh.",
      result_retry_locked: "Use the feedback in a stronger second answer now."
    },
    body: {
      practice_limit_hit: "Your free practice is complete for today. Plus reopens speaking now and keeps your improvement loop moving.",
      result_retry_locked: "The useful moment is right after feedback. Plus lets you retry this prompt today instead of losing the momentum."
    },
    trial: "3 days free",
    today: "$0 today",
    afterTrial: "then $3.99/week",
    bestStep: "Best first step",
    benefits: ["Continue speaking now", "Up to 35 speaking minutes a day", "18 daily sessions with full feedback"],
    primary: "Start 3-day Plus trial",
    annualLead: "Already planning a longer prep cycle?",
    annualCta: "Choose annual and save {savings}%",
    coupon: "Launch discount attached to checkout",
    trust: "Secure checkout by Lemon Squeezy. Manage or cancel from Billing.",
    dismiss: "Not now"
  },
  tr: {
    eyebrow: "Plus denemesi",
    close: "Yükseltme teklifini kapat",
    title: {
      practice_limit_hit: "Geri bildirim tazeyken pratiğe devam et.",
      result_retry_locked: "Geri bildirimi şimdi daha güçlü ikinci cevaba dönüştür."
    },
    body: {
      practice_limit_hit: "Bugünkü ücretsiz pratiğin tamamlandı. Plus speaking'i şimdi yeniden açar ve gelişim döngünü kesmeden sürdürür.",
      result_retry_locked: "En değerli an geri bildirimin hemen sonrası. Plus ile bu prompt'u beklemeden bugün yeniden deneyebilirsin."
    },
    trial: "3 gün ücretsiz",
    today: "Bugün $0",
    afterTrial: "sonra haftalık $3.99",
    bestStep: "En kolay ilk adım",
    benefits: ["Speaking'e şimdi devam et", "Günde 35 dakikaya kadar speaking", "Tam geri bildirimle günlük 18 oturum"],
    primary: "3 günlük Plus denemesini başlat",
    annualLead: "Daha uzun bir hazırlık dönemi mi planlıyorsun?",
    annualCta: "Yıllık seç ve %{savings} tasarruf et",
    coupon: "Lansman indirimi checkout'a eklendi",
    trust: "Lemon Squeezy ile güvenli ödeme. Billing'den yönetebilir veya iptal edebilirsin.",
    dismiss: "Şimdi değil"
  },
  de: {
    eyebrow: "Plus-Testphase",
    close: "Upgrade-Angebot schließen",
    title: {
      practice_limit_hit: "Übe weiter, solange das Feedback noch frisch ist.",
      result_retry_locked: "Setze das Feedback jetzt in einer stärkeren zweiten Antwort um."
    },
    body: {
      practice_limit_hit: "Dein kostenloses Training für heute ist abgeschlossen. Plus öffnet das Sprechen sofort wieder und hält deinen Lernrhythmus am Laufen.",
      result_retry_locked: "Direkt nach dem Feedback ist der beste Moment. Mit Plus kannst du diese Aufgabe noch heute wiederholen."
    },
    trial: "3 Tage kostenlos",
    today: "Heute $0",
    afterTrial: "danach $3.99/Woche",
    bestStep: "Einfachster Einstieg",
    benefits: ["Jetzt weitersprechen", "Bis zu 35 Sprechminuten täglich", "18 tägliche Sessions mit vollem Feedback"],
    primary: "3-tägige Plus-Testphase starten",
    annualLead: "Planst du eine längere Vorbereitung?",
    annualCta: "Jährlich wählen und {savings}% sparen",
    coupon: "Launch-Rabatt ist im Checkout hinterlegt",
    trust: "Sicherer Checkout mit Lemon Squeezy. Im Billing verwalten oder kündigen.",
    dismiss: "Nicht jetzt"
  },
  es: {
    eyebrow: "Prueba Plus",
    close: "Cerrar oferta de mejora",
    title: {
      practice_limit_hit: "Sigue practicando mientras el feedback está fresco.",
      result_retry_locked: "Convierte ahora el feedback en una segunda respuesta mejor."
    },
    body: {
      practice_limit_hit: "Tu práctica gratuita de hoy ha terminado. Plus vuelve a abrir speaking ahora y mantiene activo tu ciclo de mejora.",
      result_retry_locked: "El mejor momento es justo después del feedback. Plus te permite repetir este prompt hoy sin perder el impulso."
    },
    trial: "3 días gratis",
    today: "$0 hoy",
    afterTrial: "después $3.99/semana",
    bestStep: "El primer paso más fácil",
    benefits: ["Continúa speaking ahora", "Hasta 35 minutos de speaking al día", "18 sesiones diarias con feedback completo"],
    primary: "Iniciar prueba Plus de 3 días",
    annualLead: "¿Ya planeas una preparación más larga?",
    annualCta: "Elige anual y ahorra un {savings}%",
    coupon: "Descuento de lanzamiento aplicado al checkout",
    trust: "Checkout seguro con Lemon Squeezy. Gestiona o cancela desde Billing.",
    dismiss: "Ahora no"
  },
  fr: {
    eyebrow: "Essai Plus",
    close: "Fermer l'offre Plus",
    title: {
      practice_limit_hit: "Continue tant que le feedback est encore frais.",
      result_retry_locked: "Transforme maintenant le feedback en une meilleure deuxième réponse."
    },
    body: {
      practice_limit_hit: "Ta pratique gratuite est terminée pour aujourd'hui. Plus rouvre l'oral maintenant et maintient ton rythme de progression.",
      result_retry_locked: "Le meilleur moment arrive juste après le feedback. Plus te permet de réessayer ce sujet aujourd'hui sans perdre ton élan."
    },
    trial: "3 jours gratuits",
    today: "$0 aujourd'hui",
    afterTrial: "puis $3.99/semaine",
    bestStep: "Le premier pas le plus simple",
    benefits: ["Continue l'oral maintenant", "Jusqu'à 35 minutes d'oral par jour", "18 sessions quotidiennes avec feedback complet"],
    primary: "Démarrer l'essai Plus de 3 jours",
    annualLead: "Tu prévois une préparation plus longue ?",
    annualCta: "Choisir l'annuel et économiser {savings}%",
    coupon: "Remise de lancement ajoutée au checkout",
    trust: "Paiement sécurisé par Lemon Squeezy. Gère ou annule depuis Billing.",
    dismiss: "Pas maintenant"
  }
};

export function PracticeUpgradeDialog({
  reason,
  language,
  userId,
  currentPlan,
  onDismiss
}: {
  reason: UpgradePromptReason;
  language: Language;
  userId?: string | null;
  currentPlan?: string | null;
  onDismiss: () => void;
}) {
  const selectedCopy = copy[normalizePublicLanguage(language)];
  const annualSavings = getAnnualSavingsPercentFromWeekly(
    commerceNumbers.plusWeeklyPrice,
    commerceNumbers.plusAnnualPrice
  );
  const weeklyCampaign = `${reason}_trial_dialog_weekly`;
  const annualCampaign = `${reason}_trial_dialog_annual`;
  const dialogRef = useRef<HTMLElement | null>(null);

  const dismiss = useCallback(() => {
    posthog.capture("upgrade_prompt_dismissed", {
      source: reason,
      placement: "practice_trial_dialog",
      current_plan: currentPlan
    });
    onDismiss();
  }, [currentPlan, onDismiss, reason]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>(".practice-upgrade-primary")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        dismiss();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previousFocus?.focus();
    };
  }, [dismiss]);

  return (
    <div
      className="practice-upgrade-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <section
        ref={dialogRef}
        className="practice-upgrade-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="practice-upgrade-title"
      >
        <button className="practice-upgrade-close" type="button" onClick={dismiss} aria-label={selectedCopy.close}>
          <span aria-hidden="true">×</span>
        </button>

        <div className="practice-upgrade-story">
          <span className="practice-upgrade-eyebrow">{selectedCopy.eyebrow}</span>
          <h2 id="practice-upgrade-title">{selectedCopy.title[reason]}</h2>
          <p>{selectedCopy.body[reason]}</p>

          <div className="practice-upgrade-benefits">
            {selectedCopy.benefits.map((benefit) => (
              <div key={benefit}>
                <span aria-hidden="true">✓</span>
                <strong>{benefit}</strong>
              </div>
            ))}
          </div>

          <div className="practice-upgrade-trust">
            <span aria-hidden="true">◆</span>
            <span>{selectedCopy.trust}</span>
          </div>
        </div>

        <aside className="practice-upgrade-offer">
          <span className="practice-upgrade-offer-label">{selectedCopy.bestStep}</span>
          <div className="practice-upgrade-trial-pill">{selectedCopy.trial}</div>
          <strong className="practice-upgrade-price">{selectedCopy.today}</strong>
          <span className="practice-upgrade-price-note">{selectedCopy.afterTrial}</span>

          <TrackedLink
            className="button button-primary practice-upgrade-primary"
            href={buildPlanCheckoutPath({
              plan: "plus",
              billing: "weekly",
              coupon: couponCatalog.LAUNCH20.code,
              campaign: weeklyCampaign
            })}
            userId={userId}
            analyticsEvent="checkout_initiated"
            analyticsPath={`/app/practice/${reason}/trial_dialog/weekly`}
            gaEvent="begin_checkout"
            gaParams={{
              currency: "USD",
              value: commerceNumbers.plusWeeklyPrice,
              coupon: couponCatalog.LAUNCH20.code,
              items: [{
                item_id: "plus_weekly",
                item_name: "SpeakAce Plus - Weekly Trial",
                price: commerceNumbers.plusWeeklyPrice,
                quantity: 1
              }]
            }}
            onClick={() => {
              posthog.capture("checkout_initiated", {
                plan: "plus",
                billing: "weekly",
                source: weeklyCampaign,
                placement: "practice_trial_dialog",
                current_plan: currentPlan
              });
            }}
          >
            {selectedCopy.primary}
          </TrackedLink>

          <span className="practice-upgrade-coupon">{selectedCopy.coupon}</span>

          <div className="practice-upgrade-annual">
            <span>{selectedCopy.annualLead}</span>
            <TrackedLink
              href={buildPlanCheckoutPath({
                plan: "plus",
                billing: "annual",
                coupon: couponCatalog.LAUNCH20.code,
                campaign: annualCampaign
              })}
              userId={userId}
              analyticsEvent="checkout_initiated"
              analyticsPath={`/app/practice/${reason}/trial_dialog/annual`}
              onClick={() => {
                posthog.capture("checkout_initiated", {
                  plan: "plus",
                  billing: "annual",
                  source: annualCampaign,
                  placement: "practice_trial_dialog",
                  current_plan: currentPlan
                });
              }}
            >
              {selectedCopy.annualCta.replace("{savings}", String(annualSavings))}
            </TrackedLink>
          </div>

          <button className="practice-upgrade-dismiss" type="button" onClick={dismiss}>
            {selectedCopy.dismiss}
          </button>
        </aside>
      </section>
    </div>
  );
}

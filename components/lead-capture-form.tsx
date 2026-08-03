"use client";

import { type FormEvent, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";

type LeadFormLabels = {
  name: string;
  email: string;
  idle: string;
  loading: string;
  error: string;
  consentError: string;
  success: string;
  studentConsent: string;
  businessConsent: string;
  privacy: string;
};

const labels: Record<PublicLanguage, LeadFormLabels> = {
  en: {
    name: "Your name (optional)",
    email: "Your email address",
    idle: "Send it to me",
    loading: "Sending",
    error: "Could not save your email.",
    consentError: "Please confirm that we may send the requested material.",
    success: "Request received. If this address can receive email, the guide will arrive shortly; use its confirmation button to activate the 3 follow-ups.",
    studentConsent: "I agree to receive the requested guide and, after email confirmation, 3 SpeakAce practice emails including a Plus offer. I can unsubscribe anytime.",
    businessConsent: "I agree to receive the requested SpeakAce walkthrough email. I can unsubscribe anytime.",
    privacy: "Privacy"
  },
  tr: {
    name: "Adın (isteğe bağlı)",
    email: "E-posta adresin",
    idle: "Bana gönder",
    loading: "Gönderiliyor",
    error: "E-posta kaydedilemedi.",
    consentError: "İstenen içeriği gönderebilmemiz için lütfen onay ver.",
    success: "Talep alındı. Bu adres e-posta alabiliyorsa rehber kısa sürede gelir; 3 takip e-postasını açmak için içindeki onay düğmesini kullan.",
    studentConsent: "İstediğim rehberi ve e-posta onayından sonra Plus teklifi içeren 3 SpeakAce pratik e-postasını almayı kabul ediyorum. İstediğim zaman çıkabilirim.",
    businessConsent: "İstediğim SpeakAce tanıtım e-postasını almayı kabul ediyorum. İstediğim zaman çıkabilirim.",
    privacy: "Gizlilik"
  },
  de: {
    name: "Dein Name (optional)",
    email: "Deine E-Mail-Adresse",
    idle: "An mich senden",
    loading: "Wird gesendet",
    error: "E-Mail konnte nicht gespeichert werden.",
    consentError: "Bitte bestätige, dass wir dir das angeforderte Material senden dürfen.",
    success: "Anfrage erhalten. Wenn diese Adresse E-Mails empfangen kann, kommt der Leitfaden in Kürze; bestätige darin die 3 Folge-E-Mails.",
    studentConsent: "Ich möchte den Leitfaden und nach E-Mail-Bestätigung 3 SpeakAce-Übungs-E-Mails einschließlich eines Plus-Angebots erhalten. Abmeldung jederzeit möglich.",
    businessConsent: "Ich möchte die angeforderte SpeakAce-Rundgang-E-Mail erhalten. Abmeldung jederzeit möglich.",
    privacy: "Datenschutz"
  },
  es: {
    name: "Tu nombre (opcional)",
    email: "Tu email",
    idle: "Enviármelo",
    loading: "Enviando",
    error: "No se pudo guardar el email.",
    consentError: "Confirma que podemos enviarte el material solicitado.",
    success: "Solicitud recibida. Si esta dirección puede recibir emails, la guía llegará pronto; confirma dentro los 3 seguimientos.",
    studentConsent: "Acepto recibir la guía y, tras confirmar mi email, 3 emails de práctica de SpeakAce, incluida una oferta Plus. Puedo darme de baja cuando quiera.",
    businessConsent: "Acepto recibir el email solicitado con el recorrido de SpeakAce. Puedo darme de baja cuando quiera.",
    privacy: "Privacidad"
  },
  fr: {
    name: "Ton nom (facultatif)",
    email: "Ton e-mail",
    idle: "Me l’envoyer",
    loading: "Envoi",
    error: "Impossible d’enregistrer l’e-mail.",
    consentError: "Confirme que nous pouvons envoyer le contenu demandé.",
    success: "Demande reçue. Si cette adresse peut recevoir des e-mails, le guide arrivera bientôt; confirme dedans les 3 suivis.",
    studentConsent: "J’accepte de recevoir le guide puis, après confirmation de mon e-mail, 3 e-mails de pratique SpeakAce incluant une offre Plus. Désinscription à tout moment.",
    businessConsent: "J’accepte de recevoir l’e-mail demandé avec la visite SpeakAce. Désinscription à tout moment.",
    privacy: "Confidentialité"
  }
};

function isBusinessSource(source: string) {
  const normalized = source.toLowerCase();
  return normalized.includes("teacher") || normalized.includes("school") || normalized.includes("institution");
}

function getAttribution() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  let referrerHost = "";
  try {
    referrerHost = document.referrer ? new URL(document.referrer).hostname : "";
  } catch {
    referrerHost = "";
  }

  return {
    locale: document.documentElement.lang || undefined,
    landingPath: window.location.pathname,
    referrerHost: referrerHost || undefined,
    utmSource: params.get("utm_source") || undefined,
    utmMedium: params.get("utm_medium") || undefined,
    utmCampaign: params.get("utm_campaign") || undefined,
    utmContent: params.get("utm_content") || undefined,
    utmTerm: params.get("utm_term") || undefined
  };
}

export function LeadCaptureForm({
  source = "site",
  variant = "default",
  showName = true
}: {
  source?: string;
  variant?: "default" | "compact";
  showName?: boolean;
}) {
  const { language } = useAppState();
  const publicLanguage = normalizePublicLanguage(language);
  const copy = labels[publicLanguage];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const compact = variant === "compact";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!consent) {
      setStatus("error");
      setMessage(copy.consentError);
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/marketing/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          source,
          consent,
          company,
          ...getAttribution()
        })
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error ?? copy.error);
        return;
      }

      void trackClientEvent({
        event: "lead_magnet_requested",
        source,
        path: window.location.pathname,
        locale: publicLanguage
      });
      setStatus("success");
      setMessage(copy.success);
      setName("");
      setEmail("");
      setConsent(false);
    } catch {
      setStatus("error");
      setMessage(copy.error);
    }
  };

  const controlStyle = compact
    ? {
        padding: "0.625rem 1rem",
        fontSize: "0.875rem",
        background: "var(--input-bg)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        color: "var(--foreground)",
        minWidth: "220px"
      }
    : undefined;

  return (
    <form
      className={compact ? undefined : "lead-form"}
      onSubmit={submit}
      style={compact ? { display: "grid", gap: "0.65rem", maxWidth: "520px" } : undefined}
    >
      <div style={compact
        ? { display: "flex", gap: "0.5rem", flexWrap: "wrap" }
        : { display: "grid", gap: "0.75rem" }}>
        {showName ? (
          <input
            aria-label={copy.name}
            autoComplete="name"
            placeholder={copy.name}
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={status === "loading"}
            style={controlStyle}
          />
        ) : null}
        <input
          required
          type="email"
          aria-label={copy.email}
          autoComplete="email"
          placeholder={copy.email}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status === "loading"}
          style={controlStyle}
        />
        <button
          className={compact ? undefined : "button button-primary"}
          type="submit"
          disabled={status === "loading"}
          style={compact ? {
            padding: "0.625rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 700,
            color: "white",
            background: "var(--primary)",
            border: "none",
            borderRadius: "8px",
            cursor: status === "loading" ? "default" : "pointer",
            whiteSpace: "nowrap",
            opacity: status === "loading" ? 0.7 : 1
          } : undefined}
        >
          {status === "loading" ? copy.loading : copy.idle}
        </button>
      </div>

      <input
        aria-hidden="true"
        autoComplete="off"
        name="company"
        tabIndex={-1}
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        style={{ position: "absolute", left: "-10000px", width: "1px", height: "1px" }}
      />

      <label style={{ display: "flex", alignItems: "flex-start", gap: "0.55rem", fontSize: "0.75rem", lineHeight: 1.45, color: "var(--muted-foreground)" }}>
        <input
          required
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          disabled={status === "loading"}
          style={{
            marginTop: "0.15rem",
            width: "1rem",
            minWidth: "1rem",
            height: "1rem",
            minHeight: "1rem",
            padding: 0,
            borderRadius: "0.2rem"
          }}
        />
        <span>
          {isBusinessSource(source) ? copy.businessConsent : copy.studentConsent}{" "}
          <a href="/privacy-policy" style={{ color: "inherit", textDecoration: "underline" }}>{copy.privacy}</a>
        </span>
      </label>

      {message ? (
        <p
          className={compact ? undefined : "lead-form-message"}
          data-state={status}
          role="status"
          style={compact ? {
            margin: 0,
            fontSize: "0.8rem",
            color: status === "error" ? "var(--destructive, #b42318)" : "var(--foreground)"
          } : undefined}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}

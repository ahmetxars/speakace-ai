"use client";

import { FormEvent, useState } from "react";
import posthog from "posthog-js";
import { useAppState } from "@/components/providers";
import { normalizePublicLanguage, type PublicLanguage } from "@/lib/copy";

const labels: Record<PublicLanguage, { name: string; email: string; idle: string; loading: string; error: string; success: string }> = {
  en: { name: "Your name (optional)", email: "Your email address", idle: "Send it to me", loading: "Sending", error: "Could not save your email.", success: "Thanks. Check your inbox for the next step." },
  tr: { name: "Adın (isteğe bağlı)", email: "E-posta adresin", idle: "Bana gönder", loading: "Gönderiliyor", error: "E-posta kaydedilemedi.", success: "Teşekkürler. Sonraki adım için gelen kutunu kontrol et." },
  de: { name: "Dein Name (optional)", email: "Deine E-Mail-Adresse", idle: "An mich senden", loading: "Wird gesendet", error: "E-Mail konnte nicht gespeichert werden.", success: "Danke. Prüfe deinen Posteingang." },
  es: { name: "Tu nombre (opcional)", email: "Tu email", idle: "Enviármelo", loading: "Enviando", error: "No se pudo guardar el email.", success: "Gracias. Revisa tu bandeja de entrada." },
  fr: { name: "Ton nom (facultatif)", email: "Ton e-mail", idle: "Me l’envoyer", loading: "Envoi", error: "Impossible d’enregistrer l’e-mail.", success: "Merci. Consulte ta boîte de réception." }
};

export function LeadCaptureForm({ source = "site" }: { source?: string }) {
  const { language } = useAppState();
  const copy = labels[normalizePublicLanguage(language)];
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/marketing/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, source })
    });

    const data = (await response.json().catch(() => ({}))) as { error?: string };

    if (!response.ok) {
      setStatus("error");
      setMessage(data.error ?? copy.error);
      return;
    }

    posthog.capture("lead_captured", { source, has_name: Boolean(name) });
    setStatus("success");
    setMessage(copy.success);
    setEmail("");
  };

  return (
    <form className="lead-form" onSubmit={submit}>
      <input
        aria-label={copy.name}
        placeholder={copy.name}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        required
        type="email"
        aria-label={copy.email}
        placeholder={copy.email}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button className="button button-primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? copy.loading : copy.idle}
      </button>
      {message ? (
        <p className="lead-form-message" data-state={status}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

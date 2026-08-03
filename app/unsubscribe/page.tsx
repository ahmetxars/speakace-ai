"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { isPublicLanguage, type PublicLanguage } from "@/lib/copy";

const unsubscribeCopy: Record<PublicLanguage, {
  title: string;
  intro: string;
  processing: string;
  submit: string;
  doneTitle: string;
  doneBody: string;
  transactional: string;
  home: string;
  error: string;
  invalid: string;
  changed: string;
  practice: string;
}> = {
  en: { title: "Unsubscribe", intro: "Enter your email address to stop receiving marketing emails from SpeakAce.", processing: "Processing…", submit: "Unsubscribe me", doneTitle: "You’ve been unsubscribed", doneBody: "You won’t receive any more marketing emails from SpeakAce.", transactional: "Transactional emails such as password resets will still be sent.", home: "Back to home", error: "Something went wrong. Please try again.", invalid: "Please use the unsubscribe link in your latest SpeakAce email.", changed: "Changed your mind?", practice: "Keep practicing →" },
  tr: { title: "Abonelikten çık", intro: "SpeakAce pazarlama e-postalarını durdurmak için e-posta adresini gir.", processing: "İşleniyor…", submit: "Abonelikten çık", doneTitle: "Abonelikten çıktın", doneBody: "SpeakAce’ten artık pazarlama e-postası almayacaksın.", transactional: "Şifre sıfırlama gibi işlemsel e-postalar gönderilmeye devam eder.", home: "Ana sayfaya dön", error: "Bir sorun oluştu. Lütfen tekrar dene.", invalid: "Lütfen son SpeakAce e-postandaki abonelikten çıkma bağlantısını kullan.", changed: "Fikrini değiştirdin mi?", practice: "Pratiğe devam et →" },
  de: { title: "Abmelden", intro: "Gib deine E-Mail-Adresse ein, um Marketing-E-Mails von SpeakAce zu stoppen.", processing: "Wird verarbeitet…", submit: "Abmelden", doneTitle: "Du bist abgemeldet", doneBody: "Du erhältst keine weiteren Marketing-E-Mails von SpeakAce.", transactional: "Transaktions-E-Mails wie Passwort-Resets werden weiterhin gesendet.", home: "Zur Startseite", error: "Etwas ist schiefgelaufen. Bitte versuche es erneut.", invalid: "Nutze bitte den Abmeldelink in deiner letzten SpeakAce-E-Mail.", changed: "Anders entschieden?", practice: "Weiter üben →" },
  es: { title: "Darse de baja", intro: "Introduce tu email para dejar de recibir emails de marketing de SpeakAce.", processing: "Procesando…", submit: "Darme de baja", doneTitle: "Te has dado de baja", doneBody: "No recibirás más emails de marketing de SpeakAce.", transactional: "Los emails transaccionales, como restablecer la contraseña, seguirán enviándose.", home: "Volver al inicio", error: "Algo salió mal. Inténtalo de nuevo.", invalid: "Usa el enlace de baja de tu último email de SpeakAce.", changed: "¿Has cambiado de opinión?", practice: "Seguir practicando →" },
  fr: { title: "Se désinscrire", intro: "Saisissez votre e-mail pour arrêter les e-mails marketing de SpeakAce.", processing: "Traitement…", submit: "Me désinscrire", doneTitle: "Vous êtes désinscrit", doneBody: "Vous ne recevrez plus d’e-mails marketing de SpeakAce.", transactional: "Les e-mails transactionnels, comme la réinitialisation du mot de passe, restent envoyés.", home: "Retour à l’accueil", error: "Un problème est survenu. Réessayez.", invalid: "Utilisez le lien de désinscription de votre dernier e-mail SpeakAce.", changed: "Vous avez changé d’avis ?", practice: "Continuer à pratiquer →" }
};

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const langParam = searchParams.get("lang");
  const copy = unsubscribeCopy[isPublicLanguage(langParam) ? langParam : "en"];

  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token })
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>{copy.doneTitle}</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          {copy.doneBody}
          <br />
          {copy.transactional}
        </p>
        <Link href="/" className="button button-secondary">
          {copy.home}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{copy.title}</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        {copy.intro}
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          readOnly={Boolean(token)}
          className="input"
          style={{ width: "100%" }}
        />
        <button
          type="submit"
          className="button button-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? copy.processing : copy.submit}
        </button>
        {status === "error" && (
          <p style={{ color: "var(--color-error, #dc2626)", fontSize: "0.9em" }}>
            {token
              ? copy.error
              : copy.invalid}
          </p>
        )}
      </form>
      <p style={{ marginTop: "1.5rem", fontSize: "0.85em", color: "var(--text-muted)" }}>
        {copy.changed}{" "}
        <Link href="/app/practice" style={{ color: "var(--accent)" }}>
          {copy.practice}
        </Link>
      </p>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <main className="page-shell section">
      <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center" }}>Loading…</div>}>
        <UnsubscribeForm />
      </Suspense>
    </main>
  );
}

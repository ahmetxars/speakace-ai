"use client";

import { FormEvent, useState } from "react";
import { useAppState } from "@/components/providers";

export function LeadCaptureForm({ source = "site" }: { source?: string }) {
  const { language } = useAppState();
  const tr = language === "tr";
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
      setMessage(data.error ?? (tr ? "Kayit alinamadi." : "Could not save your email."));
      return;
    }

    setStatus("success");
    setMessage(
      tr
        ? "Checklist e-postana gonderildi. Simdi practice'e gecebilirsin."
        : "The checklist was sent to your email. You can move into practice now."
    );
    setEmail("");
  };

  return (
    <form className="lead-form" onSubmit={submit}>
      <input
        aria-label={tr ? "Ad" : "Name"}
        placeholder={tr ? "Adın (isteğe bağlı)" : "Your name (optional)"}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <input
        required
        type="email"
        aria-label={tr ? "E-posta" : "Email"}
        placeholder={tr ? "E-posta adresin" : "Your email address"}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button className="button button-primary" type="submit" disabled={status === "loading"}>
        {status === "loading"
          ? tr ? "Gonderiliyor" : "Sending"
          : tr ? "Checklist'i gonder" : "Send the checklist"}
      </button>
      {message ? (
        <p className="lead-form-message" data-state={status}>
          {message}
        </p>
      ) : null}
    </form>
  );
}

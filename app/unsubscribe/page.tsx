"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";

  const [email, setEmail] = useState(emailParam);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
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
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>You've been unsubscribed</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
          You won't receive any more marketing emails from SpeakAce.
          <br />
          Transactional emails (password reset, etc.) will still be sent.
        </p>
        <Link href="/" className="button button-secondary">
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "3rem 1rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Unsubscribe</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
        Enter your email address to stop receiving marketing emails from SpeakAce.
      </p>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="input"
          style={{ width: "100%" }}
        />
        <button
          type="submit"
          className="button button-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Processing…" : "Unsubscribe me"}
        </button>
        {status === "error" && (
          <p style={{ color: "var(--color-error, #dc2626)", fontSize: "0.9em" }}>
            Something went wrong. Please try again.
          </p>
        )}
      </form>
      <p style={{ marginTop: "1.5rem", fontSize: "0.85em", color: "var(--text-muted)" }}>
        Changed your mind?{" "}
        <Link href="/app/practice" style={{ color: "var(--accent)" }}>
          Keep practicing →
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

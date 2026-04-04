"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });
    const data = (await response.json()) as { error?: string };
    setBusy(false);
    if (!response.ok) {
      setError(data.error ?? "Admin login failed.");
      return;
    }
    router.push("/admin");
    router.refresh();
  };

  return (
    <main className="page-shell section">
      <div className="card" style={{ maxWidth: 520, margin: "0 auto", padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">Admin access</span>
        <h1 style={{ margin: 0 }}>SpeakAce admin panel</h1>
        <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
          Sign in with your admin username/password or an existing admin member email/password.
        </p>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Username or admin email</span>
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="admin or admin@speakace.org"
            style={{ padding: "0.95rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
        </label>
        <label style={{ display: "grid", gap: "0.45rem" }}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            style={{ padding: "0.95rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
        </label>
        {error ? <p style={{ color: "var(--accent-deep)", margin: 0 }}>{error}</p> : null}
        <button className="button button-primary" type="button" disabled={busy} onClick={submit}>
          {busy ? "Signing in..." : "Open admin panel"}
        </button>
      </div>
    </main>
  );
}

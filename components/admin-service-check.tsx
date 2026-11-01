"use client";
import { useState } from "react";
import type { ServiceCheck } from "@/lib/server/service-health";
export function AdminServiceCheck() {
  const [checks, setChecks] = useState<ServiceCheck[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const check = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/services", { method: "POST" });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Servis kontrolü tamamlanamadı.");
      setChecks(data.checks);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Bağlantı hatası.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="adm-service-check">
      <div>
        <strong>Canlı servis kontrolü</strong>
        <p>
          Veritabanı, gerçek OpenAI model yanıtı ve Resend gönderici alanı. Test
          kullanıcı verisi göndermez.
        </p>
      </div>
      <button
        type="button"
        className="button button-secondary"
        disabled={busy}
        onClick={check}
      >
        {busy ? "Kontrol ediliyor…" : "Servisleri kontrol et"}
      </button>
      <div aria-live="polite">
        {checks.map((item) => (
          <p key={item.service}>
            <strong>
              {item.ok ? "✓" : "!"} {item.service}
            </strong>{" "}
            — {item.message}
          </p>
        ))}
        {error && <p role="alert">{error}</p>}
      </div>
    </section>
  );
}

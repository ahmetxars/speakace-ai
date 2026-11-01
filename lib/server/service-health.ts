import { getSql, hasDatabaseUrl } from "@/lib/server/db";
export type ServiceCheck = { service: string; ok: boolean; message: string };
export async function checkServices(): Promise<ServiceCheck[]> {
  return Promise.all([
    (async () => {
      if (!hasDatabaseUrl())
        return {
          service: "PostgreSQL",
          ok: false,
          message: "DATABASE_URL eksik",
        };
      try {
        await getSql()`select 1`;
        return {
          service: "PostgreSQL",
          ok: true,
          message: "Bağlantı doğrulandı",
        };
      } catch {
        return {
          service: "PostgreSQL",
          ok: false,
          message: "Veritabanına ulaşılamadı",
        };
      }
    })(),
    (async () => {
      if (!process.env.OPENAI_API_KEY)
        return { service: "OpenAI", ok: false, message: "API anahtarı eksik" };
      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: process.env.OPENAI_FEEDBACK_MODEL || "gpt-4o-mini",
              messages: [
                {
                  role: "user",
                  content:
                    "Reply with OK. This is a service connectivity test.",
                },
              ],
              max_completion_tokens: 16,
            }),
            signal: AbortSignal.timeout(15000),
          },
        );
        const data = await response.json();
        return {
          service: "OpenAI",
          ok: response.ok && Boolean(data.choices?.[0]?.message),
          message: response.ok
            ? "Model yanıtı ve API erişimi doğrulandı"
            : response.status === 401
              ? "API anahtarı geçersiz (401)"
              : response.status === 429
                ? "Kredi, kota veya hız sınırı (429)"
                : `Sağlayıcı yanıtı: ${response.status}`,
        };
      } catch {
        return {
          service: "OpenAI",
          ok: false,
          message: "Zaman aşımı veya bağlantı hatası",
        };
      }
    })(),
    (async () => {
      if (!process.env.RESEND_API_KEY)
        return { service: "Resend", ok: false, message: "API anahtarı eksik" };
      try {
        const response = await fetch("https://api.resend.com/domains", {
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
          signal: AbortSignal.timeout(10000),
        });
        const data = await response.json();
        const verified = data.data?.some(
          (domain: { status: string }) => domain.status === "verified",
        );
        return {
          service: "Resend",
          ok: response.ok && verified === true,
          message:
            response.ok && verified
              ? "API ve doğrulanmış gönderici alanı hazır; fatura/teslimat ayrıca kontrol edilir"
              : `Alan adı veya API kontrolü başarısız (${response.status})`,
        };
      } catch {
        return {
          service: "Resend",
          ok: false,
          message: "Zaman aşımı veya bağlantı hatası",
        };
      }
    })(),
  ]);
}

import { createHmac } from "node:crypto";

export function getPrivacySafeAnalyticsId(namespace: string, value: string, fallback = "anonymous") {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return `${namespace}:${fallback}`;

  const salt =
    process.env.ANALYTICS_ID_SALT ??
    process.env.CRON_SECRET ??
    process.env.LEMON_SQUEEZY_WEBHOOK_SECRET ??
    "speakace-local-analytics";
  const digest = createHmac("sha256", salt).update(normalized).digest("hex").slice(0, 24);
  return `${namespace}:${digest}`;
}

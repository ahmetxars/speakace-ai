export interface RuntimeConfig {
  appEnv: string;
  siteUrl: string;
  databaseUrl?: string;
  openAiApiKey?: string;
  openAiTranscribeModel: string;
  openAiFeedbackModel: string;
  stripeSecretKey?: string;
}

function readRequired(key: "APP_ENV" | "NEXT_PUBLIC_SITE_URL") {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export function getRuntimeConfig(): RuntimeConfig {
  return {
    appEnv: readRequired("APP_ENV"),
    siteUrl: readRequired("NEXT_PUBLIC_SITE_URL"),
    databaseUrl: process.env.DATABASE_URL,
    openAiApiKey: process.env.OPENAI_API_KEY,
    openAiTranscribeModel: process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe",
    openAiFeedbackModel: process.env.OPENAI_FEEDBACK_MODEL || "gpt-4o-mini",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY
  };
}

import { NextResponse } from "next/server";
import { getRuntimeConfig } from "@/lib/server/env";

export async function GET() {
  const config = getRuntimeConfig();

  return NextResponse.json({
    status: "ok",
    environment: config.appEnv,
    siteUrl: config.siteUrl,
    hasDatabaseUrl: Boolean(config.databaseUrl),
    hasOpenAiApiKey: Boolean(config.openAiApiKey),
    hasStripeSecret: Boolean(config.stripeSecretKey),
    transcribeModel: config.openAiTranscribeModel,
    feedbackModel: config.openAiFeedbackModel
  });
}

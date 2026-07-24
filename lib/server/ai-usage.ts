import { getPostHogClient } from "@/lib/posthog-server";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";

export type AiUsageFeature =
  | "speaking_transcription"
  | "speaking_feedback"
  | "writing_feedback";

type AiUsageInput = {
  userId?: string | null;
  feature: AiUsageFeature;
  model: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  totalTokens?: number | null;
  audioSeconds?: number | null;
};

export type AiUsageSummary = {
  requests30d: number;
  inputTokens30d: number;
  outputTokens30d: number;
  estimatedCostUsd30d: number;
};

type TokenRates = {
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
};

const KNOWN_MODEL_RATES: Array<{ matches: (model: string) => boolean; rates: TokenRates }> = [
  {
    matches: (model) => model === "gpt-4o-mini-transcribe" || model.startsWith("gpt-4o-mini-transcribe-"),
    rates: { inputUsdPerMillion: 1.25, outputUsdPerMillion: 5 }
  },
  {
    matches: (model) => model === "gpt-4o-mini" || model.startsWith("gpt-4o-mini-"),
    rates: { inputUsdPerMillion: 0.15, outputUsdPerMillion: 0.6 }
  }
];

let schemaPromise: Promise<void> | null = null;

function finiteNonNegative(value?: number | null) {
  return Number.isFinite(value) && Number(value) >= 0 ? Number(value) : 0;
}

function readRate(value: string | undefined) {
  if (!value?.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function resolveRates(feature: AiUsageFeature, model: string): TokenRates | null {
  const prefix = feature === "speaking_transcription" ? "OPENAI_TRANSCRIBE" : "OPENAI_FEEDBACK";
  const inputOverride = readRate(process.env[`${prefix}_INPUT_USD_PER_1M`]);
  const outputOverride = readRate(process.env[`${prefix}_OUTPUT_USD_PER_1M`]);
  const knownRates = KNOWN_MODEL_RATES.find((entry) => entry.matches(model))?.rates;
  const inputUsdPerMillion = inputOverride ?? knownRates?.inputUsdPerMillion;
  const outputUsdPerMillion = outputOverride ?? knownRates?.outputUsdPerMillion;

  if (inputUsdPerMillion === undefined || outputUsdPerMillion === undefined) {
    return null;
  }

  return { inputUsdPerMillion, outputUsdPerMillion };
}

export function estimateAiCostUsd(input: Pick<AiUsageInput, "feature" | "model" | "inputTokens" | "outputTokens">) {
  const rates = resolveRates(input.feature, input.model);
  if (!rates) return null;

  const inputCost = (finiteNonNegative(input.inputTokens) / 1_000_000) * rates.inputUsdPerMillion;
  const outputCost = (finiteNonNegative(input.outputTokens) / 1_000_000) * rates.outputUsdPerMillion;
  return Number((inputCost + outputCost).toFixed(8));
}

export async function ensureAiUsageSchema() {
  if (!hasDatabaseUrl()) return;
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const sql = getSql();
      await sql`
        create table if not exists ai_usage_events (
          id text primary key,
          user_id text references users(id) on delete set null,
          feature text not null,
          model text not null,
          input_tokens integer not null default 0,
          output_tokens integer not null default 0,
          total_tokens integer not null default 0,
          audio_seconds numeric(10, 2),
          estimated_cost_usd numeric(12, 8),
          created_at timestamptz not null default now()
        )
      `;
      await sql`
        create index if not exists idx_ai_usage_events_created
        on ai_usage_events(created_at desc)
      `;
      await sql`
        create index if not exists idx_ai_usage_events_user_created
        on ai_usage_events(user_id, created_at desc)
      `;
    })().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }
  await schemaPromise;
}

export async function recordAiUsage(input: AiUsageInput) {
  const inputTokens = Math.round(finiteNonNegative(input.inputTokens));
  const outputTokens = Math.round(finiteNonNegative(input.outputTokens));
  const totalTokens = Math.round(
    finiteNonNegative(input.totalTokens) || inputTokens + outputTokens
  );
  const audioSeconds = input.audioSeconds == null ? null : finiteNonNegative(input.audioSeconds);
  const estimatedCostUsd = estimateAiCostUsd({
    feature: input.feature,
    model: input.model,
    inputTokens,
    outputTokens
  });
  const createdAt = new Date().toISOString();

  if (hasDatabaseUrl()) {
    try {
      await ensureAiUsageSchema();
      const sql = getSql();
      await sql`
        insert into ai_usage_events (
          id,
          user_id,
          feature,
          model,
          input_tokens,
          output_tokens,
          total_tokens,
          audio_seconds,
          estimated_cost_usd,
          created_at
        )
        values (
          ${crypto.randomUUID()},
          ${input.userId ?? null},
          ${input.feature},
          ${input.model},
          ${inputTokens},
          ${outputTokens},
          ${totalTokens},
          ${audioSeconds},
          ${estimatedCostUsd},
          ${createdAt}
        )
      `;
    } catch {
      // Usage telemetry must never block learner feedback.
    }
  }

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    try {
      getPostHogClient().capture({
        distinctId: input.userId ?? "system:anonymous-ai-usage",
        event: "ai_usage_recorded",
        properties: {
          feature: input.feature,
          model: input.model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: totalTokens,
          audio_seconds: audioSeconds,
          estimated_cost_usd: estimatedCostUsd,
          occurred_at: createdAt
        }
      });
    } catch {
      // PostHog delivery is best effort and contains no prompt or transcript data.
    }
  }
}

export async function getAiUsageSummary(): Promise<AiUsageSummary> {
  if (!hasDatabaseUrl()) {
    return {
      requests30d: 0,
      inputTokens30d: 0,
      outputTokens30d: 0,
      estimatedCostUsd30d: 0
    };
  }

  try {
    await ensureAiUsageSchema();
    const sql = getSql();
    const [row] = await sql<
      Array<{
        requests_30d: number;
        input_tokens_30d: number;
        output_tokens_30d: number;
        estimated_cost_usd_30d: number;
      }>
    >`
      select
        count(*)::int as requests_30d,
        coalesce(sum(input_tokens), 0)::int as input_tokens_30d,
        coalesce(sum(output_tokens), 0)::int as output_tokens_30d,
        coalesce(sum(estimated_cost_usd), 0)::float8 as estimated_cost_usd_30d
      from ai_usage_events
      where created_at > now() - interval '30 days'
    `;
    return {
      requests30d: row?.requests_30d ?? 0,
      inputTokens30d: row?.input_tokens_30d ?? 0,
      outputTokens30d: row?.output_tokens_30d ?? 0,
      estimatedCostUsd30d: Number(row?.estimated_cost_usd_30d ?? 0)
    };
  } catch {
    return {
      requests30d: 0,
      inputTokens30d: 0,
      outputTokens30d: 0,
      estimatedCostUsd30d: 0
    };
  }
}

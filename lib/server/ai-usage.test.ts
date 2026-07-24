import { afterEach, describe, expect, it, vi } from "vitest";
import { estimateAiCostUsd } from "@/lib/server/ai-usage";

describe("AI usage cost estimates", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the known GPT-4o mini text token rates", () => {
    expect(
      estimateAiCostUsd({
        feature: "speaking_feedback",
        model: "gpt-4o-mini",
        inputTokens: 1_000_000,
        outputTokens: 1_000_000
      })
    ).toBe(0.75);
  });

  it("uses the transcription model's audio token rates", () => {
    expect(
      estimateAiCostUsd({
        feature: "speaking_transcription",
        model: "gpt-4o-mini-transcribe",
        inputTokens: 1_000_000,
        outputTokens: 1_000_000
      })
    ).toBe(6.25);
  });

  it("returns null for a custom model without explicit rates", () => {
    expect(
      estimateAiCostUsd({
        feature: "writing_feedback",
        model: "custom-feedback-model",
        inputTokens: 500,
        outputTokens: 200
      })
    ).toBeNull();
  });

  it("honors explicit environment rate overrides", () => {
    vi.stubEnv("OPENAI_FEEDBACK_INPUT_USD_PER_1M", "2");
    vi.stubEnv("OPENAI_FEEDBACK_OUTPUT_USD_PER_1M", "8");

    expect(
      estimateAiCostUsd({
        feature: "writing_feedback",
        model: "custom-feedback-model",
        inputTokens: 250_000,
        outputTokens: 100_000
      })
    ).toBe(1.3);
  });
});

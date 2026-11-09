import { afterEach, expect, it, vi } from "vitest";
import { generateFeedbackReport } from "@/lib/server/openai";

const { reserveBudget } = vi.hoisted(() => ({ reserveBudget: vi.fn() }));
vi.mock("@/lib/server/rate-limit", () => ({ checkSharedRateLimit: reserveBudget }));

afterEach(() => {
  reserveBudget.mockReset();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it("stops production model requests before contacting OpenAI when the shared budget is exhausted", async () => {
  vi.stubEnv("APP_ENV", "production");
  vi.stubEnv("OPENAI_API_KEY", "test-fixture");
  reserveBudget.mockResolvedValue({ allowed: false, retryAfterSeconds: 60 });
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);

  await expect(generateFeedbackReport({
    examType: "IELTS",
    taskType: "ielts-part-1",
    promptTitle: "Fixture",
    promptText: "Fixture",
    difficulty: "easy",
    transcript: "Local fixture"
  })).rejects.toThrow("OpenAI request budget");
  expect(reserveBudget).toHaveBeenCalledWith(
    { key: expect.stringMatching(/^openai-request-budget:\d{4}-\d{2}-\d{2}$/), windowMs: 86_400_000, max: 24 },
    { key: expect.stringMatching(/^openai-request-budget:\d{4}-\d{2}$/), windowMs: 31 * 86_400_000, max: 120 }
  );
  expect(fetchMock).not.toHaveBeenCalled();
});

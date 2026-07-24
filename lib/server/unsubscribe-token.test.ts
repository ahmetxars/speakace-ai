import { afterEach, describe, expect, it } from "vitest";
import { generateUnsubscribeToken, verifyUnsubscribeToken } from "@/lib/server/unsubscribe-token";

const originalUnsubscribeSecret = process.env.UNSUBSCRIBE_SECRET;
const originalCronSecret = process.env.CRON_SECRET;

afterEach(() => {
  if (originalUnsubscribeSecret === undefined) {
    delete process.env.UNSUBSCRIBE_SECRET;
  } else {
    process.env.UNSUBSCRIBE_SECRET = originalUnsubscribeSecret;
  }

  if (originalCronSecret === undefined) {
    delete process.env.CRON_SECRET;
  } else {
    process.env.CRON_SECRET = originalCronSecret;
  }
});

describe("unsubscribe tokens", () => {
  it("verifies a normalized email with the dedicated secret", () => {
    process.env.UNSUBSCRIBE_SECRET = "test-unsubscribe-secret";
    const token = generateUnsubscribeToken(" Learner@Example.com ");

    expect(verifyUnsubscribeToken("learner@example.com", token)).toBe(true);
    expect(verifyUnsubscribeToken("other@example.com", token)).toBe(false);
  });

  it("falls back to the cron secret used by production email jobs", () => {
    delete process.env.UNSUBSCRIBE_SECRET;
    process.env.CRON_SECRET = "test-cron-secret";
    const token = generateUnsubscribeToken("learner@example.com");

    expect(verifyUnsubscribeToken("learner@example.com", token)).toBe(true);
  });
});

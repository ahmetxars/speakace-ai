import { afterEach, describe, expect, it } from "vitest";
import {
  buildLifecycleEmailClickUrl,
  generateLifecycleEmailToken,
  getLifecycleEmailDestination,
  verifyLifecycleEmailToken
} from "@/lib/server/lifecycle-email-link";

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

describe("lifecycle email links", () => {
  it("round-trips an opaque, expiring campaign token", () => {
    process.env.UNSUBSCRIBE_SECRET = "test-lifecycle-secret";
    const now = new Date("2026-07-28T07:00:00.000Z");
    const token = generateLifecycleEmailToken({
      userId: "user-123",
      campaign: "daily_tip",
      now
    });

    expect(token).not.toContain("user-123");
    expect(verifyLifecycleEmailToken(token, new Date("2026-07-29T07:00:00.000Z"))).toMatchObject({
      userId: "user-123",
      campaign: "daily_tip",
      issuedAt: now.getTime()
    });
    expect(getLifecycleEmailDestination("daily_tip")).toContain("activation=email_daily_tip");
  });

  it("rejects tampered and expired tokens", () => {
    process.env.UNSUBSCRIBE_SECRET = "test-lifecycle-secret";
    const now = new Date("2026-07-01T07:00:00.000Z");
    const token = generateLifecycleEmailToken({
      userId: "user-123",
      campaign: "daily_tip",
      now
    });

    expect(verifyLifecycleEmailToken(`${token.slice(0, -1)}x`, now)).toBeNull();
    expect(verifyLifecycleEmailToken(token, new Date("2026-07-16T07:00:01.000Z"))).toBeNull();
  });

  it("builds a SpeakAce redirect without exposing the user id", () => {
    process.env.UNSUBSCRIBE_SECRET = "test-lifecycle-secret";
    const url = buildLifecycleEmailClickUrl({
      userId: "user-123",
      campaign: "daily_tip",
      now: new Date("2026-07-28T07:00:00.000Z")
    });

    expect(url).toContain("/api/email/continue?token=");
    expect(url).not.toContain("user-123");
  });
});

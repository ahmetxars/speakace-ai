import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  trackAnalyticsEvent: vi.fn()
}));

vi.mock("@/lib/analytics-store", () => ({
  trackAnalyticsEvent: mocks.trackAnalyticsEvent
}));

import { GET } from "@/app/api/email/continue/route";
import { generateLifecycleEmailToken } from "@/lib/server/lifecycle-email-link";

const originalUnsubscribeSecret = process.env.UNSUBSCRIBE_SECRET;

function verifiedNavigationRequest(token: string) {
  return new Request(`https://speakace.org/api/email/continue?token=${token}`, {
    headers: {
      "sec-fetch-mode": "navigate",
      "sec-fetch-dest": "document",
      "sec-fetch-user": "?1"
    }
  });
}

describe("lifecycle email redirect", () => {
  beforeEach(() => {
    process.env.UNSUBSCRIBE_SECRET = "test-lifecycle-secret";
    mocks.trackAnalyticsEvent.mockReset();
  });

  afterEach(() => {
    if (originalUnsubscribeSecret === undefined) {
      delete process.env.UNSUBSCRIBE_SECRET;
    } else {
      process.env.UNSUBSCRIBE_SECRET = originalUnsubscribeSecret;
    }
  });

  it("records a verified human click before opening the attributed practice", async () => {
    const token = generateLifecycleEmailToken({
      userId: "user-123",
      campaign: "daily_tip"
    });
    const response = await GET(verifiedNavigationRequest(token));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/app/practice?");
    expect(response.headers.get("location")).toContain("activation=email_daily_tip");
    expect(response.headers.get("location")).toContain("runMode=drill");
    expect(mocks.trackAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-123",
        event: "email_cta_click",
        path: "/app/practice/email_daily_tip",
        eventId: expect.stringContaining("email-cta:daily_tip:user-123:"),
        source: "verified_navigation:daily_tip",
        occurredAt: expect.any(String)
      })
    );
  });

  it("preserves the attributed challenge for scanners without counting a click", async () => {
    const token = generateLifecycleEmailToken({
      userId: "user-123",
      campaign: "daily_tip"
    });
    const response = await GET(
      new Request(`https://speakace.org/api/email/continue?token=${token}`, {
        headers: {
          purpose: "prefetch",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty"
        }
      })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("activation=email_daily_tip");
    expect(response.headers.get("location")).toContain("runMode=drill");
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("preserves quick start when an email browser omits Sec-Fetch-User", async () => {
    const token = generateLifecycleEmailToken({
      userId: "user-123",
      campaign: "daily_tip"
    });
    const response = await GET(
      new Request(`https://speakace.org/api/email/continue?token=${token}`, {
        headers: {
          "sec-fetch-mode": "navigate",
          "sec-fetch-dest": "document"
        }
      })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("activation=email_daily_tip");
    expect(response.headers.get("location")).toContain("quickStart=1");
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("sends invalid links to the safe practice fallback", async () => {
    const response = await GET(verifiedNavigationRequest("invalid-token"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://speakace.org/app/practice");
    expect(mocks.trackAnalyticsEvent).not.toHaveBeenCalled();
  });
});

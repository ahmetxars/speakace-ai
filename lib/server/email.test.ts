import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCommercialEmailConfigurationStatus,
  isDefiniteEmailRejection,
  resolveEmailReplyTo,
  sendEmail,
  sendLeadMagnetEmail,
  sendPurchaseAccountClaimEmail
} from "@/lib/server/email";

const { reserveEmailBudget } = vi.hoisted(() => ({ reserveEmailBudget: vi.fn() }));
vi.mock("@/lib/server/rate-limit", () => ({ checkSharedRateLimit: reserveEmailBudget }));

const managedEnvKeys = [
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "EMAIL_REPLY_TO",
  "NEXT_PUBLIC_SITE_URL",
  "UNSUBSCRIBE_SECRET",
  "COMPANY_LEGAL_NAME",
  "COMPANY_POSTAL_ADDRESS"
] as const;
const originalEnv = Object.fromEntries(managedEnvKeys.map((key) => [key, process.env[key]]));

beforeEach(() => {
  for (const key of managedEnvKeys) delete process.env[key];
  process.env.UNSUBSCRIBE_SECRET = "email-test-unsubscribe-secret";
  reserveEmailBudget.mockReset();
});

afterEach(() => {
  for (const key of managedEnvKeys) {
    const value = originalEnv[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("email reply routing", () => {
  it("uses the current SpeakAce contact inbox when no override exists", () => {
    expect(resolveEmailReplyTo(undefined)).toBe("aa.arslan@outlook.com.tr");
  });

  it("replaces the lost legacy inbox even when it remains in production env", () => {
    expect(resolveEmailReplyTo("info@speakace.org")).toBe("aa.arslan@outlook.com.tr");
  });

  it("preserves a valid explicit reply-to override", () => {
    expect(resolveEmailReplyTo(" support@example.com ")).toBe("support@example.com");
  });
});

describe("commercial email delivery safety", () => {
  it("reports missing legal identity without exposing configured values", () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "SpeakAce <mail@speakace.org>";

    expect(getCommercialEmailConfigurationStatus()).toEqual({
      transportConfigured: true,
      legalIdentityConfigured: false,
      ready: false
    });

    process.env.COMPANY_LEGAL_NAME = "SpeakAce Labs";
    process.env.COMPANY_POSTAL_ADDRESS = "Example Street 10, Amsterdam";
    expect(getCommercialEmailConfigurationStatus()).toEqual({
      transportConfigured: true,
      legalIdentityConfigured: true,
      ready: true
    });
  });

  it("fails closed when a configured transport has no legal sender identity", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "SpeakAce <mail@speakace.org>";

    await expect(sendLeadMagnetEmail({
      to: "learner@example.test",
      confirmationUrl: "https://speakace.org/api/marketing/lead/confirm?token=signed",
      idempotencyKey: "lead-guide-test"
    })).rejects.toThrow("Email configuration error: COMPANY_LEGAL_NAME and COMPANY_POSTAL_ADDRESS");
  });

  it("sends an idempotency key, one-click unsubscribe headers, and the postal footer", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "SpeakAce <mail@speakace.org>";
    process.env.NEXT_PUBLIC_SITE_URL = "https://speakace.org";
    process.env.COMPANY_LEGAL_NAME = "SpeakAce Labs & Co";
    process.env.COMPANY_POSTAL_ADDRESS = "Example Street 10, 1000 Amsterdam, Netherlands";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendLeadMagnetEmail({
      to: "learner@example.test",
      confirmationUrl: "https://speakace.org/api/marketing/lead/confirm?token=signed",
      idempotencyKey: "lead-guide-test"
    })).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ "Idempotency-Key": "lead-guide-test" });
    const body = JSON.parse(String(init.body)) as {
      html: string;
      text: string;
      headers: Record<string, string>;
    };
    expect(body.html).toContain("SpeakAce Labs &amp; Co");
    expect(body.html).toContain("Example Street 10, 1000 Amsterdam, Netherlands");
    expect(body.text).toContain("SpeakAce Labs & Co, Example Street 10");
    expect(body.headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });

  it("retries an ambiguous network failure with the same idempotent payload", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "SpeakAce <mail@speakace.org>";
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError("network unavailable"))
      .mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendEmail({
      to: "learner@example.test",
      subject: "Retry-safe message",
      html: "<p>Same payload</p>",
      text: "Same payload",
      idempotencyKey: "retry-safe-message"
    })).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]).toEqual(fetchMock.mock.calls[0]);
  });

  it("does not contact Resend when the shared production budget is exhausted", async () => {
    vi.stubEnv("APP_ENV", "production");
    process.env.RESEND_API_KEY = "re_test_key";
    reserveEmailBudget.mockResolvedValue({ allowed: false, retryAfterSeconds: 60 });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendEmail({
      to: "learner@example.test",
      subject: "Budget fixture",
      html: "<p>Fixture</p>",
      text: "Fixture"
    })).rejects.toThrow("daily email budget");
    expect(reserveEmailBudget).toHaveBeenCalledWith({
      key: expect.stringMatching(/^resend-send-budget:\d{4}-\d{2}-\d{2}$/),
      windowMs: 86_400_000,
      max: 80
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps an idempotency payload conflict ambiguous for manual reconciliation", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "SpeakAce <mail@speakace.org>";
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ name: "invalid_idempotent_request" }),
      { status: 409 }
    ));
    vi.stubGlobal("fetch", fetchMock);

    let caught: unknown;
    try {
      await sendEmail({
        to: "learner@example.test",
        subject: "Changed payload",
        html: "<p>Changed payload</p>",
        text: "Changed payload",
        idempotencyKey: "existing-message"
      });
    } catch (error) {
      caught = error;
    }

    expect(caught).toBeInstanceOf(Error);
    expect((caught as Error).message).toContain("Email send ambiguous");
    expect(isDefiniteEmailRejection(caught)).toBe(false);
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

describe("purchase access delivery", () => {
  it("sends a retry-safe transactional account claim without marketing headers", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.EMAIL_FROM = "SpeakAce <info@mail.speakace.org>";
    process.env.NEXT_PUBLIC_SITE_URL = "https://speakace.org";
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(sendPurchaseAccountClaimEmail({
      to: "buyer@example.test",
      plan: "plus",
      idempotencyKey: "purchase-account-claim:event-1"
    })).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({
      "Idempotency-Key": "purchase-account-claim:event-1"
    });
    const body = JSON.parse(String(init.body)) as {
      subject: string;
      html: string;
      text: string;
      headers?: Record<string, string>;
    };
    expect(body.subject).toBe("Your SpeakAce Plus access is ready");
    expect(body.html).toContain("the same email address this message was sent to");
    expect(body.html).toContain("/auth?mode=signup&amp;intent=purchase_claim");
    expect(body.text).toContain("/auth?mode=signup&intent=purchase_claim");
    expect(body.headers).toBeUndefined();
  });
});

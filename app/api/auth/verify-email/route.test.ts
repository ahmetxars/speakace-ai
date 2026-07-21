import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  cookieSet: vi.fn(),
  createAuthSession: vi.fn(),
  getSessionCookieName: vi.fn(),
  getSessionCookieOptions: vi.fn(),
  verifyEmailToken: vi.fn(),
  checkRateLimit: vi.fn(),
  getRequestIp: vi.fn(),
  posthogCapture: vi.fn()
}));

vi.mock("next/headers", () => ({
  cookies: mocks.cookies
}));

vi.mock("@/lib/server/auth", () => ({
  createAuthSession: mocks.createAuthSession,
  getSessionCookieName: mocks.getSessionCookieName,
  getSessionCookieOptions: mocks.getSessionCookieOptions,
  verifyEmailToken: mocks.verifyEmailToken
}));

vi.mock("@/lib/server/rate-limit", () => ({
  checkRateLimit: mocks.checkRateLimit,
  getRequestIp: mocks.getRequestIp
}));

vi.mock("@/lib/posthog-server", () => ({
  getPostHogClient: () => ({ capture: mocks.posthogCapture })
}));

import { GET } from "@/app/api/auth/verify-email/route";

describe("email verification activation", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();

    mocks.cookies.mockResolvedValue({ set: mocks.cookieSet });
    mocks.checkRateLimit.mockReturnValue({ allowed: true, retryAfterSeconds: 0 });
    mocks.getRequestIp.mockReturnValue("127.0.0.1");
    mocks.getSessionCookieName.mockReturnValue("speakace_session");
    mocks.getSessionCookieOptions.mockReturnValue({
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      expires: new Date("2026-08-01T00:00:00.000Z")
    });
    mocks.verifyEmailToken.mockResolvedValue({ ok: true, userId: "user-1" });
    mocks.createAuthSession.mockResolvedValue({
      token: "session-token",
      expiresAt: new Date("2026-08-01T00:00:00.000Z")
    });
  });

  it("creates a signed-in session immediately after a valid verification", async () => {
    const response = await GET(new Request("https://speakace.org/api/auth/verify-email?token=valid-token"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, authenticated: true });
    expect(mocks.verifyEmailToken).toHaveBeenCalledWith("valid-token");
    expect(mocks.createAuthSession).toHaveBeenCalledWith("user-1");
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      "speakace_session",
      "session-token",
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: "strict" })
    );
    expect(mocks.posthogCapture).toHaveBeenCalledWith({
      distinctId: "user-1",
      event: "email_verification_completed",
      properties: { token_present: true, session_created: true }
    });
  });

  it("does not create a session when the verification token is invalid", async () => {
    mocks.verifyEmailToken.mockRejectedValueOnce(new Error("Verification link is invalid or expired."));

    const response = await GET(new Request("https://speakace.org/api/auth/verify-email?token=expired-token"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Verification link is invalid or expired." });
    expect(mocks.createAuthSession).not.toHaveBeenCalled();
    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });
});

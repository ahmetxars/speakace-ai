import { afterEach, describe, expect, it, vi } from "vitest";
import { getSessionCookieOptions } from "@/lib/server/auth";

describe("session cookie options", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("supports the OAuth top-level return without allowing cross-site unsafe requests", () => {
    vi.stubEnv("APP_ENV", "production");
    const expires = new Date("2026-09-25T00:00:00.000Z");

    expect(getSessionCookieOptions(expires)).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires
    });
  });

  it("keeps local development cookies compatible with HTTP", () => {
    vi.stubEnv("APP_ENV", "development");

    expect(getSessionCookieOptions(new Date()).secure).toBe(false);
  });
});

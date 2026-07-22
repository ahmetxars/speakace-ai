import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/auth/google/route";

describe("Google OAuth initiation", () => {
  beforeEach(() => {
    vi.stubEnv("GOOGLE_CLIENT_ID", "google-client-id");
    vi.stubEnv("GOOGLE_CLIENT_SECRET", "google-client-secret");
    vi.stubEnv("GOOGLE_REDIRECT_URI", "https://speakace.org/api/auth/google/callback");
    vi.stubEnv("OAUTH_STATE_SIGNING_KEY", "oauth-state-signing-key");
    vi.stubEnv("APP_ENV", "production");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("redirects to Google with signed state and a matching secure nonce cookie", async () => {
    const response = await GET(
      new Request(
        "https://speakace.org/api/auth/google?mode=signup&memberType=teacher&referralCode=ace10&next=%2Fapp%2Fwriting"
      )
    );

    expect(response.status).toBe(307);
    const location = response.headers.get("location");
    expect(location).toBeTruthy();

    const authUrl = new URL(location!);
    expect(authUrl.origin).toBe("https://accounts.google.com");
    expect(authUrl.pathname).toBe("/o/oauth2/v2/auth");
    expect(authUrl.searchParams.get("client_id")).toBe("google-client-id");
    expect(authUrl.searchParams.get("redirect_uri")).toBe("https://speakace.org/api/auth/google/callback");
    expect(authUrl.searchParams.get("scope")).toBe("openid email profile");

    const state = authUrl.searchParams.get("state");
    expect(state).toBeTruthy();
    const [payload, signature] = state!.split(".", 2);
    expect(payload).toBeTruthy();
    expect(signature).toBeTruthy();

    const parsedState = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      nonce: string;
      mode: string;
      memberType: string;
      referralCode: string;
      next: string;
    };
    expect(parsedState).toMatchObject({
      mode: "signup",
      memberType: "teacher",
      referralCode: "ACE10",
      next: "/app/writing",
    });

    const cookie = response.headers.get("set-cookie");
    expect(cookie).toContain(`speakace_google_oauth_state=${parsedState.nonce}`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("Secure");
    expect(cookie).toContain("SameSite=lax");
  });

  it("drops an external next target from OAuth state", async () => {
    const response = await GET(
      new Request("https://speakace.org/api/auth/google?mode=signin&next=https%3A%2F%2Fevil.example%2Fsteal")
    );

    const authUrl = new URL(response.headers.get("location")!);
    const [payload] = authUrl.searchParams.get("state")!.split(".", 2);
    const parsedState = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { next: string | null };
    expect(parsedState.next).toBeNull();
  });

  it("fails safely when the independent state signing key is missing", async () => {
    vi.stubEnv("OAUTH_STATE_SIGNING_KEY", "");

    const response = await GET(new Request("https://speakace.org/api/auth/google?mode=signin"));

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      error: "OAUTH_STATE_SIGNING_KEY is not set. Set it to a strong random value separate from GOOGLE_CLIENT_SECRET.",
    });
  });
});

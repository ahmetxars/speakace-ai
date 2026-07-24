import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  capture: vi.fn(),
  identify: vi.fn(),
  PostHog: vi.fn()
}));

vi.mock("posthog-node", () => ({
  PostHog: mocks.PostHog
}));

describe("PostHog server configuration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    mocks.capture.mockReset();
    mocks.identify.mockReset();
    mocks.PostHog.mockReset();
    mocks.PostHog.mockImplementation(() => ({
      capture: mocks.capture,
      identify: mocks.identify
    }));
  });

  it("uses a no-op client when the project key is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ANALYTICS", "true");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "");
    const { getPostHogClient, isPostHogConfigured } = await import("@/lib/posthog-server");

    const client = getPostHogClient();
    client.capture({ distinctId: "user-1", event: "test_event" });
    client.identify({ distinctId: "user-1" });

    expect(isPostHogConfigured()).toBe(false);
    expect(mocks.PostHog).not.toHaveBeenCalled();
  });

  it("does not initialize PostHog when analytics is disabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ANALYTICS", "false");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    const { getPostHogClient, isPostHogConfigured } = await import("@/lib/posthog-server");

    getPostHogClient();

    expect(isPostHogConfigured()).toBe(false);
    expect(mocks.PostHog).not.toHaveBeenCalled();
  });

  it("initializes the configured EU client once", async () => {
    vi.stubEnv("NEXT_PUBLIC_ENABLE_ANALYTICS", "true");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_KEY", "phc_test");
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_HOST", "");
    const { getPostHogClient, isPostHogConfigured } = await import("@/lib/posthog-server");

    const firstClient = getPostHogClient();
    const secondClient = getPostHogClient();

    expect(isPostHogConfigured()).toBe(true);
    expect(firstClient).toBe(secondClient);
    expect(mocks.PostHog).toHaveBeenCalledTimes(1);
    expect(mocks.PostHog).toHaveBeenCalledWith("phc_test", {
      host: "https://eu.i.posthog.com",
      flushAt: 1,
      flushInterval: 0
    });
  });
});

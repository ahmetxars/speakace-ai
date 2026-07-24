import { PostHog } from "posthog-node";

type PostHogCaptureClient = Pick<PostHog, "capture" | "identify">;

const noopPostHogClient: PostHogCaptureClient = {
  capture: () => undefined,
  identify: () => undefined
};

let posthogClient: PostHogCaptureClient | null = null;

export function isPostHogConfigured() {
  return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== "false"
    && Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim());
}

export function getPostHogClient(): PostHogCaptureClient {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  if (!isPostHogConfigured() || !posthogKey) {
    return noopPostHogClient;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(posthogKey, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com",
      flushAt: 1,
      flushInterval: 0
    });
  }
  return posthogClient;
}

// External analytics are disabled. Keep this no-op interface for existing call
// sites; service, billing and AI usage records remain in our own database.
type PostHogCaptureClient = {
  capture: (event: {
    distinctId: string;
    event: string;
    properties?: Record<string, unknown>;
  }) => void;
  identify: (event: {
    distinctId: string;
    properties?: Record<string, unknown>;
  }) => void;
};
const noopPostHogClient: PostHogCaptureClient = {
  capture: () => undefined,
  identify: () => undefined,
};
export function isPostHogConfigured() {
  return false;
}
export function getPostHogClient(): PostHogCaptureClient {
  return noopPostHogClient;
}

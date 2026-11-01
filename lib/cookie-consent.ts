export const CONSENT_COOKIE = "speakace_consent";
export const CONSENT_VERSION = "2026-11-01";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;
export type CookieConsent = {
  version: string;
  analytics: boolean;
  savedAt: number;
};

export function parseCookieConsent(
  value?: string | null,
): CookieConsent | null {
  if (!value) return null;
  try {
    const data = JSON.parse(decodeURIComponent(value)) as CookieConsent;
    if (
      data.version !== CONSENT_VERSION ||
      typeof data.analytics !== "boolean" ||
      !Number.isFinite(data.savedAt) ||
      data.savedAt > Date.now() ||
      Date.now() - data.savedAt >= CONSENT_MAX_AGE * 1000
    )
      return null;
    return {
      version: data.version,
      analytics: data.analytics,
      savedAt: data.savedAt,
    };
  } catch {
    return null;
  }
}
export function readCookieConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  return parseCookieConsent(value);
}
export function hasAnalyticsConsent() {
  return readCookieConsent()?.analytics === true;
}

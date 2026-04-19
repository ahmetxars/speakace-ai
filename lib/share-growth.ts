import { ExamType } from "@/lib/types";

export const SHARE_ATTRIBUTION_STORAGE_KEY = "speakace-share-attribution";

export function buildShareAttributionPath(slug: string) {
  return `/share/${slug}?utm_source=public_share&utm_medium=organic_social&utm_campaign=result_card&utm_content=${slug}`;
}

export function buildShareSignupHref(slug: string) {
  const params = new URLSearchParams({
    mode: "signup",
    cta: buildShareAttributionPath(slug),
    cta_event: "signup_completed",
    share_ref: slug,
    utm_source: "public_share",
    utm_medium: "organic_social",
    utm_campaign: "result_card",
    utm_content: slug
  });
  return `/auth?${params.toString()}`;
}

export function buildSharePricingHref(slug: string) {
  const params = new URLSearchParams({
    cta: buildShareAttributionPath(slug),
    cta_event: "pricing_cta_click",
    share_ref: slug,
    utm_source: "public_share",
    utm_medium: "organic_social",
    utm_campaign: "result_card",
    utm_content: slug
  });
  return `/pricing?${params.toString()}`;
}

export function getShareAttributionFromStorage() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SHARE_ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { path?: string; capturedAt?: string };
    return typeof parsed.path === "string" && parsed.path.startsWith("/share/") ? parsed : null;
  } catch {
    return null;
  }
}

export function persistShareAttribution(path: string) {
  if (typeof window === "undefined" || !path.startsWith("/share/")) return;
  try {
    window.localStorage.setItem(
      SHARE_ATTRIBUTION_STORAGE_KEY,
      JSON.stringify({ path, capturedAt: new Date().toISOString() })
    );
  } catch {
    // best-effort only
  }
}

export function clearShareAttribution() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(SHARE_ATTRIBUTION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function estimateScorePercentile(score: number, examType: ExamType) {
  const normalized = examType === "IELTS" ? score / 9 : score / 4;
  const percentile = Math.max(42, Math.min(98, Math.round(38 + normalized * 58)));
  return percentile;
}

export function buildCountrySignal(localeFlag: string, percentile: number) {
  if (percentile >= 92) return `${localeFlag} top-tier momentum`;
  if (percentile >= 82) return `${localeFlag} above-average momentum`;
  if (percentile >= 68) return `${localeFlag} strong improvement signal`;
  return `${localeFlag} rising score signal`;
}

export function estimateCountryRank(score: number, examType: ExamType, localeFlag: string) {
  const percentile = estimateScorePercentile(score, examType);
  const rank = Math.max(3, 120 - percentile);
  return {
    percentile,
    percentileLabel: `Top ${Math.max(2, 100 - percentile + 1)}% estimated`,
    countrySignal: buildCountrySignal(localeFlag, percentile),
    countryRankLabel: `${localeFlag} rank vibe #${rank}`
  };
}

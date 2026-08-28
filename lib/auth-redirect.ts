import type { MemberType } from "@/lib/types";

export const GOOGLE_NEW_STUDENT_REDIRECT =
  "/app/practice?quickStart=1&runMode=interview&activation=google_signup";

const PRACTICE_SIGNUP_ATTRIBUTION: Record<string, string> = {
  cue_card_generator: "/tools/ielts-cue-card-generator#practice-cta",
  free_test_demo: "/free-ielts-speaking-test#demo-cta",
  free_test_primary: "/free-ielts-speaking-test#primary-cta",
  marketing_demo: "/#speaking-demo-cta"
};

export function resolvePracticeAuthEntry(activation: string | null | undefined) {
  const normalizedActivation = activation?.trim() ?? "";
  const attributionPath = PRACTICE_SIGNUP_ATTRIBUTION[normalizedActivation] ?? null;
  return {
    mode: attributionPath ? "signup" as const : "signin" as const,
    attributionPath
  };
}

export function resolveSafeAppRedirect(value: string | null | undefined) {
  if (!value || value.length > 1000 || !value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const url = new URL(value, "https://speakace.org");
    if (url.origin !== "https://speakace.org") return null;
    const isAppPath = url.pathname === "/app" || url.pathname.startsWith("/app/");
    const isCheckoutPath = url.pathname === "/api/payments/lemon/checkout";
    if (!isAppPath && !isCheckoutPath) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function resolveGoogleCallbackRedirect(input: {
  requestedNext?: string | null;
  isNewUser: boolean;
  memberType?: MemberType | null;
}) {
  const requestedNext = resolveSafeAppRedirect(input.requestedNext);
  if (requestedNext) return requestedNext;

  if (input.isNewUser && input.memberType === "student") {
    return GOOGLE_NEW_STUDENT_REDIRECT;
  }

  return "/app";
}

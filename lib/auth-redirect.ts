import type { MemberType } from "@/lib/types";

export const GOOGLE_NEW_STUDENT_REDIRECT =
  "/app/practice?quickStart=1&runMode=interview&activation=google_signup";

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

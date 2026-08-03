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

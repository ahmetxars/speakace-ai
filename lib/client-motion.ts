/** Small shared bridge from CSS motion tokens to the Web Animations API. */
export function motionAllowed() {
  return typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    document.visibilityState !== "hidden";
}

export function motionTiming(element: Element, kind: "fast" | "ui" | "panel" | "reveal" = "ui") {
  const tokens = getComputedStyle(element);
  return {
    duration: Number.parseFloat(tokens.getPropertyValue(`--motion-${kind}`)) || 0,
    easing: tokens.getPropertyValue(kind === "reveal" ? "--motion-enter" : "--motion-ease").trim() || "linear"
  };
}

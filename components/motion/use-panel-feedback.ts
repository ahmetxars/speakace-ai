"use client";

import { useLayoutEffect, useRef } from "react";
import { motionAllowed, motionTiming } from "@/lib/client-motion";

/** A small entrance after a deliberate pointer selection, never while typing or tabbing. */
export function usePanelFeedback(value: string, distance = 4) {
  const ref = useRef<HTMLDivElement>(null);
  const previous = useRef(value);
  const pointer = useRef(false);
  useLayoutEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    const node = ref.current;
    if (!pointer.current || !node?.animate || !motionAllowed()) return;
    const animation = node.animate(
      [{ opacity: 0.75, transform: `translateY(${distance}px)` }, { opacity: 1, transform: "translateY(0px)" }],
      motionTiming(node, "ui")
    );
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => { if (media.matches || document.hidden) animation.finish(); };
    const focus = () => animation.finish();
    media.addEventListener("change", finish);
    document.addEventListener("visibilitychange", finish);
    node.addEventListener("focusin", focus);
    return () => { animation.cancel(); media.removeEventListener("change", finish); document.removeEventListener("visibilitychange", finish); node.removeEventListener("focusin", focus); };
  }, [value, distance]);
  return { ref, input: {
    onPointerDownCapture: () => { pointer.current = true; },
    onKeyDownCapture: () => { pointer.current = false; }
  } };
}

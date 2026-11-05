"use client";

import { useEffect, useRef } from "react";

/** Decorative timelines only run in view; the unenhanced markup is the complete scene. */
export function useSceneLife<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      const inactive = node.closest("[inert]");
      const active = visible && !inactive && !document.hidden && !media.matches;
      node.dataset.motion = active ? "running" : "still";
      if (visible && !inactive && !media.matches) node.dataset.entered = "true";
      if (!active && node.dataset.entered) {
        // Settle one-shot CSS assembly into a readable resting scene. Ambient loops pause.
        node.getAnimations?.({ subtree: true }).forEach((animation) => {
          if ("animationName" in animation && animation.effect?.getTiming().iterations !== Infinity) animation.finish();
        });
      }
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.12 });
    const stack = node.closest(".preview-scenes");
    const selection = new MutationObserver(sync);
    if (stack) selection.observe(stack, { attributes: true, subtree: true, attributeFilter: ["inert", "aria-hidden"] });
    observer.observe(node);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      selection.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return ref;
}

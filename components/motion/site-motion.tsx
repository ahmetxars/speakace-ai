"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motionAllowed, motionTiming } from "@/lib/client-motion";

/** Progressive enhancement: SSR content is visible even if observers or animation fail. */
export function SiteMotion() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname?.startsWith("/app") || pathname?.startsWith("/admin")) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const active = new Map<Animation, HTMLElement>();
    const finish = () => { if (media.matches || document.hidden) active.forEach((_, animation) => animation.finish()); };
    media.addEventListener("change", finish);
    document.addEventListener("visibilitychange", finish);
    const focus = (event: FocusEvent) => { active.forEach((target, animation) => { if (event.target instanceof Node && target.contains(event.target)) animation.finish(); }); };
    document.addEventListener("focusin", focus);
    const selectors = [
      "[data-reveal]", ".programme-hero-copy", ".programme-preview", ".programme-section-intro", ".programme-workflow-steps",
      ".about-story-hero-copy", ".about-story-principle-grid", ".about-story-loop-copy",
      ".resource-hub-hero-copy", ".resource-library-head", ".resource-hub-reading-head",
      ".blog-index-hero", ".blog-library-head", ".auth-entry-frame", ".hero-grid > :first-child"
    ];
    const targets = Array.from(document.querySelectorAll<HTMLElement>(selectors.join(",")));
    const observer: IntersectionObserver | null = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        observer?.unobserve(target);
        if (!motionAllowed() || !(target instanceof HTMLElement) || !target.animate) return;
        const compact = window.matchMedia("(max-width: 640px)").matches;
        const accountForm = target.matches(".auth-entry-frame");
        const animation = target.animate(
          [{ opacity: 0.65, transform: `translateY(${accountForm ? 6 : compact ? 8 : 14}px)` }, { opacity: 1, transform: "translateY(0px)" }],
          { ...motionTiming(target, accountForm ? "ui" : "reveal"), delay: Number(target.dataset.revealDelay || 0) }
        );
        active.set(animation, target);
        animation.finished.catch(() => undefined).finally(() => active.delete(animation));
      });
    }, { threshold: 0.12 }) : null;
    targets.forEach((target) => observer?.observe(target));
    return () => { observer?.disconnect(); active.forEach((_, animation) => animation.cancel()); media.removeEventListener("change", finish); document.removeEventListener("visibilitychange", finish); document.removeEventListener("focusin", focus); };
  }, [pathname]);
  return null;
}

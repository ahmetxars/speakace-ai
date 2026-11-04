"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { motionAllowed, motionTiming } from "@/lib/client-motion";

type MotionDisclosureProps = { title: ReactNode; children: ReactNode };

/** Native details is the no-JS fallback; JS only adds cancellable open/close motion. */
export function MotionDisclosure({ title, children }: MotionDisclosureProps) {
  const id = useId();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<Animation | null>(null);
  const targetRef = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [enhanced, setEnhanced] = useState(false);

  useEffect(() => {
    setEnhanced(true);
    targetRef.current = Boolean(detailsRef.current?.open);
    setExpanded(targetRef.current);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finish = () => { if (media.matches || document.hidden) animationRef.current?.finish(); };
    media.addEventListener("change", finish);
    document.addEventListener("visibilitychange", finish);
    return () => { media.removeEventListener("change", finish); document.removeEventListener("visibilitychange", finish); animationRef.current?.cancel(); };
  }, []);

  const toggle = (event: MouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    const body = bodyRef.current;
    if (!details || !body) return;
    event.preventDefault();
    const opening = !targetRef.current;
    const start = details.open ? body.getBoundingClientRect().height : 0;
    animationRef.current?.cancel();
    animationRef.current = null;
    targetRef.current = opening;
    setExpanded(opening);
    details.open = true;

    const settle = () => {
      details.open = opening;
      body.style.height = "";
      body.style.opacity = "";
    };
    if (!motionAllowed() || !body.animate || event.detail === 0) { settle(); return; }
    const end = opening ? body.firstElementChild?.getBoundingClientRect().height ?? body.scrollHeight : 0;
    body.style.height = `${start}px`;
    const animation = body.animate(
      [{ height: `${start}px`, opacity: opening && start === 0 ? 0.5 : 1 }, { height: `${end}px`, opacity: opening ? 1 : 0.5 }],
      { ...motionTiming(body, "panel"), fill: "both" }
    );
    animationRef.current = animation;
    animation.finished.then(() => {
      if (animationRef.current !== animation) return;
      settle();
      animation.cancel();
      animationRef.current = null;
    }).catch(() => undefined);
  };

  return (
    <details className="motion-disclosure" ref={detailsRef} data-expanded={expanded} onToggle={(event) => {
      if (!animationRef.current) { targetRef.current = event.currentTarget.open; setExpanded(event.currentTarget.open); }
    }}>
      <summary id={`${id}-trigger`} onClick={toggle} aria-expanded={enhanced ? expanded : undefined} aria-controls={`${id}-body`}>
        {title}<span className="disclosure-icon" aria-hidden="true">+</span>
      </summary>
      <div className="motion-disclosure-body" id={`${id}-body`} ref={bodyRef} role="region" aria-labelledby={`${id}-trigger`} aria-hidden={enhanced ? !expanded : undefined} inert={enhanced && !expanded}>
        <div>{children}</div>
      </div>
    </details>
  );
}

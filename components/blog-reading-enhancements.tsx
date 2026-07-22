"use client";

import type { Route } from "next";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

type BlogReadingEnhancementsProps = {
  ctaLabel: string;
  ctaDescription: string;
  ctaHref: Route;
  dismissLabel: string;
};

export function BlogReadingEnhancements({
  ctaLabel,
  ctaDescription,
  ctaHref,
  dismissLabel
}: BlogReadingEnhancementsProps) {
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const progressStyle = useMemo(() => ({ width: `${progress}%` }), [progress]);
  const showPracticeReminder = !dismissed && progress >= 10 && progress < 94;

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }
      const nextProgress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
      setProgress(nextProgress);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <>
      <div className="blog-reading-progress" aria-hidden="true">
        <div className="blog-reading-progress-bar" style={progressStyle} />
      </div>

      {showPracticeReminder ? (
        <aside className="card blog-sticky-cta">
          <button
            type="button"
            className="blog-sticky-cta-close"
            aria-label={dismissLabel}
            onClick={() => setDismissed(true)}
          >
            <X size={14} aria-hidden="true" />
          </button>
          <span className="eyebrow">Practice</span>
          <strong>{ctaLabel}</strong>
          <p>{ctaDescription}</p>
          <Link className="button button-primary" href={ctaHref}>
            Start Speaking Now
          </Link>
        </aside>
      ) : null}
    </>
  );
}

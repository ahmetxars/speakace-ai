"use client";

import type { CSSProperties, MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { trackClientEvent } from "@/lib/analytics-client";
import type { AnalyticsEventName } from "@/lib/analytics-store";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type TrackedLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  userId?: string | null;
  analyticsEvent?: AnalyticsEventName;
  analyticsPath?: string;
  gaEvent?: string;
  gaParams?: Record<string, unknown>;
  target?: string;
  rel?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

function trackGaEvent(eventName?: string, params?: Record<string, unknown>) {
  if (!eventName || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params ?? {});
}

export function TrackedLink({
  href,
  children,
  className,
  style,
  userId,
  analyticsEvent,
  analyticsPath,
  gaEvent,
  gaParams,
  target,
  rel,
  onClick
}: TrackedLinkProps) {
  const isExternal = /^https?:\/\//.test(href);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    void (analyticsEvent ? trackClientEvent({ userId, event: analyticsEvent, path: analyticsPath ?? href }) : Promise.resolve());
    trackGaEvent(gaEvent, gaParams);
  };

  if (isExternal) {
    return (
      <a href={href} className={className} style={style} target={target} rel={rel} onClick={handleClick}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} style={style} target={target} rel={rel} onClick={handleClick}>
      {children}
    </Link>
  );
}

"use client";

import type { CSSProperties, ComponentProps, MouseEvent, ReactNode } from "react";
import Link from "next/link";
import { trackClientEvent } from "@/lib/analytics-client";
import type { AnalyticsEventName } from "@/lib/analytics-store";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type BaseTrackedLinkProps = {
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

type InternalTrackedLinkProps = BaseTrackedLinkProps & {
  href: ComponentProps<typeof Link>["href"];
};

type ExternalTrackedLinkProps = BaseTrackedLinkProps & {
  href: string;
};

type TrackedLinkProps = InternalTrackedLinkProps | ExternalTrackedLinkProps;

function trackGaEvent(eventName?: string, params?: Record<string, unknown>) {
  if (!eventName || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", eventName, params ?? {});
}

function isExternalHref(href: TrackedLinkProps["href"]): href is ExternalTrackedLinkProps["href"] {
  return typeof href === "string" && /^https?:\/\//.test(href);
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
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    void (analyticsEvent ? trackClientEvent({ userId, event: analyticsEvent, path: analyticsPath ?? String(href) }) : Promise.resolve());
    trackGaEvent(gaEvent, gaParams);
  };

  if (isExternalHref(href)) {
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

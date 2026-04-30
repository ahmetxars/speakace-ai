"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseUnitProps = {
  className?: string;
};

export function AdSenseUnit({ className }: AdSenseUnitProps) {
  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
    } catch {
      // Ignore delayed or duplicate AdSense init calls during client navigation.
    }
  }, []);

  return (
    <section className={`adsense-shell ${className ?? ""}`.trim()} aria-label="Advertisement">
      <div className="adsense-label">Sponsored</div>
      <ins
        className="adsbygoogle adsense-unit"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5993485576421978"
        data-ad-slot="3315150391"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [phase, setPhase] = useState<"breathing" | "fading" | "hidden">("breathing");

  useEffect(() => {
    let hideTimer: ReturnType<typeof setTimeout>;

    const finish = () => {
      setPhase("fading");
      hideTimer = setTimeout(() => setPhase("hidden"), 500);
    };

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
      return () => {
        window.removeEventListener("load", finish);
        clearTimeout(hideTimer);
      };
    }

    return () => clearTimeout(hideTimer);
  }, []);

  if (phase === "hidden") return null;

  return (
    <div className="splash-overlay" data-phase={phase} aria-hidden="true">
      <div className="splash-content">
        <div className="splash-glow" />
        <Image
          src="/brand/speakace-logo.webp"
          alt="SpeakAce"
          width={160}
          height={55}
          priority
          className="splash-logo"
        />
        <p className="splash-name">SpeakAce AI</p>
      </div>
    </div>
  );
}

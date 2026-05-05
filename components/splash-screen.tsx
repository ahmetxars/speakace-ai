"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export function SplashScreen() {
  const [phase, setPhase] = useState<"filling" | "complete" | "hidden">("filling");

  useEffect(() => {
    let completeTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const finish = () => {
      setPhase("complete");
      hideTimer = setTimeout(() => setPhase("hidden"), 520);
    };

    if (document.readyState === "complete") {
      completeTimer = setTimeout(finish, 300);
    } else {
      const onLoad = () => { completeTimer = setTimeout(finish, 200); };
      window.addEventListener("load", onLoad, { once: true });
      return () => {
        window.removeEventListener("load", onLoad);
        clearTimeout(completeTimer);
        clearTimeout(hideTimer);
      };
    }

    return () => {
      clearTimeout(completeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      className="splash-overlay"
      data-phase={phase}
      aria-hidden="true"
    >
      <div className="splash-body">
        <Image
          src="/brand/speakace-logo.webp"
          alt="SpeakAce"
          width={140}
          height={48}
          priority
          className="splash-logo"
        />
        <p className="splash-tagline">AI-powered speaking practice</p>
      </div>

      <div className="splash-bar-track">
        <div className="splash-bar-fill" data-phase={phase} />
      </div>
    </div>
  );
}

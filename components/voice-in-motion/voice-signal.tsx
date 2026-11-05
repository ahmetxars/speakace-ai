import type { CSSProperties } from "react";

const bars = [12, 22, 35, 19, 46, 64, 31, 49, 77, 39, 57, 89, 54, 33, 71, 95, 61, 45, 81, 53, 100, 68, 39, 77, 50, 92, 58, 34, 69, 43, 82, 56, 30, 62, 41, 72, 48, 26, 56, 33, 44, 23, 35, 17, 26];

export function VoiceWave({ compact = false }: { compact?: boolean }) {
  return <div className={"voice-wave" + (compact ? " is-compact" : "")} aria-hidden="true">
    {bars.map((height, index) => <i key={index} style={{ height: height + "%", "--bar-delay": (index % 9) * -0.17 + "s" } as CSSProperties} />)}
    <span className="voice-wave-scan" />
  </div>;
}

/** Original shared motif. A path, its quieter echo, and a single travelling signal. */
export function SpeakAceVoiceSignal({ className = "", rings = false }: { className?: string; rings?: boolean }) {
  return <svg className={"voice-signal " + className} viewBox="0 0 600 240" fill="none" aria-hidden="true">
    {rings && <g className="voice-signal-rings"><ellipse cx="300" cy="120" rx="190" ry="95" /><ellipse cx="300" cy="120" rx="250" ry="118" /></g>}
    <path className="voice-signal-echo" d="M0 137H92C125 137 130 102 150 102S176 180 198 180S224 65 246 65S270 195 292 195S318 85 340 85S368 165 390 165S420 120 444 120S470 137 500 137H600" />
    <path className="voice-signal-path" pathLength="1" d="M0 120H92C125 120 130 82 150 82S176 174 198 174S224 32 246 32S270 208 292 208S318 58 340 58S368 162 390 162S420 102 444 102S470 120 500 120H600" />
    <path className="voice-signal-point" pathLength="1" d="M0 120H92C125 120 130 82 150 82S176 174 198 174S224 32 246 32S270 208 292 208S318 58 340 58S368 162 390 162S420 102 444 102S470 120 500 120H600" />
  </svg>;
}

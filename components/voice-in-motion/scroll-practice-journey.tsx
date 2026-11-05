"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight, AudioLines, Check, FileText, RotateCcw, Sparkles } from "lucide-react";
import { homeExamples } from "@/lib/home-demo-data";
import { homeTurkish } from "@/lib/home-translations";
import { SpeakAceVoiceSignal, VoiceWave } from "./voice-signal";
import { useSceneLife } from "./use-scene-life";

const journeySteps = [
  ["Pick a question.", "Make it yours.", "Choose an IELTS or TOEFL speaking task. Take a breath and answer in your own words."],
  ["Hear yourself.", "See the details.", "Read your transcript alongside AI feedback on fluency, vocabulary, grammar, and pronunciation."],
  ["Change one thing.", "Say it again.", "Put the feedback into your next attempt while the question is still fresh. Keep building from there."]
];
const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** One passive scroll listener, one read per measure, direct native animation progress. */
export function ScrollPracticeJourney({ tr }: { tr: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const t = (text: string) => tr ? homeTurkish[text] ?? text : text;
  useEffect(() => {
    const node = root.current;
    const visual = canvas.current;
    if (!node || !visual || typeof IntersectionObserver === "undefined" || typeof ResizeObserver === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 900px)");
    let visible = false, frame = 0, start = 0, range = 1, active = -1;
    const animations: Animation[] = [];
    const make = (selector: string, frames: Keyframe[]) => {
      const object = visual.querySelector<HTMLElement>(selector);
      if (!object?.animate) return;
      const animation = object.animate(frames, { duration: 1000, fill: "both", easing: "linear" });
      animation.pause();
      animations.push(animation);
    };
    make(".journey-question", [
      { transform: "translate(0px,0px) rotate(-2deg) scale(1)", opacity: 1, offset: 0 },
      { transform: "translate(-22px,-42px) rotate(-4deg) scale(.84)", opacity: .7, offset: .5 },
      { transform: "translate(-18px,-65px) rotate(-4deg) scale(.8)", opacity: .4, offset: 1 }
    ]);
    make(".journey-audio", [
      { transform: "translate(12px,50px) scale(.88)", opacity: .45, offset: 0 },
      { transform: "translate(0px,-12px) scale(1)", opacity: 1, offset: .5 },
      { transform: "translate(10px,82px) scale(.82)", opacity: .45, offset: 1 }
    ]);
    make(".journey-transcript", [
      { transform: "translate(20px,76px) rotate(4deg) scale(.86)", opacity: .2, offset: 0 },
      { transform: "translate(0px,-15px) rotate(-1deg) scale(.95)", opacity: 1, offset: .5 },
      { transform: "translate(-28px,-86px) rotate(0deg) scale(1)", opacity: 1, offset: 1 }
    ]);
    make(".journey-retry", [
      { transform: "translate(20px,42px) scale(.92)", opacity: .12, offset: 0 },
      { transform: "translate(10px,28px) scale(.95)", opacity: .2, offset: .5 },
      { transform: "translate(0px,-32px) scale(1)", opacity: 1, offset: 1 }
    ]);
    const update = () => {
      frame = 0;
      if (!visible || document.hidden || reduce.matches || !desktop.matches) return;
      const progress = clamp((window.scrollY - start) / range);
      animations.forEach((animation) => { animation.currentTime = progress * 1000; });
      const next = progress < .25 ? 0 : progress < .75 ? 1 : 2;
      if (active !== next) {
        active = next;
        node.dataset.stage = String(next);
        visual.dataset.stage = String(next);
      }
      const line = node.querySelector<HTMLElement>(".journey-timeline-fill");
      if (line) line.style.transform = "scaleY(" + Math.max(.04, progress).toFixed(3) + ")";
    };
    const schedule = () => { if (!frame && visible && !document.hidden && !reduce.matches && desktop.matches) frame = requestAnimationFrame(update); };
    const measure = () => {
      const bounds = node.getBoundingClientRect();
      const chapters = node.querySelectorAll<HTMLElement>(".journey-chapter");
      const first = chapters[0], last = chapters[chapters.length - 1];
      const firstCenter = first.offsetTop + first.offsetHeight / 2;
      const lastCenter = last.offsetTop + last.offsetHeight / 2;
      start = bounds.top + window.scrollY + firstCenter - window.innerHeight / 2;
      range = Math.max(1, lastCenter - firstCenter);
      schedule();
    };
    const preference = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (reduce.matches || !desktop.matches) animations.forEach((animation) => { animation.currentTime = 0; });
      else measure();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) measure(); else { cancelAnimationFrame(frame); frame = 0; } });
    const resize = new ResizeObserver(measure);
    observer.observe(node);
    resize.observe(node);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    document.addEventListener("visibilitychange", preference);
    reduce.addEventListener("change", preference);
    desktop.addEventListener("change", preference);
    measure();
    return () => {
      observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame);
      animations.forEach((animation) => animation.cancel());
      window.removeEventListener("scroll", schedule); window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", preference);
      reduce.removeEventListener("change", preference); desktop.removeEventListener("change", preference);
    };
  }, []);

  return <div className="journey-story" ref={root} data-stage="0">
    <div className="journey-sticky"><div ref={canvas} className="journey-desktop"><JourneyComposition tr={tr} /></div><span className="journey-desktop-caption">{tr ? "Örnek bir cevabın yolculuğu · canlı değerlendirme değil" : "One illustrative answer journey · not a live assessment"}</span></div>
    <div className="journey-narrative">
      <div className="journey-timeline" aria-hidden="true"><i className="journey-timeline-fill" /></div>
      {journeySteps.map((step, index) => <article className="journey-chapter" id={"journey-step-" + (index + 1)} key={step[0]} data-chapter={index}>
        <span className="journey-step-number"><span>{String(index + 1).padStart(2, "0")}</span><i aria-hidden="true" /></span>
        <h3>{t(step[0])}<br /><em>{t(step[1])}</em></h3>
        <p>{t(step[2])}</p>
        <div className="journey-mobile"><JourneyComposition tr={tr} stage={index} /></div>
      </article>)}
    </div>
  </div>;
}

function JourneyComposition({ tr, stage = 0 }: { tr: boolean; stage?: number }) {
  const ref = useSceneLife();
  return <div className="journey-canvas voice-scene" ref={ref} data-stage={stage} role="img" aria-label={tr ? "Örnek soru, konuşma, transcript ve tekrar deneme akışı" : "Illustrative question, voice, transcript and retry workflow"}>
    <div className="journey-orbit" aria-hidden="true"><SpeakAceVoiceSignal rings /><span>01</span><span>02</span><span>03</span></div>
    <div className="journey-object journey-question">
      <div className="journey-window"><span>SpeakAce</span><span>IELTS · PART 1</span></div>
      <span className="scene-eyebrow">{tr ? "BİR SORU SEÇ" : "PICK A QUESTION"}</span>
      <strong>{homeExamples[0].question}</strong><span className="journey-chosen"><Check size={13} />Hometown<ArrowUpRight size={14} /></span>
    </div>
    <div className="journey-object journey-audio"><div className="artifact-label"><AudioLines size={15} />{tr ? "SESİNİN GÖRSELİ" : "YOUR VOICE, VISUALIZED"}</div><VoiceWave /><span>{tr ? "Örnek görsel · canlı kayıt değil" : "Illustrative signal · not recording"}</span></div>
    <div className="journey-object journey-transcript">
      <span className="artifact-label"><FileText size={14} />{tr ? "TRANSCRIPT İNCELEME" : "TRANSCRIPT REVIEW"}</span>
      <p>“I like my hometown because it is <mark>very nice</mark> and the people are friendly.”</p>
      <div className="journey-insight"><Sparkles size={14} /><span>{tr ? "Bir yer söyle. Bir anı paylaş." : "Name a place. Share a memory."}</span></div>
    </div>
    <div className="journey-object journey-retry"><span className="artifact-label"><RotateCcw size={15} />{tr ? "BİR SONRAKİ DENEMEN" : "YOUR NEXT ATTEMPT"}</span><p>“What I love most is the <mark>riverside market on Sunday mornings</mark>.”</p><span className="journey-specific"><Check size={12} />{tr ? "Bir somut ayrıntı" : "One concrete detail"}</span></div>
  </div>;
}

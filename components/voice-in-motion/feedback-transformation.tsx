"use client";

import { ArrowDownRight, Check, CornerDownRight, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { motionAllowed, motionTiming } from "@/lib/client-motion";

type Sample = {
  first: string; retry: string; heading: string; retryHeading: string;
  feedback: string; retryFeedback: string; next: string; retryNext: string;
};
const phrase = (html: string) => html.match(/<mark[^>]*>(.*?)<\/mark>/)?.[1] ?? "";

export function FeedbackTransformation({ sample, topic, retry, tr, instant, onToggle }: {
  sample: Sample; topic: number; retry: boolean; tr: boolean; instant: boolean; onToggle: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const previousTopic = useRef(topic);
  useEffect(() => {
    if (previousTopic.current === topic) return;
    previousTopic.current = topic;
    const node = root.current?.querySelector<HTMLElement>(".phrase-detail");
    if (!node || instant || !motionAllowed()) return;
    const animation = node.animate([{ transform: "translateX(12px)" }, { transform: "translateX(0)" }], motionTiming(node, "panel"));
    return () => animation.cancel();
  }, [topic, instant]);

  return <div className="answer-transform" data-retry={retry} ref={root}>
    <div className="phrase-detail">
      <div className="phrase-detail-heading"><Sparkles size={14} /><span>{tr ? "BİR İFADEDEN DAHA NET BİR FİKRE" : "FROM A PHRASE TO A CLEARER PICTURE"}</span><span className="phrase-state">{retry ? <Check size={12} /> : "01"}<span aria-hidden="true">→</span>02</span></div>
      <div className="phrase-comparison">
        <span className="phrase-source"><span className="phrase-caption">{tr ? "İlk deneme" : "First attempt"}</span><span>{phrase(sample.first)}</span></span>
        <ArrowDownRight className="phrase-direction" size={24} aria-hidden="true" />
        <span className="phrase-target"><span className="phrase-caption">{tr ? "Bir somut ayrıntı" : "One concrete detail"}</span><span className="phrase-detail-stack"><span className="phrase-prompt" aria-hidden={retry}>{tr ? "Bir yer. Bir anı." : "A place. A memory."}</span><span className="phrase-new" aria-hidden={!retry}>{phrase(sample.retry)}</span></span></span>
        <svg className="phrase-flow" viewBox="0 0 240 30" fill="none" aria-hidden="true"><path pathLength="1" d="M1 28H60C102 28 104 2 145 2H239" /></svg>
      </div>
      <div className="phrase-annotation"><CornerDownRight size={16} aria-hidden="true" /><span>{sample.next}</span><span className="annotation-resolution" aria-hidden="true"><Check size={13} /></span></div>
    </div>
    <div className="transcript-label"><span>{tr ? "CEVABININ METNİ" : "YOUR TRANSCRIPT"}</span><span id="answer-duration">{tr ? "ÖRNEK 0" : "EXAMPLE 0"}{topic + 1}</span></div>
    <div className="transcript-transformation">
      <blockquote className="answer-original" id={!retry ? "transcript" : undefined} aria-hidden={retry} inert={retry} dangerouslySetInnerHTML={{ __html: sample.first }} />
      <blockquote className="answer-improved" id={retry ? "transcript" : undefined} aria-hidden={!retry} inert={!retry} dangerouslySetInnerHTML={{ __html: sample.retry }} />
    </div>
    <div className="coach-note"><span className="note-icon" aria-hidden="true">↳</span><div><h3 id="feedback-title">{retry ? sample.retryHeading : sample.heading}</h3><p id="feedback-text">{retry ? sample.retryFeedback : sample.feedback}</p></div></div>
    <div className="next-step">
      <span className="step-star" aria-hidden="true">✳</span>
      <p id="next-instruction"><strong>{retry ? (tr ? "Devam et" : "Keep going") : (tr ? "Sonraki denemen" : "Your next attempt")}</strong>{retry ? sample.retryNext : sample.next}</p>
      <button id="show-retry" onClick={onToggle}>{retry ? (tr ? "İlk cevaba dön ↶" : "Back to first answer ↶") : (tr ? "Yeni denemeyi gör →" : "See the retry →")}</button>
    </div>
  </div>;
}

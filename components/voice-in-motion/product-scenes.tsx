"use client";

import { ArrowUpRight, AudioLines, BookOpen, Check, CornerDownRight, FileText, Layers3, MessageSquareText, Pause, Play, RotateCcw, Sparkles, UsersRound } from "lucide-react";
import { useEffect, useRef, type PointerEvent } from "react";
import { homeExamples } from "@/lib/home-demo-data";
import { motionAllowed } from "@/lib/client-motion";
import { SpeakAceVoiceSignal, VoiceWave } from "./voice-signal";
import { useSceneLife } from "./use-scene-life";

export function HeroProductShowcase({ tr, paused, onPause }: { tr: boolean; paused: boolean; onPause: () => void }) {
  const ref = useSceneLife<HTMLElement>();
  const depthRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<DOMRect | null>(null);
  const pointerFrame = useRef(0);
  useEffect(() => {
    const resize = () => { boundsRef.current = null; };
    window.addEventListener("resize", resize);
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(pointerFrame.current); };
  }, []);
  const point = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || !motionAllowed() || !window.matchMedia("(hover: hover) and (pointer: fine)").matches || !depthRef.current) return;
    const bounds = boundsRef.current ?? (boundsRef.current = event.currentTarget.getBoundingClientRect());
    const x = Math.max(-.5, Math.min(.5, (event.clientX - bounds.left) / bounds.width - .5)) * 12;
    const y = Math.max(-.5, Math.min(.5, (event.clientY - bounds.top) / bounds.height - .5)) * 8;
    cancelAnimationFrame(pointerFrame.current);
    pointerFrame.current = requestAnimationFrame(() => {
      if (depthRef.current) depthRef.current.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
    });
  };
  const reset = () => { cancelAnimationFrame(pointerFrame.current); boundsRef.current = null; if (depthRef.current) depthRef.current.style.transform = ""; };
  return <figure ref={ref} className="hero-product voice-scene" onPointerEnter={(event) => { boundsRef.current = event.currentTarget.getBoundingClientRect(); }} onPointerMove={point} onPointerLeave={reset} onBlur={reset} aria-label={tr ? "Örnek ürün akışı: soru, konuşma, transcript ve geri bildirim" : "Illustrative product journey: question, voice, transcript and feedback"}>
    <div className="hero-product-field" aria-hidden="true"><SpeakAceVoiceSignal rings /><span className="field-cross cross-one">+</span><span className="field-cross cross-two">+</span></div>
    <div className="hero-depth" ref={depthRef}>
      <div className="hero-room">
        <div className="product-topline"><span><AudioLines size={16} />SpeakAce</span><span>{tr ? "ÖRNEK PRATİK" : "ILLUSTRATIVE PRACTICE"}</span><i aria-hidden="true">•••</i></div>
        <div className="hero-question">
          <span className="scene-eyebrow">IELTS SPEAKING · PART 1</span>
          <span className="hero-question-number" aria-hidden="true">01</span>
          <p>{homeExamples[0].question}</p>
          <div className="question-topic"><span>{tr ? "Bugünkü konumuz" : "Today’s topic"}</span><strong>Hometown</strong></div>
        </div>
        <div className="hero-audio"><span className="audio-symbol"><AudioLines size={22} /></span><VoiceWave /><span className="audio-note">{tr ? "Örnek ses görseli" : "Sample voice visualization"}</span></div>
        <div className="hero-route"><span><Check size={12} />{tr ? "Soru" : "Question"}</span><i /><span><AudioLines size={12} />{tr ? "Ses" : "Voice"}</span><i /><span><Sparkles size={12} />{tr ? "Geri bildirim" : "Feedback"}</span></div>
      </div>
      <div className="hero-transcript">
        <span className="artifact-label"><FileText size={13} />{tr ? "CEVABIN İÇİNDEN" : "FROM YOUR ANSWER"}<span aria-hidden="true">↗</span></span>
        <p><span className="transcript-group group-one">“I like my hometown</span>{" "}<span className="transcript-group group-two">because it is <mark>very nice</mark></span>{" "}<span className="transcript-group group-three">and the people are friendly.”</span></p>
        <div className="transcript-tail" aria-hidden="true"><i /><i /><i /></div>
      </div>
      <div className="hero-suggestion">
        <span className="suggestion-icon"><Sparkles size={18} /></span>
        <div><span className="artifact-label">{tr ? "BİR KÜÇÜK DEĞİŞİKLİK" : "ONE SMALL CHANGE"}</span><strong>{tr ? "Bir örnekle somutlaştır." : "Make it specific."}</strong><p>{tr ? "Belirli bir yer veya anı anlat." : "Describe one place or memory."}</p></div>
        <CornerDownRight className="suggestion-arrow" size={20} />
      </div>
      <div className="hero-next"><RotateCcw size={14} /><span>{tr ? "Aynı soru. Daha net bir cevap." : "Same question. A clearer answer."}</span><ArrowUpRight size={14} /></div>
    </div>
    <figcaption><span><span className="demo-diamond" aria-hidden="true">✳</span>{tr ? "Örnek gösterim · mikrofon açık değil" : "Illustrative demo · microphone is off"}</span><button className="scene-motion-toggle" type="button" onClick={onPause} aria-label={tr ? (paused ? "Otomatik hareketi devam ettir" : "Otomatik hareketi duraklat") : (paused ? "Resume automatic motion" : "Pause automatic motion")}>{paused ? <Play size={12} aria-hidden="true" /> : <Pause size={12} aria-hidden="true" />}<span>{tr ? (paused ? "Devam ettir" : "Duraklat") : (paused ? "Resume" : "Pause")}</span></button></figcaption>
  </figure>;
}

export function PracticeSignal({ tr, topic }: { tr: boolean; topic: number }) {
  const ref = useSceneLife();
  return <div className="practice-voice voice-scene" ref={ref} key={topic}>
    <div className="practice-audio-label"><AudioLines size={14} /><span>{tr ? "SESİN → BİR SONRAKİ ADIMIN" : "YOUR VOICE → YOUR NEXT STEP"}</span></div>
    <VoiceWave />
    <span className="practice-sample-note">{tr ? "Örnek ses görseli · canlı kayıt değil" : "Illustrative audio · not a live recording"}</span>
    <SpeakAceVoiceSignal className="practice-signal-link" />
  </div>;
}

type Audience = "students" | "teachers" | "schools";
export function AudienceProductScene({ role, tr, notes, label, caption }: { role: Audience; tr: boolean; notes: string[]; label: string; caption: string }) {
  const ref = useSceneLife();
  return <div ref={ref} className={"audience-product voice-scene audience-product-" + role}>
    <div className="audience-product-heading"><span><Layers3 size={15} />{label}</span><span>{tr ? "ÖRNEK" : "ILLUSTRATIVE"}</span></div>
    <div className="audience-product-canvas">
      {role === "students" ? <LearningDashboardPreview tr={tr} /> : role === "teachers" ? <TeacherWorkflowPreview tr={tr} /> : <SchoolWorkflowPreview tr={tr} />}
    </div>
    <div className="scene-notes">{notes.map((note, index) => <div key={note}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{note}</p><Check size={13} aria-hidden="true" /></div>)}</div>
    <p className="audience-product-caption">{caption}</p>
  </div>;
}

function LearningDashboardPreview({ tr }: { tr: boolean }) {
  return <>
    <div className="journal-sheet"><div className="mini-window"><span /><span /><span /><strong>{tr ? "Çalışma defterin" : "Your practice journal"}</strong></div><div className="journal-entry"><span className="journal-icon"><BookOpen size={20} /></span><div><span>IELTS · PART 1</span><strong>Hometown</strong><p>{tr ? "Cevabını gözden geçir" : "Review your answer"}</p></div><ArrowUpRight size={16} /></div><div className="journal-path"><span><Check size={12} />{tr ? "İlk deneme" : "First attempt"}</span><i /><span><MessageSquareText size={12} />{tr ? "Gözden geçir" : "Review"}</span><i /><span><RotateCcw size={12} />{tr ? "Tekrar dene" : "Retry"}</span></div></div>
    <div className="journal-focus"><Sparkles size={15} /><span>{tr ? "Sonraki odak" : "Next focus"}</span><strong>{tr ? "Bir ayrıntı ekle." : "Add one detail."}</strong></div>
  </>;
}

function TeacherWorkflowPreview({ tr }: { tr: boolean }) {
  return <>
    <div className="assignment-sheet"><div className="mini-window"><span /><span /><span /><strong>{tr ? "Sınıf çalışma alanı" : "Class workspace"}</strong></div><div className="assignment-question"><span><UsersRound size={16} />{tr ? "KONUŞMA ÖDEVİ" : "SPEAKING ASSIGNMENT"}</span><strong>What do you like most about your hometown?</strong></div>{[tr ? "Deneme inceleme" : "Attempt review", tr ? "Öğretmen notu" : "Teacher note"].map((text, index) => <div className="assignment-row" key={text}><span className="assignment-avatar">{index === 0 ? <AudioLines size={14} /> : <MessageSquareText size={14} />}</span><span>{text}</span><span className="assignment-status">{index === 0 ? <VoiceWave compact /> : <span className="note-lines" aria-hidden="true"><i /><i /></span>}</span></div>)}</div>
    <div className="assignment-focus"><FileText size={16} /><span>{tr ? "Sıradaki ders için" : "For your next lesson"}</span><strong>{tr ? "Cevabı örnekle geliştir." : "Develop with an example."}</strong></div>
  </>;
}

function SchoolWorkflowPreview({ tr }: { tr: boolean }) {
  return <>
    <div className="school-programme"><span className="programme-label"><Layers3 size={17} />{tr ? "PROGRAM PİLOTU" : "PROGRAMME PILOT"}</span><strong>{tr ? "Ortak bir pratik döngüsü" : "One shared practice rhythm"}</strong><div className="school-branches" aria-hidden="true"><i /><i /><i /></div><div className="school-classes"><div><UsersRound size={22} /><strong>{tr ? "Sınıf A" : "Class A"}</strong><span>IELTS Speaking</span></div><div><UsersRound size={22} /><strong>{tr ? "Sınıf B" : "Class B"}</strong><span>TOEFL Speaking</span></div></div></div>
    <div className="school-review"><Check size={15} /><span>{tr ? "Öğretmen, görev ve deneme aynı akışta." : "Teachers, assignments and attempts, connected."}</span></div>
  </>;
}

export function FinalCTAVisual() {
  const ref = useSceneLife();
  return <div className="final-voice-visual voice-scene" ref={ref} aria-hidden="true"><SpeakAceVoiceSignal rings /><span className="final-signal-core"><AudioLines size={26} /></span></div>;
}

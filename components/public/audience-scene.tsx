"use client";

import { useSceneLife } from "@/components/voice-in-motion/use-scene-life";
import {
  BookOpenText,
  Check,
  FileText,
  GraduationCap,
  Layers3,
  MessageSquareText,
  Mic,
  MoveRight,
  UsersRound,
} from "lucide-react";
import type { ProgramAudience } from "@/lib/audience-copy";
import type { PublicLanguage } from "@/lib/copy";
import { publicDesignCopy } from "@/lib/public-design-copy";
import { homeExamples } from "@/lib/home-demo-data";
import {
  SpeakAceVoiceSignal,
  VoiceWave,
} from "@/components/voice-in-motion/voice-signal";

/** Authored examples, never presented as a customer's score or live class activity. */
export function AudienceScene({
  audience,
  locale,
  stage = 0,
  compact = false,
}: {
  audience: ProgramAudience;
  locale: PublicLanguage;
  stage?: number;
  compact?: boolean;
}) {
  const scene = useSceneLife<HTMLElement>();
  const t = publicDesignCopy[locale];
  const example = homeExamples[0];
  return (
    <figure
      ref={scene}
      className={"audience-scene " + (compact ? "is-compact" : "")}
      data-audience={audience}
      data-stage={stage}
    >
      <div className="audience-scene-caption">
        <span>
          <i />
          {audience === "students"
            ? "IELTS · TOEFL"
            : audience === "teachers"
              ? t.class
              : t.programme}
        </span>
        <small>{t.preview}</small>
      </div>
      <div className="audience-scene-workspace" key={stage}>
        {audience === "students" ? (
          <>
            <div className="audience-scene-toolbar">
              <span>
                <Mic size={15} />
                {stage === 2 ? t.writing : "Speaking · Part 1"}
              </span>
              <span>01 / 03</span>
            </div>
            {stage === 2 ? (
              <div className="audience-writing-sample">
                <FileText size={25} />
                <strong>{t.writing}</strong>
                <p>{t.writingNote}</p>
                <blockquote className="audience-writing-excerpt">
                  “Studying with others can make difficult topics easier to
                  understand.{" "}
                  <mark>
                    For example, explaining a solution to a classmate helps me
                    check my own reasoning.
                  </mark>
                  ”
                </blockquote>
                <span className="audience-note">
                  <Check size={15} />
                  {t.grammar} · {t.vocabulary}
                </span>
              </div>
            ) : (
              <>
                <div className="audience-question">
                  <small>{t.question}</small>
                  <strong>{example.question}</strong>
                </div>
                <div className="audience-signal-strip">
                  <VoiceWave compact />
                  <span>
                    <Mic size={14} />
                    {t.transcript}
                  </span>
                </div>
                <blockquote>
                  {stage === 1
                    ? "“What I love most is the riverside market on Sunday mornings. I go there with my sister for breakfast.”"
                    : "“I like my hometown because it is very nice and the people are friendly.”"}
                </blockquote>
                <div className="audience-note">
                  <MessageSquareText size={20} />
                  <div>
                    <small>{stage === 1 ? t.retry : t.feedback}</small>
                    <strong>
                      {stage === 1 ? example.retryHeading : t.detail}
                    </strong>
                  </div>
                </div>
              </>
            )}
            <div className="audience-scene-bottom">
              <span>{t.fluency}</span>
              <span>{t.vocabulary}</span>
              <span>{t.grammar}</span>
            </div>
          </>
        ) : audience === "teachers" ? (
          <>
            <div className="audience-scene-toolbar">
              <span>
                <UsersRound size={15} />
                {t.class}
              </span>
              <GraduationCap size={18} />
            </div>
            {stage === 2 ? (
              <div className="audience-class-collaboration">
                <div>
                  <BookOpenText size={22} />
                  <small>{t.studyList}</small>
                  <strong>IELTS · Part 1</strong>
                  <p>{example.question}</p>
                </div>
                <div>
                  <MessageSquareText size={22} />
                  <small>{t.announcement}</small>
                  <p>{t.classMessage}</p>
                </div>
              </div>
            ) : (
              <>
                <div className="audience-class-task">
                  <small>{stage === 0 ? t.attempts : t.assignment}</small>
                  <strong>{example.question}</strong>
                  <span>
                    <BookOpenText size={13} /> IELTS · Part 1
                  </span>
                </div>
                <div className="audience-class-flow">
                  {(stage === 0
                    ? [t.fluency, t.vocabulary, t.grammar]
                    : [t.assignment, t.attempts, t.teacherNote]
                  ).map((label, index) => (
                    <div
                      key={label}
                      className={index === stage ? "is-selected" : ""}
                    >
                      <span>0{index + 1}</span>
                      <strong>
                        {stage === 0
                          ? t.sampleLearner +
                            " " +
                            String(index + 1).padStart(2, "0")
                          : label}
                      </strong>
                      {stage === 0 ? (
                        <small>{label}</small>
                      ) : index === stage ? (
                        <Check size={16} />
                      ) : (
                        <MoveRight size={15} />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="audience-note">
              <MessageSquareText size={20} />
              <div>
                <small>{stage === 1 ? t.teacherNote : t.nextLesson}</small>
                <strong>{t.detail}</strong>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="audience-scene-toolbar">
              <span>
                <Layers3 size={15} />
                {t.cohort}
              </span>
              <span>IELTS · TOEFL</span>
            </div>
            <div className="audience-programme-map">
              <SpeakAceVoiceSignal />
              <div className={stage === 0 ? "is-selected" : ""}>
                <GraduationCap size={25} />
                <strong>{t.students}</strong>
                <small>
                  {t.question} → {t.feedback}
                </small>
              </div>
              <div className={stage === 1 ? "is-selected" : ""}>
                <UsersRound size={25} />
                <strong>{t.teachers}</strong>
                <small>
                  {t.assignment} → {t.attempts}
                </small>
              </div>
              <div className={stage === 2 ? "is-selected" : ""}>
                <Layers3 size={25} />
                <strong>{t.schools}</strong>
                <small>
                  {t.cohort} → {t.overview}
                </small>
              </div>
            </div>
            <div className="audience-note">
              <Check size={20} />
              <div>
                <small>{t.programme}</small>
                <strong>
                  {[t.studentsNote, t.teachersNote, t.schoolsNote][stage]}
                </strong>
              </div>
            </div>
          </>
        )}
      </div>
      <figcaption>{t.notLive}</figcaption>
    </figure>
  );
}

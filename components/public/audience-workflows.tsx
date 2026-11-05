"use client";

import { useId, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Check,
  MessageSquareText,
  NotebookPen,
  UsersRound,
} from "lucide-react";
import type { PublicLanguage } from "@/lib/copy";
import { audienceRefinementCopy } from "@/lib/audience-refinement-copy";
import { homeExamples } from "@/lib/home-demo-data";
import { content } from "@/lib/audience-copy";
import { handleTabKeys } from "@/lib/tab-navigation";
import { useSceneLife } from "@/components/voice-in-motion/use-scene-life";
import { PreviewScenes } from "@/components/motion/preview-scenes";
import { PageSection, PublicButton } from "./page-primitives";

const example = homeExamples[0];
function Answer({ retry = false }: { retry?: boolean }) {
  const value = retry ? example.retry : example.first;
  return (
    <blockquote lang="en">
      {value.split(/(<mark[^>]*>.*?<\/mark>)/g).map((part, i) =>
        part.startsWith("<mark") ? (
          <mark key={i} className={retry ? "is-improved" : undefined}>
            {part.replace(/<[^>]*>/g, "")}
          </mark>
        ) : (
          part
        ),
      )}
    </blockquote>
  );
}

function WorkflowTabs({
  labels,
  active,
  onChange,
  children,
  label,
}: {
  labels: string[];
  active: number;
  onChange: (index: number) => void;
  children: ReactNode[];
  label: string;
}) {
  const id = useId();
  const [instant, setInstant] = useState(false);
  return (
    <div
      className="product-walkthrough"
      data-instant-motion={instant || undefined}
      onKeyDownCapture={() => {
        setInstant(true);
      }}
      onPointerDownCapture={() => {
        setInstant(false);
      }}
    >
      <div
        className="product-tabs"
        role="tablist"
        aria-label={label}
        onKeyDown={handleTabKeys}
      >
        {labels.map((title, index) => (
          <button
            key={title}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel`}
            aria-selected={index === active}
            tabIndex={index === active ? 0 : -1}
            onClick={() => onChange(index)}
          >
            <span>0{index + 1}</span>
            {title}
          </button>
        ))}
      </div>
      <div
        id={`${id}-panel`}
        className="product-panel"
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        tabIndex={0}
      >
        <PreviewScenes active={active}>{children}</PreviewScenes>
      </div>
    </div>
  );
}

export function LearnerPreview({ locale }: { locale: PublicLanguage }) {
  const t = audienceRefinementCopy[locale].learning;
  const scene = useSceneLife<HTMLDivElement>();
  return (
    <div className="learner-preview" ref={scene}>
      <div className="product-notebook-top">
        <NotebookPen size={18} />
        <span>IELTS · Part 1</span>
        <span>01</span>
      </div>
      <p className="public-kicker">{t.question}</p>
      <h2 lang="en">{example.question}</h2>
      <Answer />
      <div className="learner-preview-note">
        <MessageSquareText size={18} />
        <div>
          <strong>{t.focus}</strong>
          <p lang="en">{example.next}</p>
        </div>
      </div>
      <small>{t.example}</small>
    </div>
  );
}

export function StudentWorkflow({ locale }: { locale: PublicLanguage }) {
  const t = audienceRefinementCopy[locale].learning;
  const copy = content[locale].students;
  const [active, setActive] = useState(0);
  return (
    <>
      <PageSection eyebrow={t.eyebrow} title={t.title} description={t.body}>
        <div className="answer-lab">
          <div className="answer-lab-question">
            <span className="public-kicker">IELTS · Speaking Part 1</span>
            <h3 lang="en">{example.question}</h3>
            <p>{t.example}</p>
            <PublicButton
              href="/app/practice?examType=IELTS&taskType=ielts-part-1&runMode=drill"
              secondary
            >
              {t.practice}
            </PublicButton>
          </div>
          <WorkflowTabs
            labels={t.tabs}
            active={active}
            onChange={setActive}
            label={t.workflow}
          >
            {[
              <div key="first" className="answer-lab-scene">
                <span className="public-kicker">{t.transcript}</span>
                <h3>{t.first}</h3>
                <Answer />
                <div className="product-margin-note">{t.focus}</div>
              </div>,
              <div key="feedback" className="answer-lab-scene">
                <span className="public-kicker">{t.feedback}</span>
                <h3>{t.focus}</h3>
                <p lang="en">{example.feedback}</p>
                <div className="product-next">
                  <span>{t.next}</span>
                  <strong lang="en">{example.next}</strong>
                </div>
              </div>,
              <div key="retry" className="answer-lab-scene">
                <span className="public-kicker">{t.tabs[2]}</span>
                <h3>{t.improved}</h3>
                <Answer retry />
                <div className="product-next">
                  <Check size={17} />
                  <p lang="en">{example.retryFeedback}</p>
                </div>
              </div>,
            ]}
          </WorkflowTabs>
        </div>
      </PageSection>
      <section className="student-writing public-section">
        <NotebookPen size={35} strokeWidth={1.2} />
        <div>
          <span className="public-kicker">Writing Task 2</span>
          <h2>{t.writing}</h2>
          <p>{t.writingBody}</p>
        </div>
        <PublicButton href="/app/writing" secondary>
          {t.writingCta}
        </PublicButton>
      </section>
      <PageSection title={t.workflow}>
        <ol className="product-connected-steps">
          {copy.workflow.map((step, i) => (
            <li key={step.title}>
              <span>0{i + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </PageSection>
    </>
  );
}

export function TeacherWorkflow({ locale }: { locale: PublicLanguage }) {
  const t = audienceRefinementCopy[locale].teacher;
  const [active, setActive] = useState(0);
  return (
    <PageSection eyebrow={t.eyebrow} title={t.title} description={t.body}>
      <div className="teacher-workbench">
        <aside>
          <UsersRound size={26} strokeWidth={1.3} />
          <span className="public-kicker">{t.class}</span>
          <h3>{t.className}</h3>
          <div className="teacher-task-context">
            <small>{t.task}</small>
            <p lang="en">{example.question}</p>
          </div>
          <span className="product-fixture">
            {audienceRefinementCopy[locale].learning.example}
          </span>
        </aside>
        <WorkflowTabs
          labels={t.tabs}
          active={active}
          onChange={setActive}
          label={t.workflow}
        >
          {[
            <div key="task" className="teacher-work-scene">
              <span className="public-kicker">{t.taskLabel}</span>
              <h3 lang="en">{example.question}</h3>
              <p>{t.context}</p>
              <div className="product-margin-note">{t.noteFocusBody}</div>
            </div>,
            <div key="review" className="teacher-work-scene">
              <span className="public-kicker">{t.submissions}</span>
              <div className="teacher-attempts">
                {t.states.map((state, i) => (
                  <div key={state}>
                    <span className="sample-avatar">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <strong>
                      {t.learner} {i + 1}
                    </strong>
                    <span>{state}</span>
                  </div>
                ))}
              </div>
              <p>{t.noteFocusBody}</p>
            </div>,
            <div key="note" className="teacher-work-scene">
              <span className="public-kicker">{t.note}</span>
              <h3>{t.noteFocusBody}</h3>
              <p>{t.noteBody}</p>
              <div className="product-next">
                <span>{t.noteFocus}</span>
                <strong lang="en">{example.next}</strong>
              </div>
            </div>,
          ]}
        </WorkflowTabs>
      </div>
      <div className="teacher-next-actions">
        <PublicButton href="/teacher-demo">{t.demo}</PublicButton>
        <PublicButton href="/auth?mode=signup&cta=teachers_program" secondary>
          {t.account}
        </PublicButton>
        <a className="public-text-link" href="#program-contact">
          {t.contact} ↗
        </a>
      </div>
    </PageSection>
  );
}

export function SchoolWorkflow({ locale }: { locale: PublicLanguage }) {
  const t = audienceRefinementCopy[locale].school;
  const [active, setActive] = useState(0);
  const copy = content[locale].schools;
  return (
    <>
      <PageSection eyebrow={t.eyebrow} title={t.title} description={t.body}>
        <div className="school-role-map">
          <div className="school-programme">
            <span className="public-kicker">{t.programme}</span>
            <UsersRound size={34} strokeWidth={1.2} />
            <h3>{t.cohort}</h3>
            <p>{t.handoff}</p>
          </div>
          <WorkflowTabs
            labels={t.roles}
            active={active}
            onChange={setActive}
            label={t.programme}
          >
            {t.roles.map((role, i) => (
              <div className="school-role-scene" key={role}>
                <span className="public-kicker">{role}</span>
                <h3>{t.roleNotes[i]}</h3>
                <ol>
                  {t.steps[i].map((step, j) => (
                    <li key={step}>
                      <span>0{j + 1}</span>
                      <strong>{step}</strong>
                      {j < 2 && <ArrowRight size={16} />}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </WorkflowTabs>
        </div>
      </PageSection>
      <PageSection title={t.timeline}>
        <ol className="school-pilot-timeline">
          {copy.workflow.map((step, i) => (
            <li key={step.title}>
              <span>0{i + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </PageSection>
    </>
  );
}

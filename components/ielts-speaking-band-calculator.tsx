"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  calculateIeltsSpeakingBand,
  speakingCriterionKeys,
  type SpeakingCriterion,
  type SpeakingCriterionScores
} from "@/lib/ielts-speaking-band";

const scoreOptions = Array.from({ length: 19 }, (_, index) => index / 2);

const criterionContent: Record<
  SpeakingCriterion,
  {
    label: string;
    shortLabel: string;
    checkpoint: string;
    diagnostic: string;
  }
> = {
  fluency: {
    label: "Fluency and coherence",
    shortLabel: "Fluency",
    checkpoint:
      "Band 7 evidence includes longer answers that stay coherent even when some hesitation or self-correction occurs.",
    diagnostic:
      "Retry one 90-second answer from the same notes. Remove one restart, one filler pattern, and one unnecessary detour while keeping the meaning intact."
  },
  lexicalResource: {
    label: "Lexical resource",
    shortLabel: "Vocabulary",
    checkpoint:
      "Band 7 evidence includes flexible vocabulary across topics, effective paraphrasing, and some control of collocation.",
    diagnostic:
      "Circle the two words you repeated most. Replace only one with a natural collocation and paraphrase the other idea without adding memorised idioms."
  },
  grammar: {
    label: "Grammatical range and accuracy",
    shortLabel: "Grammar",
    checkpoint:
      "Band 7 evidence includes flexible use of simple and complex sentences with frequent error-free stretches.",
    diagnostic:
      "Find one repeated grammar error in your transcript. Correct two sentences, then say the whole answer again without reading the corrected version."
  },
  pronunciation: {
    label: "Pronunciation",
    shortLabel: "Pronunciation",
    checkpoint:
      "A Band 7 profile builds on clear Band 6 speech and adds stronger control of rhythm, stress, intonation, and connected speech.",
    diagnostic:
      "Mark thought groups and the key stressed word in each group. Re-record at a calm pace and check whether every idea is easy to understand on first listen."
  }
};

const initialScores: SpeakingCriterionScores = {
  fluency: 6.5,
  lexicalResource: 6,
  grammar: 6,
  pronunciation: 6.5
};

type ShareState = "idle" | "shared" | "copied" | "error";

export function IeltsSpeakingBandCalculator() {
  const [scores, setScores] = useState<SpeakingCriterionScores>(initialScores);
  const [shareState, setShareState] = useState<ShareState>("idle");
  const estimate = useMemo(() => calculateIeltsSpeakingBand(scores), [scores]);

  const priorityNames = estimate.weakestCriteria
    .map((criterion) => criterionContent[criterion].shortLabel)
    .join(" and ");
  const primaryPriority = estimate.weakestCriteria[0];
  const allCriteriaTied = estimate.weakestCriteria.length === speakingCriterionKeys.length;
  const profileLabel =
    estimate.spread <= 0.5 ? "balanced profile" : estimate.spread >= 1.5 ? "uneven profile" : "mixed profile";
  const targetGap = Math.max(0, 7 - estimate.estimatedBand);

  const shareText = useMemo(
    () =>
      [
        `My IELTS Speaking self-assessment is ${estimate.estimatedBand.toFixed(1)}.`,
        `Fluency ${scores.fluency.toFixed(1)}, vocabulary ${scores.lexicalResource.toFixed(1)}, grammar ${scores.grammar.toFixed(1)}, pronunciation ${scores.pronunciation.toFixed(1)}.`,
        allCriteriaTied
          ? "My scores do not show a single weakest criterion, so I will choose one focus from recording evidence."
          : `My next retry focus is ${priorityNames}.`
      ].join(" "),
    [allCriteriaTied, estimate.estimatedBand, priorityNames, scores]
  );

  function updateScore(criterion: SpeakingCriterion, score: number) {
    setScores((current) => ({ ...current, [criterion]: score }));
    setShareState("idle");
  }

  async function copyResult() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard is unavailable.");
      await navigator.clipboard.writeText(
        `${shareText} ${window.location.origin}/tools/ielts-speaking-band-score-calculator`
      );
      setShareState("copied");
    } catch {
      setShareState("error");
    }
  }

  async function shareResult() {
    const url = `${window.location.origin}/tools/ielts-speaking-band-score-calculator`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "IELTS Speaking band self-assessment",
          text: shareText,
          url
        });
        setShareState("shared");
        return;
      }

      if (!navigator.clipboard) throw new Error("Sharing is unavailable.");
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setShareState("copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareState("error");
    }
  }

  return (
    <section className="speaking-band-calculator" aria-labelledby="speaking-band-calculator-title">
      <div className="speaking-band-calculator__intro">
        <div>
          <span className="eyebrow">Four-criterion self-assessment</span>
          <h2 id="speaking-band-calculator-title">Estimate your IELTS Speaking band profile</h2>
          <p>
            Rate the evidence you can sustain across the whole Speaking test. The four criteria are
            equally weighted; the result below is shown to the nearest half band for planning.
          </p>
        </div>
        <aside className="speaking-band-calculator__method" aria-label="Calculation method">
          <span>Calculation</span>
          <strong>(Fluency + Vocabulary + Grammar + Pronunciation) ÷ 4</strong>
          <p>Use observed recordings and transcripts, not your target score, when choosing each value.</p>
        </aside>
      </div>

      <div className="speaking-band-calculator__criteria">
        {speakingCriterionKeys.map((criterion, index) => {
          const content = criterionContent[criterion];
          const inputId = `speaking-band-${criterion}`;

          return (
            <label className="speaking-band-calculator__criterion" htmlFor={inputId} key={criterion}>
              <span className="speaking-band-calculator__criterion-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="speaking-band-calculator__criterion-copy">
                <strong>{content.label}</strong>
                <span>{content.checkpoint}</span>
              </span>
              <span className="speaking-band-calculator__select-wrap">
                <span>Self-rating</span>
                <select
                  id={inputId}
                  value={scores[criterion]}
                  onChange={(event) => updateScore(criterion, Number(event.target.value))}
                  aria-describedby={`${inputId}-help`}
                >
                  {scoreOptions.map((score) => (
                    <option key={score} value={score}>
                      {score.toFixed(1)}
                    </option>
                  ))}
                </select>
                <small id={`${inputId}-help`}>Choose a half-band value from 0 to 9.</small>
              </span>
            </label>
          );
        })}
      </div>

      <div className="speaking-band-calculator__result" aria-live="polite">
        <div className="speaking-band-calculator__score-panel">
          <span className="eyebrow">Planning estimate</span>
          <div className="speaking-band-calculator__score-line">
            <strong>{estimate.estimatedBand.toFixed(1)}</strong>
            <span>
              raw average {estimate.average.toFixed(2)}
              <br />
              {profileLabel}
            </span>
          </div>
          <p>
            {allCriteriaTied
              ? `All four self-ratings are tied, so the numbers do not identify a unique weakest criterion. Use one recording and transcript to choose a single observable focus for the next retry.`
              : targetGap > 0
              ? `This profile sits ${targetGap.toFixed(1)} band below a 7.0 planning target. Start with ${priorityNames}; changing every criterion at once makes the next recording harder to evaluate.`
              : `These inputs reach a 7.0 planning threshold. Your lowest evidence is still ${priorityNames}, so use that criterion to test whether the result is stable across a new topic.`}
          </p>

          <div className="speaking-band-calculator__bars" aria-label="Criterion score comparison">
            {speakingCriterionKeys.map((criterion) => (
              <div className="speaking-band-calculator__bar-row" key={criterion}>
                <span>{criterionContent[criterion].shortLabel}</span>
                <div aria-hidden="true">
                  <i style={{ width: `${(scores[criterion] / 9) * 100}%` }} />
                </div>
                <strong>{scores[criterion].toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </div>

        <aside className="speaking-band-calculator__diagnostic">
          <span className="eyebrow">Next diagnostic retry</span>
          <h3>{allCriteriaTied ? "No unique weakest criterion" : `Focus on ${priorityNames}`}</h3>
          <p>
            {allCriteriaTied
              ? "Listen once with the transcript hidden. Choose the one issue that most increases listener effort, then retry with only that criterion in focus. The equal scores alone do not justify selecting fluency or any other category first."
              : criterionContent[primaryPriority].diagnostic}
          </p>
          {estimate.weakestCriteria.length > 1 && !allCriteriaTied ? (
            <small>
              Your lowest criteria are tied. Complete this retry first, then repeat the same answer
              with each remaining tied criterion as the only focus, one at a time.
            </small>
          ) : null}
        </aside>
      </div>

      <div className="speaking-band-calculator__actions">
        <div>
          <strong>Keep the estimate testable.</strong>
          <span>
            Share this profile, then compare it with transcript feedback from one free speaking attempt.
          </span>
        </div>
        <div className="speaking-band-calculator__buttons">
          <button className="button button-secondary" type="button" onClick={shareResult}>
            Share result
          </button>
          <button className="button button-secondary" type="button" onClick={copyResult}>
            Copy summary
          </button>
          <Link
            className="button button-primary"
            href="/auth?mode=signup&cta=speaking_band_calculator"
          >
            Test it with a free attempt
          </Link>
        </div>
        {shareState !== "idle" ? (
          <p
            className={`speaking-band-calculator__share-state${shareState === "error" ? " is-error" : ""}`}
            role={shareState === "error" ? "alert" : "status"}
          >
            {shareState === "shared"
              ? "Result shared."
              : shareState === "copied"
                ? "Result summary copied."
                : "Your browser could not share or copy the result. You can still use the free attempt link."}
          </p>
        ) : null}
      </div>

      <p className="speaking-band-calculator__caveat">
        This is an educational self-assessment, not an official IELTS score prediction. A certified
        examiner assesses your performance across the complete test; only an official Test Report
        Form reports an IELTS Speaking band.
      </p>
    </section>
  );
}

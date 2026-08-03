export const speakingCriterionKeys = [
  "fluency",
  "lexicalResource",
  "grammar",
  "pronunciation"
] as const;

export type SpeakingCriterion = (typeof speakingCriterionKeys)[number];

export type SpeakingCriterionScores = Record<SpeakingCriterion, number>;

export type IeltsSpeakingBandEstimate = {
  average: number;
  estimatedBand: number;
  weakestScore: number;
  weakestCriteria: SpeakingCriterion[];
  strongestScore: number;
  strongestCriteria: SpeakingCriterion[];
  spread: number;
};

function isHalfBand(score: number) {
  return Math.abs(score * 2 - Math.round(score * 2)) < Number.EPSILON * 10;
}

/**
 * A transparent planning calculation for four equally weighted IELTS Speaking
 * self-ratings. This is not an examiner score or an official IELTS prediction.
 */
export function calculateIeltsSpeakingBand(
  scores: SpeakingCriterionScores
): IeltsSpeakingBandEstimate {
  const values = speakingCriterionKeys.map((criterion) => scores[criterion]);

  if (
    values.some(
      (score) => !Number.isFinite(score) || score < 0 || score > 9 || !isHalfBand(score)
    )
  ) {
    throw new Error("Four IELTS Speaking self-ratings from 0 to 9 in half-band steps are required.");
  }

  const average = values.reduce((total, score) => total + score, 0) / values.length;
  const estimatedBand = Math.min(9, Math.round((average + Number.EPSILON) * 2) / 2);
  const weakestScore = Math.min(...values);
  const strongestScore = Math.max(...values);

  return {
    average,
    estimatedBand,
    weakestScore,
    weakestCriteria: speakingCriterionKeys.filter(
      (criterion) => scores[criterion] === weakestScore
    ),
    strongestScore,
    strongestCriteria: speakingCriterionKeys.filter(
      (criterion) => scores[criterion] === strongestScore
    ),
    spread: strongestScore - weakestScore
  };
}

export function calculateIeltsOverallBand(scores: number[]) {
  if (
    scores.length !== 4 ||
    scores.some((score) => !Number.isFinite(score) || score < 0 || score > 9)
  ) {
    throw new Error("Four IELTS section scores between 0 and 9 are required.");
  }

  const average = scores.reduce((total, score) => total + score, 0) / scores.length;
  const wholeBand = Math.floor(average);
  const fraction = average - wholeBand;
  const overall =
    fraction < 0.25
      ? wholeBand
      : fraction < 0.75
        ? wholeBand + 0.5
        : wholeBand + 1;

  return {
    average,
    overall: Math.min(9, overall)
  };
}

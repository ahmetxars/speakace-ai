import { Difficulty, WritingCategoryScore, WritingPromptTemplate, WritingReport, WritingSession } from "@/lib/types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function evaluateWritingDraft(input: {
  draftText: string;
  prompt: WritingPromptTemplate;
  difficulty: Difficulty;
}): WritingReport {
  const words = countWords(input.draftText);
  const paragraphs = input.draftText.split(/\n\s*\n/).filter((item) => item.trim().length > 0).length;
  const hasConclusion = /in conclusion|to conclude|overall|to sum up/i.test(input.draftText);
  const hasExamples = /for example|for instance|such as/i.test(input.draftText);
  const hasOpinion = /i believe|i think|in my opinion|i would argue/i.test(input.draftText);
  const sentenceCount = input.draftText.split(/[.!?]+/).filter((item) => item.trim().length > 2).length;
  const avgSentenceLength = sentenceCount ? words / sentenceCount : 0;
  const difficultyPenalty = input.difficulty === "Stretch" ? 0.2 : input.difficulty === "Target" ? 0.1 : 0;

  const taskResponse = roundOne(clamp(4.8 + (hasOpinion ? 0.7 : 0) + (hasExamples ? 0.5 : 0) + (words >= 240 ? 0.5 : words >= 200 ? 0.2 : -0.6) - difficultyPenalty, 4, 8));
  const coherence = roundOne(clamp(4.9 + (paragraphs >= 4 ? 0.6 : paragraphs >= 3 ? 0.3 : -0.3) + (hasConclusion ? 0.3 : 0) + (avgSentenceLength >= 13 && avgSentenceLength <= 24 ? 0.3 : -0.2), 4, 8));
  const lexicalResource = roundOne(clamp(4.8 + (hasExamples ? 0.2 : 0) + (words >= 260 ? 0.6 : words >= 220 ? 0.35 : 0) - (repeatPenalty(input.draftText) > 0.2 ? 0.3 : 0), 4, 8));
  const grammar = roundOne(clamp(4.9 + (sentenceCount >= 10 ? 0.4 : 0) + (avgSentenceLength >= 12 ? 0.2 : -0.2), 4, 8));

  const categories: WritingCategoryScore[] = [
    { category: "taskResponse", label: "Task Response", score: taskResponse },
    { category: "coherence", label: "Coherence and Cohesion", score: coherence },
    { category: "lexicalResource", label: "Lexical Resource", score: lexicalResource },
    { category: "grammar", label: "Grammar Range and Accuracy", score: grammar }
  ];

  const overall = roundOne(categories.reduce((sum, item) => sum + item.score, 0) / categories.length);

  return {
    overall,
    scaleLabel: "Estimated IELTS Writing Band",
    categories,
    strengths: buildStrengths({ hasExamples, hasConclusion, paragraphs, words }),
    improvements: buildImprovements({ hasOpinion, hasExamples, paragraphs, words }),
    nextExercise: words < 250
      ? "Retry the same essay and add one clearer body paragraph example plus a stronger conclusion."
      : "Retry the same essay and make each body paragraph support one clear claim with a more specific example.",
    caution: "AI guidance is for practice only and is not an official IELTS Writing band score.",
    correctedVersion: buildCorrectedVersion(input.prompt.prompt, input.draftText),
    outline: buildOutline(input.prompt.prompt)
  };
}

function buildStrengths(input: { hasExamples: boolean; hasConclusion: boolean; paragraphs: number; words: number }) {
  return [
    input.words >= 250
      ? "The draft reaches a realistic Task 2 length, so there is enough space to develop an argument."
      : "The draft already shows the shape of a full Task 2 response instead of staying at note level.",
    input.paragraphs >= 4
      ? "The essay is separated into a clear introduction, body, and ending structure."
      : "There is an attempt to organize the essay into parts instead of writing one long block.",
    input.hasExamples
      ? "At least one supporting example appears, which helps the essay feel more developed."
      : "The main position is visible, which gives the essay a usable foundation for revision."
  ];
}

function buildImprovements(input: { hasOpinion: boolean; hasExamples: boolean; paragraphs: number; words: number }) {
  return [
    input.hasOpinion
      ? "Push the main opinion more clearly in the introduction so the reader understands your position immediately."
      : "State your opinion explicitly in the introduction instead of letting the reader guess it.",
    input.hasExamples
      ? "Make each example more specific so it proves the paragraph idea instead of sounding generic."
      : "Add one concrete example in each body paragraph to improve task development.",
    input.words >= 250
      ? "Tighten the paragraph links so the essay feels easier to follow from one idea to the next."
      : "Increase the essay length slightly so each body paragraph has enough explanation and support."
  ];
}

function buildOutline(prompt: string) {
  return [
    `Introduction: paraphrase the question and state a clear position on "${prompt.slice(0, 42)}..."`,
    "Body paragraph 1: explain your strongest reason and support it with one real example.",
    "Body paragraph 2: add the second reason or discuss the opposite view before rebutting it.",
    "Conclusion: restate your opinion in a concise and confident way."
  ];
}

function buildCorrectedVersion(prompt: string, draft: string) {
  const opening = inferOpening(prompt);
  const bodyIdea = inferBodyIdea(prompt);
  return `${opening} ${bodyIdea} For example, this trend can improve efficiency and give people more flexibility in daily life, but only when it is managed responsibly. On the other hand, ignoring the possible drawbacks can create long-term social problems. Therefore, I believe the best position is to accept the benefits while still setting clear limits and practical rules. In conclusion, the issue is not whether the change exists, but how governments, schools, or individuals respond to it in a balanced way.`;
}

function inferOpening(prompt: string) {
  if (/discuss both views/i.test(prompt)) {
    return "This issue has become increasingly common in modern society, and people hold different views about the best way to respond to it. While both sides make valid points, I believe the more convincing position is the one that creates longer-term practical benefits.";
  }
  if (/advantages.*outweigh/i.test(prompt) || /benefits.*outweigh/i.test(prompt)) {
    return "In recent years, this development has become far more visible, and many people now debate whether its overall impact is positive or negative. In my view, the benefits are stronger, although the drawbacks should not be ignored.";
  }
  return "This topic is widely debated because it affects both individuals and society as a whole. I largely agree with the statement because the long-term advantages are more significant than the possible disadvantages.";
}

function inferBodyIdea(prompt: string) {
  const lowered = prompt.toLowerCase();
  if (lowered.includes("online") || lowered.includes("technology")) {
    return "One major reason is that digital tools can make access faster, cheaper, and more flexible for a wider range of people.";
  }
  if (lowered.includes("government") || lowered.includes("public")) {
    return "One major reason is that public policy has the power to shape large-scale behaviour more effectively than isolated personal actions.";
  }
  if (lowered.includes("children") || lowered.includes("school") || lowered.includes("university")) {
    return "One major reason is that education decisions influence not only academic performance but also long-term social development.";
  }
  return "One major reason is that the issue directly affects the quality of everyday life, including time, money, and social well-being.";
}

function repeatPenalty(text: string) {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  if (!words.length) return 0;
  const counts = new Map<string, number>();
  words.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
  const repeated = [...counts.values()].filter((count) => count >= 4).length;
  return repeated / words.length;
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

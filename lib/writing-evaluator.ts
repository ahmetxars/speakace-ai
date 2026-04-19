import { Difficulty, WritingCategoryScore, WritingPromptTemplate, WritingReport, WritingTaskType } from "@/lib/types";

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
  const sentenceCount = splitSentences(input.draftText).length;
  const avgSentenceLength = sentenceCount ? words / sentenceCount : 0;
  const lowered = input.draftText.toLowerCase();
  const isTaskOne = input.prompt.taskType === "ielts-writing-task-1";
  const difficultyPenalty = input.difficulty === "Stretch" ? 0.2 : input.difficulty === "Target" ? 0.1 : 0;

  const hasConclusion = /in conclusion|to conclude|to sum up/i.test(input.draftText);
  const hasExamples = /for example|for instance|such as/i.test(input.draftText);
  const hasOpinion = /i believe|i think|in my opinion|i would argue|i agree|i disagree/i.test(input.draftText);
  const hasOverview = /overall|in general|it is clear that|the main feature|the most noticeable/i.test(input.draftText);
  const hasComparison = /more than|less than|higher than|lower than|compared with|whereas|while|by contrast|respectively/i.test(input.draftText);
  const hasDataSignals = /%|percent|rose|fell|increased|decreased|remained|peaked|declined|figure|rate/i.test(input.draftText);
  const repeatPenaltyValue = repeatPenalty(input.draftText);

  const taskResponse = isTaskOne
    ? roundOne(
        clamp(
          4.9 +
            (hasOverview ? 0.7 : -0.45) +
            (hasComparison ? 0.45 : -0.2) +
            (hasDataSignals ? 0.35 : -0.15) +
            (words >= 150 ? 0.45 : words >= 130 ? 0.15 : -0.6) -
            difficultyPenalty,
          4,
          8
        )
      )
    : roundOne(
        clamp(
          4.8 +
            (hasOpinion ? 0.7 : 0) +
            (hasExamples ? 0.5 : 0) +
            (words >= 250 ? 0.5 : words >= 220 ? 0.2 : -0.6) -
            difficultyPenalty,
          4,
          8
        )
      );

  const coherence = isTaskOne
    ? roundOne(clamp(4.9 + (paragraphs >= 3 ? 0.55 : 0.15) + (hasOverview ? 0.35 : -0.15) + (avgSentenceLength >= 11 && avgSentenceLength <= 24 ? 0.25 : -0.15), 4, 8))
    : roundOne(clamp(4.9 + (paragraphs >= 4 ? 0.6 : paragraphs >= 3 ? 0.3 : -0.3) + (hasConclusion ? 0.3 : 0) + (avgSentenceLength >= 13 && avgSentenceLength <= 24 ? 0.3 : -0.2), 4, 8));

  const lexicalResource = isTaskOne
    ? roundOne(clamp(4.8 + (hasComparison ? 0.25 : 0) + (hasDataSignals ? 0.25 : 0) + (words >= 165 ? 0.45 : words >= 145 ? 0.2 : 0) - (repeatPenaltyValue > 0.2 ? 0.3 : 0), 4, 8))
    : roundOne(clamp(4.8 + (hasExamples ? 0.2 : 0) + (words >= 260 ? 0.6 : words >= 220 ? 0.35 : 0) - (repeatPenaltyValue > 0.2 ? 0.3 : 0), 4, 8));

  const grammar = roundOne(clamp(4.9 + (sentenceCount >= (isTaskOne ? 7 : 10) ? 0.4 : 0) + (avgSentenceLength >= 12 ? 0.2 : -0.2), 4, 8));

  const categories: WritingCategoryScore[] = [
    { category: "taskResponse", label: isTaskOne ? "Task Achievement" : "Task Response", score: taskResponse },
    { category: "coherence", label: "Coherence and Cohesion", score: coherence },
    { category: "lexicalResource", label: "Lexical Resource", score: lexicalResource },
    { category: "grammar", label: "Grammar Range and Accuracy", score: grammar }
  ];

  const overall = roundOne(categories.reduce((sum, item) => sum + item.score, 0) / categories.length);

  return {
    overall,
    scaleLabel: "Estimated IELTS Writing Band",
    categories,
    strengths: buildStrengths({
      taskType: input.prompt.taskType,
      hasExamples,
      hasConclusion,
      hasOverview,
      hasComparison,
      paragraphs,
      words
    }),
    improvements: buildImprovements({
      taskType: input.prompt.taskType,
      hasOpinion,
      hasExamples,
      hasOverview,
      hasComparison,
      paragraphs,
      words
    }),
    nextExercise: buildNextExercise({
      taskType: input.prompt.taskType,
      words,
      hasOverview,
      hasComparison,
      hasExamples,
      hasOpinion
    }),
    caution: "AI guidance is for practice only and is not an official IELTS Writing band score.",
    correctedVersion: buildCorrectedVersion(input.prompt.taskType, input.prompt.prompt),
    outline: buildOutline(input.prompt.taskType, input.prompt.prompt)
  };
}

function buildStrengths(input: {
  taskType: WritingTaskType;
  hasExamples: boolean;
  hasConclusion: boolean;
  hasOverview: boolean;
  hasComparison: boolean;
  paragraphs: number;
  words: number;
}) {
  if (input.taskType === "ielts-writing-task-1") {
    return [
      input.words >= 150
        ? "The draft reaches a realistic Task 1 length, so there is enough space to describe the key features."
        : "The response already feels like a report rather than disconnected notes.",
      input.hasOverview
        ? "An overview is visible, which helps the reader understand the main trend before the details."
        : "There is a clear attempt to explain the visual logically instead of listing random data.",
      input.hasComparison
        ? "The report compares categories rather than describing every number in isolation."
        : "The draft shows a usable structure for turning raw data into a clearer comparison."
    ];
  }

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

function buildImprovements(input: {
  taskType: WritingTaskType;
  hasOpinion: boolean;
  hasExamples: boolean;
  hasOverview: boolean;
  hasComparison: boolean;
  paragraphs: number;
  words: number;
}) {
  if (input.taskType === "ielts-writing-task-1") {
    return [
      input.hasOverview
        ? "Make the overview sharper by naming the biggest trend or most noticeable contrast in one sentence."
        : "Add a clear overview after the introduction so the examiner can see the main pattern immediately.",
      input.hasComparison
        ? "Push the comparisons further so each detail paragraph groups related figures instead of listing them one by one."
        : "Compare the highest and lowest figures directly instead of describing each category separately.",
      input.words >= 150
        ? "Use more precise change language such as rose, fell, remained stable, or peaked to sound more analytical."
        : "Add a little more detail so the report reaches the expected Task 1 coverage without becoming repetitive."
    ];
  }

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

function buildNextExercise(input: {
  taskType: WritingTaskType;
  words: number;
  hasOverview: boolean;
  hasComparison: boolean;
  hasExamples: boolean;
  hasOpinion: boolean;
}) {
  if (input.taskType === "ielts-writing-task-1") {
    if (!input.hasOverview) {
      return "Retry the same report and add a one-sentence overview before the detail paragraphs so the biggest trend appears early.";
    }
    if (!input.hasComparison) {
      return "Retry the same report and group the figures into two comparisons instead of describing each item separately.";
    }
    return input.words < 150
      ? "Retry the same report and add one more comparison plus a clearer closing detail sentence to reach a fuller Task 1 response."
      : "Retry the same report and make every detail sentence support the overview with a sharper comparison or change verb.";
  }

  if (!input.hasOpinion) {
    return "Retry the same essay and state your position clearly in the introduction before developing the body paragraphs.";
  }
  if (!input.hasExamples) {
    return "Retry the same essay and add one concrete example in each body paragraph so the argument feels more convincing.";
  }
  return input.words < 250
    ? "Retry the same essay and add one clearer body paragraph example plus a stronger conclusion."
    : "Retry the same essay and make each body paragraph support one clear claim with a more specific example.";
}

function buildOutline(taskType: WritingTaskType, prompt: string) {
  if (taskType === "ielts-writing-task-1") {
    return [
      `Introduction: paraphrase the visual prompt about "${prompt.slice(0, 38)}..." without copying the wording.`,
      "Overview: summarize the biggest trend, comparison, or overall change in one clean sentence.",
      "Detail paragraph 1: group the most related figures or stages and compare them clearly.",
      "Detail paragraph 2: cover the remaining key data with precise change language and no opinion."
    ];
  }

  return [
    `Introduction: paraphrase the question and state a clear position on "${prompt.slice(0, 42)}..."`,
    "Body paragraph 1: explain your strongest reason and support it with one real example.",
    "Body paragraph 2: add the second reason or discuss the opposite view before rebutting it.",
    "Conclusion: restate your opinion in a concise and confident way."
  ];
}

function buildCorrectedVersion(taskType: WritingTaskType, prompt: string) {
  if (taskType === "ielts-writing-task-1") {
    return buildTaskOneCorrectedVersion(prompt);
  }
  return buildTaskTwoCorrectedVersion(prompt);
}

function buildTaskOneCorrectedVersion(prompt: string) {
  const introduction = inferTaskOneIntroduction(prompt);
  const overview = inferTaskOneOverview(prompt);
  const details = inferTaskOneDetails(prompt);
  return `${introduction} ${overview} ${details}`;
}

function inferTaskOneIntroduction(prompt: string) {
  const lowered = prompt.toLowerCase();
  if (lowered.includes("process") || lowered.includes("how")) {
    return "The diagram illustrates how the process works from the first stage to the final outcome.";
  }
  if (lowered.includes("map") || lowered.includes("town") || lowered.includes("city")) {
    return "The maps compare the layout of the area at two different points in time.";
  }
  if (lowered.includes("table")) {
    return "The table compares the main figures shown for the selected categories.";
  }
  if (lowered.includes("pie")) {
    return "The pie charts show how the total was distributed across several categories.";
  }
  return "The chart compares the main figures for the categories shown in the visual.";
}

function inferTaskOneOverview(prompt: string) {
  const lowered = prompt.toLowerCase();
  if (lowered.includes("process") || lowered.includes("how")) {
    return "Overall, the sequence follows a clear step-by-step pattern, beginning with collection or preparation and ending with a finished product.";
  }
  if (lowered.includes("map") || lowered.includes("town") || lowered.includes("city")) {
    return "Overall, the area became more developed over time, with additional facilities and a more organized layout than before.";
  }
  return "Overall, one or two categories were clearly dominant, while the remaining figures were lower or changed more gradually.";
}

function inferTaskOneDetails(prompt: string) {
  const lowered = prompt.toLowerCase();
  if (lowered.includes("energy") || lowered.includes("sources")) {
    return "In detail, the leading source accounted for the largest share throughout the period, whereas the smallest category remained far lower. The middle-ranking figures were closer together, although some increased modestly while others fell. This means the main contrast stayed between the dominant source and the least-used option.";
  }
  if (lowered.includes("tourism") || lowered.includes("income")) {
    return "Looking more closely, the highest-income market produced substantially more revenue than the others, while the smallest market contributed the least. The gap between the top and bottom groups remained noticeable, even though several categories moved upward over the period shown.";
  }
  if (lowered.includes("map") || lowered.includes("town") || lowered.includes("city")) {
    return "More specifically, the later map shows extra buildings and improved infrastructure where there had previously been open space or fewer services. Transport links also appear more direct, suggesting that the town was redesigned to support a larger population and greater daily activity.";
  }
  if (lowered.includes("process") || lowered.includes("how")) {
    return "At the beginning, the raw material is collected and sorted before it passes through the main treatment stages. After that, it is processed further and converted into a usable form, and the final stage produces a finished result that can be used again.";
  }
  return "In detail, the highest figure stayed ahead of the other categories, while the lower groups either changed slowly or remained relatively stable. The most useful comparisons are therefore between the top category, the lowest one, and the groups in the middle.";
}

function buildTaskTwoCorrectedVersion(prompt: string) {
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

function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
}

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

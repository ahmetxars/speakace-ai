import { PromptTemplate, ScoreCategory, ScoreReport, SpeakingSession, TaskType } from "@/lib/types";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

function buildTranscript(prompt: PromptTemplate, audioBytes: number) {
  const detail = audioBytes > 120_000 ? "The response includes enough detail to sound developed and intentional." : "The response is understandable but could use more precise support and examples.";

  return `In this response, the learner addresses the task "${prompt.title}" and stays mostly focused on the main idea. ${detail} The answer mentions personal reasoning, attempts to organize ideas, and closes with a short conclusion.`;
}

export function evaluateSession(session: SpeakingSession): ScoreReport {
  const audioBytes = session.audioBytes ?? 0;
  const fullness = clamp(audioBytes / 220_000, 0.15, 1);
  const difficultyBoost = session.difficulty === "Stretch" ? 0.2 : session.difficulty === "Target" ? 0.08 : 0;
  const taskBoost = getTaskBoost(session.taskType);

  if (session.examType === "IELTS") {
    const base = 5.1 + fullness * 2 + taskBoost - difficultyBoost;
    const categories: ScoreCategory[] = [
      { category: "fluency", score: roundOne(clamp(base + 0.15, 4, 8.5)), label: "Fluency and Coherence" },
      { category: "lexicalResource", score: roundOne(clamp(base, 4, 8.5)), label: "Lexical Resource" },
      { category: "grammar", score: roundOne(clamp(base - 0.1, 4, 8.5)), label: "Grammatical Range and Accuracy" },
      { category: "coherence", score: roundOne(clamp(base + 0.05, 4, 8.5)), label: "Pronunciation" }
    ];

    return {
      overall: roundOne(categories.reduce((sum, item) => sum + item.score, 0) / categories.length),
      scaleLabel: "Estimated IELTS Band",
      categories,
      strengths: buildIeltsStrengths(session.taskType),
      improvements: buildIeltsImprovements(session.taskType),
      nextExercise: buildNextExercise(session.taskType),
      caution: "AI estimates are practice guidance only and are not official IELTS exam results.",
      fillerWords: fullness > 0.7 ? ["um", "you know"] : ["um", "like", "actually"],
      improvedAnswer: buildImprovedAnswer(session, session.rawTranscript ?? session.transcript ?? "")
    };
  }

  const base = 2.4 + fullness * 1.2 + taskBoost - difficultyBoost;
  const categories: ScoreCategory[] = [
    { category: "delivery", score: roundOne(clamp(base + 0.1, 1, 4)), label: "Delivery" },
    { category: "languageUse", score: roundOne(clamp(base, 1, 4)), label: "Language Use" },
    { category: "topicDevelopment", score: roundOne(clamp(base + 0.05, 1, 4)), label: "Topic Development" }
  ];

  return {
    overall: roundOne(categories.reduce((sum, item) => sum + item.score, 0) / categories.length),
    scaleLabel: "Estimated TOEFL Speaking Score",
    categories,
    strengths: buildToeflStrengths(session.taskType),
    improvements: buildToeflImprovements(session.taskType),
    nextExercise: buildNextExercise(session.taskType),
    caution: "AI estimates are practice guidance only and are not official TOEFL exam results.",
    fillerWords: fullness > 0.7 ? ["um", "you know"] : ["um", "like", "actually"],
    improvedAnswer: buildImprovedAnswer(session, session.rawTranscript ?? session.transcript ?? "")
  };
}


function buildImprovedAnswer(session: SpeakingSession, transcript: string) {
  const focusTopic = inferFocusTopic(session.prompt.prompt, transcript);
  const topicAwareSample = buildTopicAwareSample(session, focusTopic);

  if (topicAwareSample) {
    return topicAwareSample;
  }

  if (session.examType === "IELTS") {
    if (session.taskType === "ielts-part-1") {
      return "I use my phone every day, mainly for communication, studying, and organizing my schedule. It is especially useful because I can quickly check messages, read short articles, and manage important tasks in one place. For that reason, I think it is one of the most practical objects in my daily life.";
    }
    if (session.taskType === "ielts-part-2") {
      return "I would like to describe a useful object that I use every day, which is my phone. I bought it two years ago when I started university, and since then it has become an essential part of my routine. I use it for communication, navigation, online banking, and studying. What makes it especially important is that it saves time and helps me stay organized. For example, I can set reminders, join online meetings, and access study materials whenever I need them. Overall, although it is just a small device, it has a big impact on my daily life.";
    }
    return "In my view, people rely heavily on mobile phones because these devices combine convenience, speed, and access to information. On the one hand, phones make communication much easier, especially for people with busy schedules. On the other hand, excessive dependence on them can reduce face-to-face interaction. For example, many people now prefer sending messages instead of having direct conversations. Therefore, while phones are extremely useful, people should still try to use them in a balanced way.";
  }

  if (session.taskType === "toefl-task-1" || session.taskType === "toefl-independent") {
    return "I believe working on important tasks early in the morning is better. First, people usually have more energy and concentration at that time, so they can think more clearly. Second, finishing difficult work early reduces stress during the rest of the day. For example, when I start studying in the morning, I complete my main work faster and feel more relaxed later. For these reasons, I strongly prefer the morning.";
  }
  if (session.taskType === "toefl-task-2") {
    return "The university announcement says that library hours will be extended until midnight during exam periods. In the conversation, the woman supports this decision because students will have a quiet place to study and group work will become easier. However, the man is concerned that the change may increase staffing costs. Overall, the two students react differently because one focuses on academic benefits while the other focuses on practical costs.";
  }
  if (session.taskType === "toefl-task-3") {
    return "The reading defines scarcity marketing as a strategy in which businesses make a product seem limited in order to increase demand. In the lecture, the professor gives the example of a clothing brand that releases only small batches of new designs. Because customers think the items may disappear soon, they decide to buy them quickly. This example clearly shows how scarcity can increase interest and encourage faster purchasing decisions.";
  }
  return "The lecture explains two ways desert plants survive long periods without rain. First, some plants store water in thick tissues, which allows them to keep moisture for a long time. Second, other plants grow deep roots so they can reach underground water sources. Overall, both strategies help desert plants survive in very dry environments, but they do so in different ways.";
}


function inferFocusTopic(promptText: string, transcript: string) {
  const source = `${promptText} ${transcript}`.toLowerCase();

  if (source.includes("phone") || source.includes("mobile")) return "phone";
  if (source.includes("app")) return "mobile app";
  if (source.includes("book")) return "book";
  if (source.includes("advice")) return "advice";
  if (source.includes("transport") || source.includes("bus") || source.includes("train")) return "public transport";
  if (source.includes("weather")) return "weather";
  if (source.includes("music")) return "music";
  if (source.includes("teacher")) return "teacher";
  if (source.includes("city") || source.includes("place")) return "place";
  return null;
}

function buildTopicAwareSample(session: SpeakingSession, topic: string | null) {
  if (session.examType === "IELTS" && session.taskType === "ielts-part-1" && topic) {
    return `One object I use every day is my ${topic}. I rely on it because it makes my daily routine easier and saves a lot of time. For example, I can use it for communication, study, and organization, so it has become an essential part of my life.`;
  }

  if (session.examType === "IELTS" && session.taskType === "ielts-part-2" && topic) {
    return `I would like to describe a useful ${topic} that I use regularly. I started using it a few years ago, and since then it has become part of my everyday routine. The main reason it is important to me is that it is practical and helps me manage my time more effectively. For instance, I can use it in different situations, both for personal life and for study or work. Overall, it may seem simple, but it has a very positive effect on my daily life.`;
  }

  if (session.examType === "TOEFL" && (session.taskType === "toefl-task-1" || session.taskType === "toefl-independent") && topic) {
    return `I think ${topic} is especially important in daily life. First, it is practical because it helps people save time and stay organized. Second, it can improve communication and make daily tasks much easier. For example, many people use it for both personal and academic purposes, so it becomes more valuable over time. For these reasons, I believe it is highly useful.`;
  }

  return null;
}

function getTaskBoost(taskType: TaskType) {
  if (taskType === "ielts-part-2" || taskType === "toefl-task-4") return 0.1;
  if (taskType === "toefl-task-2" || taskType === "toefl-task-3") return 0.06;
  return 0;
}

function buildIeltsStrengths(taskType: TaskType) {
  if (taskType === "ielts-part-1") {
    return [
      "The answer stays personal and matches the short interview style of IELTS Part 1.",
      "The response is direct enough to feel relevant to the examiner's question.",
      "There is a clear attempt to give at least one reason instead of only a short yes/no reply."
    ];
  }

  if (taskType === "ielts-part-2") {
    return [
      "The answer shows an attempt to develop a longer turn, which is essential for IELTS Part 2.",
      "Ideas are grouped around one main topic instead of jumping between unrelated points.",
      "The response sounds more like a mini speech than a one-sentence reply, which suits the cue-card format."
    ];
  }

  return [
    "The answer attempts to discuss ideas rather than only describe personal habits, which fits IELTS Part 3 better.",
    "There is some effort to explain causes or effects instead of giving only a simple opinion.",
    "The response sounds more analytical than casual, which is useful in the follow-up discussion stage."
  ];
}

function buildIeltsImprovements(taskType: TaskType) {
  if (taskType === "ielts-part-1") {
    return [
      "Give a direct answer first, then add one reason or example so the Part 1 answer feels fuller.",
      "Keep the language natural and personal instead of sounding memorized.",
      "Use simple linking words to make the answer flow smoothly between short ideas."
    ];
  }

  if (taskType === "ielts-part-2") {
    return [
      "Cover all cue-card points clearly so the long turn feels complete from start to finish.",
      "Add one vivid detail or short example to make the story more memorable and specific.",
      "Use a clearer opening, middle, and ending so the two-minute response sounds organized."
    ];
  }

  return [
    "Push the answer further by explaining why the opinion matters, not just what the opinion is.",
    "Compare two ideas or sides of the topic to sound more analytical in Part 3.",
    "Support abstract ideas with a brief real-world example to strengthen your argument."
  ];
}

function buildToeflStrengths(taskType: TaskType) {
  if (taskType === "toefl-task-1") {
    return [
      "The response attempts to give a clear personal opinion, which is the core of TOEFL Task 1.",
      "There is some supporting detail instead of only a short preference statement.",
      "The answer sounds more spontaneous than memorized, which helps the delivery feel natural."
    ];
  }

  if (taskType === "toefl-task-2") {
    return [
      "The response tries to summarize both the campus announcement and the speakers' reactions.",
      "There is some separation between the situation and the opinion, which helps task organization.",
      "The answer sounds closer to a summary than a personal opinion, which matches the task goal."
    ];
  }

  if (taskType === "toefl-task-3") {
    return [
      "The answer attempts to explain an academic concept instead of only repeating isolated words.",
      "There is some connection between the definition and the professor's example.",
      "The response shows awareness that TOEFL Task 3 needs both concept and illustration."
    ];
  }

  return [
    "The answer focuses on summarizing the lecture rather than giving a personal opinion, which suits TOEFL Task 4.",
    "There is some effort to group the lecture into main points.",
    "The response attempts to report content accurately instead of inventing unrelated details."
  ];
}

function buildToeflImprovements(taskType: TaskType) {
  if (taskType === "toefl-task-1") {
    return [
      "State your opinion in the first sentence so the answer starts decisively.",
      "Use one strong example and explain it clearly instead of listing several weak reasons.",
      "Keep the response tightly organized so every sentence supports the same main choice."
    ];
  }

  if (taskType === "toefl-task-2") {
    return [
      "Mention the announcement briefly first, then explain each speaker's reaction in a clean order.",
      "Avoid giving your own opinion; focus on summarizing the campus situation accurately.",
      "Use reporting verbs such as explains, argues, or prefers to make the summary clearer."
    ];
  }

  if (taskType === "toefl-task-3") {
    return [
      "Define the academic concept clearly before moving to the example.",
      "Explain exactly how the example proves the concept instead of just repeating facts.",
      "Use precise academic vocabulary so the summary sounds more lecture-based and accurate."
    ];
  }

  return [
    "Identify the lecture's main topic immediately so the summary starts with a clear frame.",
    "Group the lecture into two or more key points instead of retelling details randomly.",
    "Use transitions like first, another point, and finally so the lecture summary sounds easier to follow."
  ];
}

function buildNextExercise(taskType: TaskType) {
  switch (taskType) {
    case "ielts-part-1":
      return "Retry an IELTS Part 1 question and aim for one direct answer plus one supporting reason.";
    case "ielts-part-2":
      return "Practice another IELTS Part 2 cue card and spend one minute planning before you speak.";
    case "ielts-part-3":
      return "Try another IELTS Part 3 discussion prompt and give one opinion, one reason, and one example.";
    case "toefl-task-1":
    case "toefl-independent":
      return "Practice another TOEFL independent task and open with your opinion in the first sentence.";
    case "toefl-task-2":
      return "Try another TOEFL campus summary task and separate the announcement from the speakers' reactions.";
    case "toefl-task-3":
      return "Practice another TOEFL concept task and explain the definition before the example.";
    case "toefl-task-4":
      return "Practice another TOEFL lecture summary and group the lecture into two main points.";
    default:
      return "Try one more exam-style speaking task and focus on structure before speed.";
  }
}

export function buildSessionTranscript(session: SpeakingSession) {
  return buildTranscript(session.prompt, session.audioBytes ?? 0);
}

export function detectTranscriptIssue(transcript: string) {
  const normalized = transcript.trim().toLowerCase();
  const words = normalized.match(/[a-zA-ZçğıöşüÇĞİÖŞÜ']+/g) ?? [];
  const turkishMarkers = ["ve", "bir", "çok", "neden", "burada", "çünkü", "değil", "evet", "hayır", "şey", "güzel", "ben", "sen", "oturmak"];
  const englishMarkers = ["the", "and", "because", "i", "my", "it", "is", "you", "use", "every", "day", "explain"];
  const turkishScore =
    (/[çğıöşü]/.test(normalized) ? 3 : 0) +
    turkishMarkers.reduce((count, word) => count + (normalized.includes(word) ? 1 : 0), 0);
  const englishScore = englishMarkers.reduce((count, word) => count + (normalized.includes(` ${word} `) || normalized.startsWith(`${word} `) ? 1 : 0), 0);

  if (words.length < 8) {
    return {
      code: "too_short" as const,
      message: "The response was too short to score reliably."
    };
  }

  if (turkishScore >= 3 && englishScore <= 2) {
    return {
      code: "non_english" as const,
      message: "A mostly non-English response was detected."
    };
  }

  return null;
}

export function buildRetryRequiredReport(session: SpeakingSession, issue: "non_english" | "too_short"): ScoreReport {
  const categories: ScoreCategory[] =
    session.examType === "IELTS"
      ? [
          { category: "fluency", score: 0, label: "Fluency and Coherence" },
          { category: "lexicalResource", score: 0, label: "Lexical Resource" },
          { category: "grammar", score: 0, label: "Grammatical Range and Accuracy" },
          { category: "coherence", score: 0, label: "Pronunciation" }
        ]
      : [
          { category: "delivery", score: 0, label: "Delivery" },
          { category: "languageUse", score: 0, label: "Language Use" },
          { category: "topicDevelopment", score: 0, label: "Topic Development" }
        ];

  if (issue === "non_english") {
    return {
      overall: 0,
      scaleLabel: "Please respond in English",
      categories,
      strengths: [
        "Your microphone and recording flow worked correctly.",
        "A full attempt was captured and processed.",
        "You can retry immediately with an English-only response."
      ],
      improvements: [
        "Answer only in English so the system can score the attempt against IELTS or TOEFL speaking criteria.",
        "Use complete English sentences instead of mixing languages.",
        "Retry the same task slowly and clearly, focusing on one main idea and one supporting detail."
      ],
      nextExercise: "Repeat the same prompt in English and aim for one clear opinion plus one example.",
      caution: "This attempt was not scored normally because the response did not appear to be primarily in English. Keep going; consistent English practice will improve your results.",
      fillerWords: [],
      improvedAnswer: buildImprovedAnswer(session, session.rawTranscript ?? session.transcript ?? "")
    };
  }

  return {
    overall: 0,
    scaleLabel: "Response too short to score reliably",
    categories,
    strengths: [
      "The recording was captured successfully.",
      "You started the task instead of skipping it.",
      "You can improve the score quickly by extending the next answer."
    ],
    improvements: [
      "Speak longer so the system has enough language to evaluate properly.",
      "Give one direct answer and one concrete supporting example.",
      "Try to fill most of the speaking window with complete sentences."
    ],
    nextExercise: "Retry this prompt and aim to speak for at least half of the available speaking time.",
    caution: "This attempt was too short to score reliably. That is normal early on; with a fuller answer, your analysis will become much more useful.",
    fillerWords: [],
    improvedAnswer: buildImprovedAnswer(session, session.rawTranscript ?? session.transcript ?? "")
  };
}

export function cleanTranscriptText(transcript: string) {
  const normalized = transcript
    .replace(/ +/g, " ")
    .replace(/ ([,.!?])/g, "$1")
    .trim();

  if (!normalized) {
    return normalized;
  }

  const capped = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

export function getTranscriptQuality(transcript: string) {
  const words = transcript.trim().split(/ +/).filter(Boolean);
  const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
  const issue = detectTranscriptIssue(transcript);
  const uniqueRatio = words.length ? uniqueWords.size / words.length : 0;
  let score = 100;

  if (issue?.code === "non_english") {
    score = 12;
  } else if (issue?.code === "too_short") {
    score = 24;
  } else {
    if (words.length < 20) score -= 18;
    if (words.length < 12) score -= 16;
    if (uniqueRatio < 0.55) score -= 10;
    if (!/[.!?]/.test(transcript)) score -= 8;
  }

  score = clamp(Math.round(score), 0, 100);
  const label = score >= 85 ? "Strong" : score >= 65 ? "Usable" : score >= 40 ? "Weak" : "Retry needed";

  return { score, label };
}

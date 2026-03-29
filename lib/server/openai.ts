const OPENAI_API_BASE_URL = "https://api.openai.com/v1";

export function hasOpenAiKey() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function parseDataUrl(dataUrl: string) {
  const [header, body] = dataUrl.split(",", 2);
  if (!header || !body) {
    throw new Error("Invalid audio payload.");
  }

  const mimeMatch = header.match(/^data:(.+);base64$/);
  const mimeType = mimeMatch?.[1] ?? "audio/webm";
  return {
    mimeType,
    buffer: Buffer.from(body, "base64")
  };
}

export function getAudioPayloadStats(dataUrl: string) {
  const { buffer, mimeType } = parseDataUrl(dataUrl);
  return {
    buffer,
    mimeType,
    bytes: buffer.byteLength
  };
}

function extensionFromMime(mimeType: string) {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("m4a")) return "m4a";
  return "webm";
}

export async function transcribeAudio({
  audioBase64,
  prompt
}: {
  audioBase64: string;
  prompt: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const { buffer, mimeType } = parseDataUrl(audioBase64);
  const file = new File([buffer], `speaking-response.${extensionFromMime(mimeType)}`, {
    type: mimeType
  });

  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", process.env.OPENAI_TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
  formData.append("language", "en");
  formData.append("prompt", prompt);

  const response = await fetch(`${OPENAI_API_BASE_URL}/audio/transcriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI transcription failed: ${text}`);
  }

  const data = (await response.json()) as { text?: string };
  return data.text?.trim() || null;
}

export async function generateFeedbackReport({
  examType,
  taskType,
  promptTitle,
  promptText,
  difficulty,
  transcript
}: {
  examType: "IELTS" | "TOEFL";
  taskType: string;
  promptTitle: string;
  promptText: string;
  difficulty: string;
  transcript: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const categorySchema =
    examType === "IELTS"
      ? {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              category: { type: "string", enum: ["fluency", "lexicalResource", "grammar", "coherence"] },
              label: {
                type: "string",
                enum: ["Fluency and Coherence", "Lexical Resource", "Grammatical Range and Accuracy", "Pronunciation"]
              },
              score: { type: "number" }
            },
            required: ["category", "label", "score"]
          },
          minItems: 4,
          maxItems: 4
        }
      : {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              category: { type: "string", enum: ["delivery", "languageUse", "topicDevelopment"] },
              label: { type: "string", enum: ["Delivery", "Language Use", "Topic Development"] },
              score: { type: "number" }
            },
            required: ["category", "label", "score"]
          },
          minItems: 3,
          maxItems: 3
        };

  const response = await fetch(`${OPENAI_API_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_FEEDBACK_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "speaking_feedback",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              overall: { type: "number" },
              scaleLabel: { type: "string" },
              categories: categorySchema,
              strengths: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
              improvements: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
              nextExercise: { type: "string" },
              caution: { type: "string" },
              fillerWords: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
              improvedAnswer: { type: "string" }
            },
            required: ["overall", "scaleLabel", "categories", "strengths", "improvements", "nextExercise", "caution", "fillerWords", "improvedAnswer"]
          }
        }
      },
      messages: [
        {
          role: "system",
          content:
            examType === "IELTS"
              ? buildIeltsSystemPrompt(taskType)
              : buildToeflSystemPrompt(taskType)
        },
        {
          role: "user",
          content: [
            `Exam: ${examType}`,
            `Task type: ${taskType}`,
            `Difficulty: ${difficulty}`,
            `Prompt title: ${promptTitle}`,
            `Prompt: ${promptText}`,
            `Transcript: ${transcript}`,
            examType === "IELTS"
              ? "Use the official IELTS speaking criteria labels exactly as defined in the schema. Keep scores realistic for the specific part and be honest when development is weak."
              : "Use the official TOEFL speaking reporting dimensions in the schema. Keep scores realistic for the specific task and judge summaries by accuracy and organization.",
            "Caution should state that this is AI practice guidance and not an official exam result.",
            "improvedAnswer should be a stronger sample response to the same prompt, written in natural spoken English at a better exam level.",
            "Preserve the learner's main topic or object when possible. For example, if the learner talks about a phone, keep the improved answer focused on a phone instead of changing the topic.",
            "It should not claim to be the user's original words."
          ].join("\n")
        }
      ]
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI feedback failed: ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
        refusal?: string | null;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    return null;
  }

  return JSON.parse(content) as {
    overall: number;
    scaleLabel: string;
    categories: Array<{ category: string; label: string; score: number }>;
    strengths: string[];
    improvements: string[];
    nextExercise: string;
    caution: string;
    fillerWords: string[];
    improvedAnswer: string;
  };
}

function buildIeltsSystemPrompt(taskType: string) {
  if (taskType === "ielts-part-1") {
    return "You are an IELTS Speaking examiner simulator. Evaluate only from the transcript. This is IELTS Part 1, so expect short personal interview answers. Use a 0-9 band scale, score realistically, and do not reward memorized or underdeveloped answers. Return strict JSON only.";
  }
  if (taskType === "ielts-part-2") {
    return "You are an IELTS Speaking examiner simulator. Evaluate only from the transcript. This is IELTS Part 2, so judge the long turn by development, continuity, vocabulary range, grammar control, and pronunciation. Use a 0-9 band scale. Return strict JSON only.";
  }
  return "You are an IELTS Speaking examiner simulator. Evaluate only from the transcript. This is IELTS Part 3, so judge discussion depth, reasoning, idea extension, and clear support. Use a 0-9 band scale and do not overpraise. Return strict JSON only.";
}

function buildToeflSystemPrompt(taskType: string) {
  if (taskType === "toefl-task-1" || taskType === "toefl-independent") {
    return "You are a TOEFL iBT Speaking evaluator simulator. Evaluate only from the transcript. This is TOEFL Task 1, an independent opinion task. Judge directness of opinion, support, organization, delivery, and language use. Use a 0-4 scale. Return strict JSON only.";
  }
  if (taskType === "toefl-task-2") {
    return "You are a TOEFL iBT Speaking evaluator simulator. Evaluate only from the transcript. This is TOEFL Task 2, a campus announcement and conversation summary. Judge whether the response accurately summarizes the situation and speakers' views. Use a 0-4 scale. Return strict JSON only.";
  }
  if (taskType === "toefl-task-3") {
    return "You are a TOEFL iBT Speaking evaluator simulator. Evaluate only from the transcript. This is TOEFL Task 3, an academic concept plus example summary. Judge concept accuracy, clarity, and how well the example is explained. Use a 0-4 scale. Return strict JSON only.";
  }
  return "You are a TOEFL iBT Speaking evaluator simulator. Evaluate only from the transcript. This is TOEFL Task 4, a lecture summary. Judge whether the response clearly identifies the main topic and organizes the lecture's main points accurately. Use a 0-4 scale. Return strict JSON only.";
}

import { NextResponse } from "next/server";
import { getAudioPayloadStats, hasOpenAiKey, transcribeAudio } from "@/lib/server/openai";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { getSession, uploadSessionAudio } from "@/lib/store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const { id } = await params;
  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `session-upload:${ip}:${id}`,
    windowMs: 1000 * 60 * 15,
    max: 24
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many upload attempts. Please try again later." }, { status: 429 });
  }
  const audioBase64 = typeof body.audioBase64 === "string" ? body.audioBase64 : "";
  const existing = await getSession(id);

  if (!existing) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  if (!audioBase64) {
    return NextResponse.json({ error: "Missing recording payload." }, { status: 400 });
  }

  const { bytes: audioBytes } = getAudioPayloadStats(audioBase64);
  if (audioBytes < 12_000) {
    return NextResponse.json(
      {
        error: "Recording was too short or empty. Please speak a little longer and try again."
      },
      { status: 400 }
    );
  }

  let transcript: string | null = null;
  let transcriptSource: "openai" | "fallback" = "fallback";
  let transcriptStatus = hasOpenAiKey()
    ? "Audio was received. OpenAI transcription is being used."
    : "Audio was received, but no OpenAI key is configured. A generated fallback transcript will be used.";
  let transcriptionError: string | null = null;

  try {
    transcript = await transcribeAudio({
      audioBase64,
      prompt: [
        `Verbatim English ${existing.examType} speaking transcript.`,
        `Task: ${existing.prompt.title}.`,
        `Prompt: ${existing.prompt.prompt}`,
        "Preserve the speaker's exact words as closely as possible.",
        "Do not rewrite, improve, summarize, or correct grammar.",
        "Keep fillers and false starts when they are audible.",
        "The speaker may have an accent, so prefer faithful transcription over cleanup."
      ].join(" ")
    });
    if (transcript) {
      transcriptSource = "openai";
      transcriptStatus = "OpenAI transcript completed successfully.";
    }
  } catch (error) {
    console.error(error);
    transcriptionError = error instanceof Error ? error.message : "Unknown transcription error.";
    transcriptStatus = "OpenAI transcription failed. A generated fallback transcript will be used instead.";
  }

  const session = await uploadSessionAudio(id, audioBytes, transcript, {
    transcriptSource: transcript ? "openai" : "generated",
    transcriptStatus
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({
    session,
    transcriptSource,
    transcriptStatus,
    transcriptionError
  });
}

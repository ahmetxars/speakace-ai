import { NextResponse } from "next/server";
import { checkRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { evaluateStoredSession, getSession } from "@/lib/store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = getRequestIp(request);
  const limit = checkRateLimit({
    key: `session-evaluate:${ip}:${id}`,
    windowMs: 1000 * 60 * 15,
    max: 24
  });
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many evaluation attempts. Please try again later." }, { status: 429 });
  }
  const existing = await getSession(id);

  if (!existing) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  if (!existing.audioUploaded) {
    return NextResponse.json({ error: "Upload audio before evaluation." }, { status: 400 });
  }

  const session = await evaluateStoredSession(id);

  if (!session) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 });
  }

  return NextResponse.json({ session });
}

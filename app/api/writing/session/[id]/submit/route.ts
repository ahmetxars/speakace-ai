import { NextResponse } from "next/server";
import { submitWritingDraft } from "@/lib/writing-store";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await submitWritingDraft({ sessionId: id, draftText: String(body.draftText ?? ""), minutesSpent: body.minutesSpent });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save writing draft." }, { status: 500 });
  }
}

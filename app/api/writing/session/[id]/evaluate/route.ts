import { NextResponse } from "next/server";
import { evaluateStoredWritingSession } from "@/lib/writing-store";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await evaluateStoredWritingSession(id);
    if (!session) {
      return NextResponse.json({ error: "Writing session not found or has no draft." }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Writing evaluation failed." }, { status: 500 });
  }
}

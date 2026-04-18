import { NextResponse } from "next/server";
import { getWritingSession } from "@/lib/writing-store";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getWritingSession(id);
  if (!session) {
    return NextResponse.json({ error: "Writing session not found." }, { status: 404 });
  }
  return NextResponse.json({ session });
}

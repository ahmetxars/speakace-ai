import { NextResponse } from "next/server";
import { getWritingSummary } from "@/lib/writing-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? "";
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  return NextResponse.json(await getWritingSummary(userId));
}

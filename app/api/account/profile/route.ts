import { NextResponse } from "next/server";
import { getMember, upsertMember } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? "";

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const profile = await getMember(userId);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const profile = await request.json();
  return NextResponse.json({ profile: await upsertMember(profile) });
}

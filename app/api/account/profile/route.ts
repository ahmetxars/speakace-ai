import { NextResponse } from "next/server";
import { getMember, upsertMember } from "@/lib/store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") ?? "";

    if (!userId) {
      return NextResponse.json({ profile: null }, { status: 200 });
    }

    const profile = await getMember(userId);
    return NextResponse.json({ profile: profile ?? null });
  } catch {
    return NextResponse.json({ profile: null }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const profile = await request.json();
    return NextResponse.json({ profile: await upsertMember(profile) });
  } catch {
    return NextResponse.json({ ok: false, skipped: true }, { status: 200 });
  }
}

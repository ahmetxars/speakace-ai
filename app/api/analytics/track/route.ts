import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics-store";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.userId || !body.event) {
    return NextResponse.json({ error: "Missing analytics payload." }, { status: 400 });
  }

  await trackAnalyticsEvent({
    userId: body.userId,
    event: body.event,
    path: body.path
  });

  return NextResponse.json({ ok: true });
}

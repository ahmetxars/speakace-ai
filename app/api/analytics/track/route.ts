import { NextResponse } from "next/server";
import { trackAnalyticsEvent } from "@/lib/analytics-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.userId || !body.event) {
      return NextResponse.json({ ok: false, skipped: true }, { status: 200 });
    }

    await trackAnalyticsEvent({
      userId: body.userId,
      event: body.event,
      path: body.path
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, skipped: true }, { status: 200 });
  }
}

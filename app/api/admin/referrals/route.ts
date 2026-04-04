import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createReferralCode,
  getAdminPanelSession,
  getAdminSessionCookieName
} from "@/lib/server/admin-panel";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await request.json();
    await createReferralCode({
      code: String(body.code ?? ""),
      label: String(body.label ?? ""),
      trialDays: Number(body.trialDays ?? 7),
      usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      createdBy: session.adminUserId ?? session.adminLabel
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not create referral code." },
      { status: 400 }
    );
  }
}

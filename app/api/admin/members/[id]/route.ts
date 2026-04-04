import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAdminPanelSession,
  getAdminSessionCookieName,
  updateAdminMemberAccess
} from "@/lib/server/admin-panel";
import { BillingStatus, SubscriptionPlan } from "@/lib/types";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const session = await getAdminPanelSession(cookieStore.get(getAdminSessionCookieName())?.value);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    plan?: SubscriptionPlan;
    billingStatus?: BillingStatus;
    trialDays?: number | null;
  };

  try {
    await updateAdminMemberAccess({
      memberId: id,
      plan: body.plan ?? "free",
      billingStatus: body.billingStatus ?? "free",
      trialDays: body.trialDays ?? null
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update member." },
      { status: 400 }
    );
  }
}

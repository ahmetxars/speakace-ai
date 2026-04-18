import { getMember } from "@/lib/store";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";

export function buildInviteReferralCode(userId: string) {
  return `invite:${userId}`;
}

export async function getInviteReferrer(userId: string | null | undefined) {
  if (!userId) return null;
  return getMember(userId);
}

export async function getUserReferralSummary(userId: string) {
  const code = buildInviteReferralCode(userId);
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const [row] = await sql<Array<{ signups: number; active_trials: number }>>`
      select
        count(*)::int as signups,
        count(*) filter (where billing_status in ('active', 'on_trial'))::int as active_trials
      from users
      where referral_code_used = ${code}
    `;
    return {
      code,
      signups: row?.signups ?? 0,
      activeTrials: row?.active_trials ?? 0
    };
  }

  return {
    code,
    signups: 0,
    activeTrials: 0
  };
}

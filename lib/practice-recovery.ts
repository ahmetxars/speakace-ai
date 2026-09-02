import { getSql, hasDatabaseUrl } from "@/lib/server/db";

const RECOVERY_MIN_AGE_MS = 5 * 60 * 1000;
const RECOVERY_MAX_AGE_MS = 48 * 60 * 60 * 1000;

export type RecordingRecoveryStatus = {
  shouldRecover: boolean;
};

export function shouldOfferRecordingRecovery(
  attempt: { audioUploaded: boolean; createdAt: string | Date } | null,
  nowMs = Date.now()
) {
  if (!attempt || attempt.audioUploaded) return false;

  const createdAtMs = new Date(attempt.createdAt).getTime();
  if (!Number.isFinite(createdAtMs)) return false;

  const ageMs = nowMs - createdAtMs;
  return ageMs >= RECOVERY_MIN_AGE_MS && ageMs <= RECOVERY_MAX_AGE_MS;
}

export async function getRecordingRecoveryStatus(userId: string): Promise<RecordingRecoveryStatus> {
  if (!userId || !hasDatabaseUrl()) {
    return { shouldRecover: false };
  }

  const sql = getSql();
  const rows = await sql<Array<{ audio_uploaded: boolean; created_at: string | Date }>>`
    select audio_uploaded, created_at
    from speaking_sessions
    where user_id = ${userId}
      and created_at >= now() - interval '48 hours'
    order by created_at desc
    limit 1
  `;
  const latestAttempt = rows[0];

  return {
    shouldRecover: shouldOfferRecordingRecovery(
      latestAttempt
        ? {
            audioUploaded: latestAttempt.audio_uploaded,
            createdAt: latestAttempt.created_at
          }
        : null
    )
  };
}

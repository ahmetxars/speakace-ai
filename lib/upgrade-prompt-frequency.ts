export const UPGRADE_PROMPT_STORAGE_PREFIX = "speakace-upgrade-prompt-day";

export function getUpgradePromptDayKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function getUpgradePromptStorageKey(userId: string) {
  return `${UPGRADE_PROMPT_STORAGE_PREFIX}:${userId}`;
}

export function shouldShowUpgradePromptDialog(lastShownDay: string | null, now = new Date()) {
  return lastShownDay !== getUpgradePromptDayKey(now);
}

export function isFreePracticeQuotaExhausted(input: {
  plan?: string | null;
  freeSessionsRemaining: number;
  remainingMinutesToday: number;
}) {
  return input.plan === "free"
    && (input.freeSessionsRemaining <= 0 || input.remainingMinutesToday <= 0);
}

export function buildPracticeLimitEventId(userId: string, reason: string, now = new Date()) {
  return `limit-hit:${userId}:${getUpgradePromptDayKey(now)}:${reason}`;
}

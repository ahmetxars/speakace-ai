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

export type PracticeActivity = {
  createdAt: string | Date;
  audioUploaded: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function getUtcPracticeDayKey(value: string | Date): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function getUtcDayKeyAtOffset(now: Date, offsetDays: number) {
  const utcMidnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(utcMidnight - offsetDays * DAY_MS).toISOString().slice(0, 10);
}

export function getPracticeMomentum(activities: PracticeActivity[], now = new Date()) {
  const activeDayKeys = new Set<string>();

  activities.forEach((activity) => {
    if (!activity.audioUploaded) return;
    const key = getUtcPracticeDayKey(activity.createdAt);
    if (key) activeDayKeys.add(key);
  });

  const todayKey = getUtcDayKeyAtOffset(now, 0);
  const yesterdayKey = getUtcDayKeyAtOffset(now, 1);
  const practicedToday = activeDayKeys.has(todayKey);
  const streakStartOffset = practicedToday ? 0 : activeDayKeys.has(yesterdayKey) ? 1 : null;
  let streakDays = 0;

  if (streakStartOffset !== null) {
    while (activeDayKeys.has(getUtcDayKeyAtOffset(now, streakStartOffset + streakDays))) {
      streakDays += 1;
    }
  }

  const activeDays7 = Array.from({ length: 7 }, (_, offset) => getUtcDayKeyAtOffset(now, offset))
    .filter((key) => activeDayKeys.has(key)).length;

  return {
    streakDays,
    activeDays7,
    practicedToday,
    activeDayKeys: [...activeDayKeys].sort()
  };
}

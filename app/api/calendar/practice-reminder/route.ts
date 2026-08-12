const supportedLocales = ["en", "tr", "de", "es", "fr"] as const;
type SupportedLocale = typeof supportedLocales[number];

const calendarCopy: Record<SupportedLocale, { summary: string; description: string; alarm: string }> = {
  en: {
    summary: "SpeakAce: 5-minute speaking retry",
    description: "Apply one improvement from your latest feedback with a short speaking retry.",
    alarm: "Your 5-minute SpeakAce practice starts soon."
  },
  tr: {
    summary: "SpeakAce: 5 dakikalık speaking tekrarı",
    description: "Son geri bildirimindeki bir gelişimi kısa bir speaking tekrarıyla uygula.",
    alarm: "5 dakikalık SpeakAce pratiğin birazdan başlıyor."
  },
  de: {
    summary: "SpeakAce: 5 Minuten Sprechtraining",
    description: "Setze eine Verbesserung aus deinem letzten Feedback in einer kurzen Übung um.",
    alarm: "Dein 5-minutiges SpeakAce-Training beginnt gleich."
  },
  es: {
    summary: "SpeakAce: práctica oral de 5 minutos",
    description: "Aplica una mejora de tu último feedback con un intento corto.",
    alarm: "Tu práctica de SpeakAce empieza en unos minutos."
  },
  fr: {
    summary: "SpeakAce : pratique orale de 5 minutes",
    description: "Appliquez une amélioration de votre dernier feedback avec un essai court.",
    alarm: "Votre pratique SpeakAce commence dans quelques minutes."
  }
};

const reminderEndTimes: Record<string, string> = {
  "090000": "091000",
  "190000": "191000"
};

function normalizeCalendarDate(value: string | null) {
  if (!value || !/^\d{8}$/.test(value)) return null;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6));
  const day = Number(value.slice(6, 8));
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const normalized = `${parsed.getUTCFullYear()}${String(parsed.getUTCMonth() + 1).padStart(2, "0")}${String(parsed.getUTCDate()).padStart(2, "0")}`;
  return normalized === value ? value : null;
}

function normalizeLocale(value: string | null): SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale) ? value as SupportedLocale : "en";
}

function escapeCalendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldCalendarLine(line: string) {
  const chunks: string[] = [];
  for (let index = 0; index < line.length; index += 72) {
    chunks.push(line.slice(index, index + 72));
  }
  return chunks.join("\r\n ");
}

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const date = normalizeCalendarDate(searchParams.get("date"));
  const time = searchParams.get("time") ?? "090000";
  const endTime = reminderEndTimes[time];

  if (!date || !endTime) {
    return Response.json({ error: "Invalid reminder date or time." }, { status: 400 });
  }

  const locale = normalizeLocale(searchParams.get("locale"));
  const copy = calendarCopy[locale];
  const practiceUrl = "https://speakace.org/app/practice?source=calendar_return_reminder";
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SpeakAce//Practice Reminder//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:speakace-practice-${date}-${time}@speakace.org`,
    `DTSTAMP:${timestamp}`,
    `DTSTART:${date}T${time}`,
    `DTEND:${date}T${endTime}`,
    `SUMMARY:${escapeCalendarText(copy.summary)}`,
    `DESCRIPTION:${escapeCalendarText(`${copy.description}\n\n${practiceUrl}`)}`,
    `URL:${practiceUrl}`,
    "STATUS:CONFIRMED",
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    "TRIGGER:-PT10M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeCalendarText(copy.alarm)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  const body = `${lines.map(foldCalendarLine).join("\r\n")}\r\n`;
  const filename = `speakace-practice-${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}.ics`;

  return new Response(body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/calendar; charset=utf-8"
    }
  });
}

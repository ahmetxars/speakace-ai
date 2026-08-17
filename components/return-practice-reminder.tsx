"use client";

import { CalendarDays, Clock3 } from "lucide-react";
import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";
import { useAppState } from "@/components/providers";
import { trackClientEvent } from "@/lib/analytics-client";

const reminderCopy = {
  en: {
    eyebrow: "Tomorrow's 5-minute win",
    title: "Keep this score moving",
    body: "Put one short retry on your calendar while today's feedback is still fresh.",
    timeLabel: "Reminder time",
    morning: "Tomorrow, 09:00",
    evening: "Tomorrow, 19:00",
    action: "Schedule in Google Calendar",
    opened: "Google Calendar opened",
    download: "Use another calendar (.ics)",
    note: "Review and save it in your calendar. SpeakAce cannot see your calendar."
  },
  tr: {
    eyebrow: "Yarının 5 dakikalık kazanımı",
    title: "Bu skoru ilerletmeye devam et",
    body: "Bugünkü geri bildirim tazeyken yarın için kısa bir tekrar planla.",
    timeLabel: "Hatırlatma saati",
    morning: "Yarın, 09:00",
    evening: "Yarın, 19:00",
    action: "Google Takvim'de planla",
    opened: "Google Takvim açıldı",
    download: "Başka takvim kullan (.ics)",
    note: "Takviminde kontrol edip kaydet. SpeakAce takvimini göremez."
  },
  de: {
    eyebrow: "Dein 5-Minuten-Erfolg morgen",
    title: "Halte deinen Fortschritt in Bewegung",
    body: "Plane eine kurze Wiederholung, solange das heutige Feedback noch frisch ist.",
    timeLabel: "Erinnerungszeit",
    morning: "Morgen, 09:00",
    evening: "Morgen, 19:00",
    action: "In Google Kalender planen",
    opened: "Google Kalender geöffnet",
    download: "Anderen Kalender nutzen (.ics)",
    note: "Prüfe und speichere den Termin im Kalender. SpeakAce kann deinen Kalender nicht sehen."
  },
  es: {
    eyebrow: "Tu avance de 5 minutos mañana",
    title: "Mantén este resultado en movimiento",
    body: "Programa un intento corto mientras el feedback de hoy sigue fresco.",
    timeLabel: "Hora del recordatorio",
    morning: "Mañana, 09:00",
    evening: "Mañana, 19:00",
    action: "Programar en Google Calendar",
    opened: "Google Calendar abierto",
    download: "Usar otro calendario (.ics)",
    note: "Revísalo y guárdalo en tu calendario. SpeakAce no puede ver tu calendario."
  },
  fr: {
    eyebrow: "Votre progrès de 5 minutes demain",
    title: "Continuez à faire progresser ce score",
    body: "Planifiez un nouvel essai court pendant que le feedback reste frais.",
    timeLabel: "Heure du rappel",
    morning: "Demain, 09:00",
    evening: "Demain, 19:00",
    action: "Planifier dans Google Agenda",
    opened: "Google Agenda ouvert",
    download: "Utiliser un autre agenda (.ics)",
    note: "Vérifiez puis enregistrez l'événement. SpeakAce ne peut pas voir votre agenda."
  }
} as const;

type ReminderLocale = keyof typeof reminderCopy;
type ReminderTime = "090000" | "190000";

function getReminderLocale(language: string): ReminderLocale {
  return language in reminderCopy ? language as ReminderLocale : "en";
}

function formatLocalCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function ReturnPracticeReminder({ sessionId }: { sessionId: string }) {
  const { currentUser, language } = useAppState();
  const locale = getReminderLocale(language);
  const copy = reminderCopy[locale];
  const [reminderTime, setReminderTime] = useState<ReminderTime>("090000");
  const [calendarHref, setCalendarHref] = useState<string | null>(null);
  const [googleCalendarHref, setGoogleCalendarHref] = useState<string | null>(null);
  const [googleCalendarOpened, setGoogleCalendarOpened] = useState(false);
  const reminderRef = useRef<HTMLElement | null>(null);
  const viewTrackedRef = useRef(false);
  const addTrackedRef = useRef(new Set<string>());

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const search = new URLSearchParams({
      date: formatLocalCalendarDate(tomorrow),
      time: reminderTime,
      locale
    });
    setCalendarHref(`/api/calendar/practice-reminder?${search.toString()}`);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) search.set("timezone", timezone);
    search.set("provider", "google");
    setGoogleCalendarHref(`/api/calendar/practice-reminder?${search.toString()}`);
  }, [locale, reminderTime]);

  useEffect(() => {
    const element = reminderRef.current;
    if (!element || !currentUser?.id || viewTrackedRef.current) return;

    const eventId = `reminder-view:${sessionId}`;
    const storageKey = `speakace:${eventId}`;
    try {
      if (window.sessionStorage.getItem(storageKey)) {
        viewTrackedRef.current = true;
        return;
      }
    } catch {
      // Storage can be unavailable in privacy-focused browsers.
    }

    const trackView = () => {
      if (viewTrackedRef.current) return;
      viewTrackedRef.current = true;
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        // Analytics remains best-effort when storage is unavailable.
      }
      void trackClientEvent({
        userId: currentUser?.id,
        event: "return_reminder_view",
        eventId,
        path: `/app/results/${sessionId}`,
        source: "result_tomorrow_card",
        plan: currentUser?.plan,
        locale
      });
      posthog.capture("return_reminder_view", {
        event_id: eventId,
        $insert_id: eventId,
        source: "result_tomorrow_card",
        plan: currentUser?.plan,
        locale
      });
    };

    if (!("IntersectionObserver" in window)) {
      trackView();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
        trackView();
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [currentUser?.id, currentUser?.plan, locale, sessionId]);

  const trackReminder = (
    event: React.MouseEvent<HTMLAnchorElement>,
    provider: "google" | "ics"
  ) => {
    const href = provider === "google" ? googleCalendarHref : calendarHref;
    if (!href) {
      event.preventDefault();
      return;
    }

    if (provider === "google") setGoogleCalendarOpened(true);
    const trackingKey = `${reminderTime}:${provider}`;
    if (!addTrackedRef.current.has(trackingKey)) {
      addTrackedRef.current.add(trackingKey);
      const eventId = `reminder-add:${sessionId}:${reminderTime}:${provider}`;
      const source = `result_tomorrow_${provider}_${reminderTime.slice(0, 2)}00`;
      void trackClientEvent({
        userId: currentUser?.id,
        event: "return_reminder_added",
        eventId,
        path: `/app/results/${sessionId}`,
        source,
        plan: currentUser?.plan,
        locale
      });
      posthog.capture("return_reminder_added", {
        event_id: eventId,
        $insert_id: eventId,
        source,
        plan: currentUser?.plan,
        locale,
        reminder_time: reminderTime
      });
    }
  };

  return (
    <section ref={reminderRef} className="result-return-reminder" aria-labelledby="result-return-reminder-title">
      <div className="result-return-reminder__icon" aria-hidden="true">
        <CalendarDays size={22} />
      </div>
      <div className="result-return-reminder__copy">
        <span className="eyebrow">{copy.eyebrow}</span>
        <strong id="result-return-reminder-title">{copy.title}</strong>
        <p>{copy.body}</p>
        <small>{copy.note}</small>
      </div>
      <div className="result-return-reminder__actions">
        <label className="result-return-reminder__time">
          <span>
            <Clock3 size={14} aria-hidden="true" />
            {copy.timeLabel}
          </span>
          <select
            value={reminderTime}
            onChange={(event) => {
              setReminderTime(event.target.value as ReminderTime);
              setGoogleCalendarOpened(false);
            }}
          >
            <option value="090000">{copy.morning}</option>
            <option value="190000">{copy.evening}</option>
          </select>
        </label>
        <div className="result-return-reminder__calendar-actions">
          <a
            className="button button-primary"
            href={googleCalendarHref ?? "#"}
            aria-disabled={!googleCalendarHref}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => trackReminder(event, "google")}
          >
            {googleCalendarOpened ? copy.opened : copy.action}
          </a>
          <a
            className="result-return-reminder__download"
            href={calendarHref ?? "#"}
            aria-disabled={!calendarHref}
            onClick={(event) => trackReminder(event, "ics")}
          >
            {copy.download}
          </a>
        </div>
      </div>
    </section>
  );
}

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
    action: "Add to calendar",
    saved: "Calendar file ready",
    note: "Private calendar file. Change or remove it whenever you want."
  },
  tr: {
    eyebrow: "Yarının 5 dakikalık kazanımı",
    title: "Bu skoru ilerletmeye devam et",
    body: "Bugünkü geri bildirim tazeyken yarın için kısa bir tekrar planla.",
    timeLabel: "Hatırlatma saati",
    morning: "Yarın, 09:00",
    evening: "Yarın, 19:00",
    action: "Takvime ekle",
    saved: "Takvim dosyası hazır",
    note: "Özel takvim dosyası. İstediğin zaman değiştirebilir veya silebilirsin."
  },
  de: {
    eyebrow: "Dein 5-Minuten-Erfolg morgen",
    title: "Halte deinen Fortschritt in Bewegung",
    body: "Plane eine kurze Wiederholung, solange das heutige Feedback noch frisch ist.",
    timeLabel: "Erinnerungszeit",
    morning: "Morgen, 09:00",
    evening: "Morgen, 19:00",
    action: "Zum Kalender",
    saved: "Kalenderdatei ist bereit",
    note: "Private Kalenderdatei. Du kannst sie jederzeit ändern oder löschen."
  },
  es: {
    eyebrow: "Tu avance de 5 minutos mañana",
    title: "Mantén este resultado en movimiento",
    body: "Programa un intento corto mientras el feedback de hoy sigue fresco.",
    timeLabel: "Hora del recordatorio",
    morning: "Mañana, 09:00",
    evening: "Mañana, 19:00",
    action: "Añadir al calendario",
    saved: "Archivo de calendario listo",
    note: "Archivo de calendario privado. Puedes cambiarlo o borrarlo cuando quieras."
  },
  fr: {
    eyebrow: "Votre progrès de 5 minutes demain",
    title: "Continuez à faire progresser ce score",
    body: "Planifiez un nouvel essai court pendant que le feedback reste frais.",
    timeLabel: "Heure du rappel",
    morning: "Demain, 09:00",
    evening: "Demain, 19:00",
    action: "Ajouter au calendrier",
    saved: "Fichier calendrier prêt",
    note: "Fichier calendrier privé. Modifiez-le ou supprimez-le à tout moment."
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
  const [calendarOpened, setCalendarOpened] = useState(false);
  const reminderRef = useRef<HTMLElement | null>(null);
  const viewTrackedRef = useRef(false);
  const addTrackedRef = useRef(false);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const search = new URLSearchParams({
      date: formatLocalCalendarDate(tomorrow),
      time: reminderTime,
      locale
    });
    setCalendarHref(`/api/calendar/practice-reminder?${search.toString()}`);
  }, [locale, reminderTime]);

  useEffect(() => {
    const element = reminderRef.current;
    if (!element || viewTrackedRef.current) return;

    const trackView = () => {
      if (viewTrackedRef.current) return;
      viewTrackedRef.current = true;
      const eventId = crypto.randomUUID();
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

  const trackReminder = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!calendarHref) {
      event.preventDefault();
      return;
    }

    setCalendarOpened(true);
    if (!addTrackedRef.current) {
      addTrackedRef.current = true;
      const eventId = crypto.randomUUID();
      const source = `result_tomorrow_${reminderTime.slice(0, 2)}00`;
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
              setCalendarOpened(false);
              addTrackedRef.current = false;
            }}
          >
            <option value="090000">{copy.morning}</option>
            <option value="190000">{copy.evening}</option>
          </select>
        </label>
        <a
          className="button button-primary"
          href={calendarHref ?? "#"}
          aria-disabled={!calendarHref}
          onClick={trackReminder}
        >
          {calendarOpened ? copy.saved : copy.action}
        </a>
      </div>
    </section>
  );
}

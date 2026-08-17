import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/calendar/practice-reminder/route";

describe("practice calendar reminder", () => {
  it("returns a private localized calendar file", async () => {
    const response = await GET(new Request(
      "https://speakace.org/api/calendar/practice-reminder?date=20260813&time=190000&locale=tr"
    ));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/calendar");
    expect(response.headers.get("content-disposition")).toBe(
      "attachment; filename=\"speakace-practice-2026-08-13.ics\""
    );
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(body).toContain("DTSTART:20260813T190000");
    expect(body).toContain("DTEND:20260813T191000");
    expect(body).toContain("SUMMARY:SpeakAce: 5 dakikalık speaking tekrarı");
    expect(body).toContain("https://speakace.org/app/practice?source=calendar_return_reminder");
    expect(body).toContain("BEGIN:VALARM");
  });

  it("opens a prefilled Google Calendar event in the learner's timezone", async () => {
    const response = await GET(new Request(
      "https://speakace.org/api/calendar/practice-reminder?date=20260818&time=090000&locale=en&provider=google&timezone=Europe%2FAmsterdam"
    ));
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(302);
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    expect(location.origin).toBe("https://calendar.google.com");
    expect(location.searchParams.get("action")).toBe("TEMPLATE");
    expect(location.searchParams.get("text")).toBe("SpeakAce: 5-minute speaking retry");
    expect(location.searchParams.get("dates")).toBe("20260818T090000/20260818T091000");
    expect(location.searchParams.get("ctz")).toBe("Europe/Amsterdam");
    expect(location.searchParams.get("details")).toContain(
      "https://speakace.org/app/practice?source=calendar_return_reminder"
    );
  });

  it("ignores invalid timezone values when opening Google Calendar", async () => {
    const response = await GET(new Request(
      "https://speakace.org/api/calendar/practice-reminder?date=20260818&time=090000&provider=google&timezone=Not%2FA_Timezone"
    ));
    const location = new URL(response.headers.get("location") ?? "");

    expect(response.status).toBe(302);
    expect(location.searchParams.has("ctz")).toBe(false);
  });

  it("rejects impossible dates and unsupported reminder times", async () => {
    const invalidDate = await GET(new Request(
      "https://speakace.org/api/calendar/practice-reminder?date=20260231&time=090000"
    ));
    const invalidTime = await GET(new Request(
      "https://speakace.org/api/calendar/practice-reminder?date=20260813&time=123000"
    ));

    expect(invalidDate.status).toBe(400);
    expect(invalidTime.status).toBe(400);
  });
});

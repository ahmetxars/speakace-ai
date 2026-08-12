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

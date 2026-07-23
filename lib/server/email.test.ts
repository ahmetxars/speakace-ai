import { describe, expect, it } from "vitest";
import { resolveEmailReplyTo } from "@/lib/server/email";

describe("email reply routing", () => {
  it("uses the current SpeakAce contact inbox when no override exists", () => {
    expect(resolveEmailReplyTo(undefined)).toBe("aa.arslan@outlook.com.tr");
  });

  it("replaces the lost legacy inbox even when it remains in production env", () => {
    expect(resolveEmailReplyTo("info@speakace.org")).toBe("aa.arslan@outlook.com.tr");
  });

  it("preserves a valid explicit reply-to override", () => {
    expect(resolveEmailReplyTo(" support@example.com ")).toBe("support@example.com");
  });
});

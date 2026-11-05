import { describe, expect, it } from "vitest";
import { publicSection } from "./public-navigation";
describe("public section ownership", () => {
  it("keeps nested editorial and practice resources under Resources", () => {
    for (const path of [
      "/resources",
      "/blog/a-post",
      "/tools/a-calculator",
      "/guides/a-guide",
      "/ielts-speaking-topics",
      "/speaking-timer",
      "/free-ielts-speaking-test",
    ])
      expect(publicSection(path)).toBe("resources");
  });
  it("keeps the teacher demo with audience pages", () => {
    for (const path of [
      "/for-students",
      "/for-teachers",
      "/for-schools",
      "/teacher-demo",
    ])
      expect(publicSection(path)).toBe("audience");
  });
  it("does not classify private routes or partial path matches", () => {
    for (const path of [
      "/",
      "/pricing",
      "/app/teacher",
      "/admin",
      "/blogger",
      "/toolshed",
      "/for-schools-extra",
    ])
      expect(publicSection(path)).toBeNull();
  });
});

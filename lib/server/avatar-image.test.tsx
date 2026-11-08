import { describe, expect, it, vi } from "vitest";
import OpenGraphImage from "@/app/share/[slug]/opengraph-image";
import { getSharedResultCard } from "@/lib/shared-result-cards";
import { validateAvatarDataUrl } from "./avatar-image";

vi.mock("@/lib/shared-result-cards", () => ({ getSharedResultCard: vi.fn() }));

const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB0UAAAAASUVORK5CYII=";

describe("shared avatar validation", () => {
  it("permits an uploaded PNG and rejects remote, SVG, and mismatched image input", () => {
    expect(validateAvatarDataUrl(png)).toBe(png);
    expect(validateAvatarDataUrl("https://example.test/avatar.png")).toBeNull();
    expect(validateAvatarDataUrl(png.replace("png", "svg+xml"))).toBeNull();
    expect(validateAvatarDataUrl(png.replace("png", "jpeg"))).toBeNull();
    expect(validateAvatarDataUrl(png + " ")).toBeNull();
  });

  it("renders a legacy card without fetching its stored external avatar", async () => {
    vi.mocked(getSharedResultCard).mockResolvedValue({
      avatarDataUrl: "http://127.0.0.1:1/avatar.png",
      learnerName: "Local learner",
      categories: [{ label: "Fluency", score: 6 }, { label: "Grammar", score: 6 }],
      examType: "IELTS",
      overallScore: 6,
      scaleLabel: "Band",
      promptTitle: "Fixture",
      localeFlag: "🌍",
      slug: "fixture",
      nextExercise: "Practice again",
      streakLabel: "One day"
    } as NonNullable<Awaited<ReturnType<typeof getSharedResultCard>>>);

    const fetch = vi.spyOn(globalThis, "fetch");
    try {
      const response = await OpenGraphImage({ params: Promise.resolve({ slug: "fixture" }) });
      const image = Buffer.from(await response.arrayBuffer());
      expect(image.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
      expect(fetch).not.toHaveBeenCalled();
    } finally {
      fetch.mockRestore();
    }
  });
});

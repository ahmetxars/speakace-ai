import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("@/components/providers", () => ({
  useAppState: () => ({ language: "en" }),
}));
import { PublicPageFrame } from "./page-frame";
import { LibrarySearch } from "./library-search";
import { ToolDirectory } from "./tool-directory";
import { PreviewScenes } from "@/components/motion/preview-scenes";
import { ResourceCard } from "./page-primitives";

describe("rendered public accessibility contracts", () => {
  it("keeps public styles aligned with client routes rather than a cached initial route", () => {
    for (const [pathname, framed] of [
      ["/pricing", true],
      ["/", false],
      ["/reviews", true],
      ["/app/billing", false],
    ] as const) {
      route.pathname = pathname;
      const html = renderToStaticMarkup(
        <PublicPageFrame initialPath="/"><main>Content</main></PublicPageFrame>,
      );
      expect(html.includes('class="public-page"')).toBe(framed);
      expect(html).toContain("<main>Content</main>");
    }
  });
  it("names search and clear controls separately without nesting a button in a label", () => {
    const html = renderToStaticMarkup(
      createElement(LibrarySearch, {
        value: "timer",
        label: "Search practice tools",
        onChange: () => {},
      }),
    );
    expect(html).toMatch(
      /<input[^>]+type="search"[^>]+aria-label="Search practice tools"/,
    );
    expect(html).toMatch(/<button[^>]+aria-label="Clear search"/);
    expect(html).not.toContain("<label");
  });
  it("makes inactive scenes inert and hides them from assistive technology", () => {
    const html = renderToStaticMarkup(
      <PreviewScenes active={1}>{[<button key="first">First</button>, <button key="second">Second</button>]}</PreviewScenes>,
    );
    const panels = html.match(/<div[^>]+class="preview-scene(?: |")[^>]*>/g)!;
    expect(panels).toHaveLength(2);
    expect(panels[0]).toContain('aria-hidden="true"');
    expect(panels[0]).toContain('inert=""');
    expect(panels[1]).toContain('aria-hidden="false"');
    expect(panels[1]).not.toContain("inert=");
  });
  it("connects the selected tool tab to a named, focusable result panel", () => {
    const html = renderToStaticMarkup(
      createElement(ToolDirectory, {
        tools: [
          {
            href: "/speaking-timer",
            title: "Timer",
            description: "Time an answer",
            group: 0,
          },
        ],
      }),
    );
    expect(html.match(/role="tab"/g)).toHaveLength(4);
    expect(html.match(/aria-selected="true"/g)).toHaveLength(1);
    expect(html).toMatch(
      /id="tool-results"[^>]+role="tabpanel"[^>]+tabindex="0"[^>]+aria-labelledby="tool-tab-0"/,
    );
    expect(html).toContain('aria-label="Search tools by task or keyword"');
  });
  it("marks English learning content separately while keeping a single card link", () => {
    const html = renderToStaticMarkup(
      createElement(ResourceCard, {
        href: "/speaking-timer",
        category: "Pratik",
        title: "Speaking Timer",
        description: "Time your answer",
        action: "Aracı aç",
        contentLanguage: "en",
      }),
    );
    expect(html).toContain('<h3 lang="en">');
    expect(html).toContain('<p lang="en">');
    expect(html.match(/<a /g)).toHaveLength(1);
  });
});

import { cookieConsentCopy } from "./cookie-consent-copy";
import { describe, expect, it } from "vitest";
import { getEffectiveLocale } from "./public-locale";
import { discoveryRefinementCopy } from "./discovery-refinement-copy";
import { navigationLandmarks } from "./public-navigation";
import { pricingCopy } from "./pricing-copy";
import { filterTools, normalizeToolQuery } from "./tool-search";
import { buildPlanCheckoutPath, getPlanComparison } from "./commerce";

const locales = ["en", "tr", "de", "es", "fr"] as const;
const routes = [
  "/pricing",
  "/for-students",
  "/for-teachers",
  "/for-schools",
  "/tools",
  "/resources",
  "/blog",
  "/reviews",
  "/auth",
];
describe("account/public plan consistency", () => {
  it.each([false,true])("uses actual allowances and the same feedback on both plans (%s)", tr => {
    const t=pricingCopy[tr?"tr":"en"];
    const rows=getPlanComparison(tr);
    expect(rows.find(row=>row.label===t.feedback)).toMatchObject({free:t.included,plus:t.included});
    expect(rows.find(row=>row.label===t.export)).toMatchObject({free:t.unavailable,plus:t.included});
    expect(rows.find(row=>row.label===t.sessions)).toMatchObject({free:"4",plus:"18"});
  });
});
describe("route locale and complete discovery copy", () => {
  it.each(locales)(
    "provides all cookie decisions in %s without English fallback",
    (locale) => {
      const copy = cookieConsentCopy[locale];
      for (const [key, value] of Object.entries(copy)) {
        expect(value.length).toBeGreaterThan(3);
        if (locale !== "en")
          expect(value).not.toBe(
            cookieConsentCopy.en[key as keyof typeof copy],
          );
      }
    },
  );
  it.each(locales)(
    "keeps %s preference across fallback and translated pages",
    (preference) => {
      const expected = preference === "tr" ? "tr" : "en";
      expect(getEffectiveLocale(preference, "/")).toBe(expected);
      expect(getEffectiveLocale(preference, "/app/billing")).toBe(expected);
      for (const route of routes)
        expect(getEffectiveLocale(preference, route)).toBe(preference);
      expect(getEffectiveLocale(preference, "/admin")).toBe("tr");
      // Returning to a translated route restores the original preference, not the fallback.
      expect(getEffectiveLocale(preference, "/reviews")).toBe(preference);
    },
  );
  it.each(locales)(
    "supplies every review section, item, CTA and search name in %s",
    (locale) => {
      const copy = discoveryRefinementCopy[locale];
      expect(copy.reviewGroups).toHaveLength(3);
      for (const [title, points] of copy.reviewGroups) {
        expect(title.length).toBeGreaterThan(8);
        expect(points).toHaveLength(3);
        expect(points.every((point) => point.length > 20)).toBe(true);
      }
      for (const key of [
        "practiceAction",
        "demoAction",
        "compareAction",
        "reviewSection",
        "reviewSectionTitle",
        "reviewClosing",
        "reviewClosingBody",
        "toolSearch",
      ] as const) {
        expect(copy[key].length).toBeGreaterThan(4);
        if (locale !== "en")
          expect(copy[key]).not.toBe(discoveryRefinementCopy.en[key]);
      }
      expect(copy.toolSearch).not.toBe(copy.allTools);
      expect(navigationLandmarks[locale]).toHaveLength(2);
    },
  );
  it.each(locales)(
    "communicates 12-month single payment and qualified trial in %s",
    (locale) => {
      const t = pricingCopy[locale];
      expect(t.annualTerms).toContain("12");
      expect(t.annualTerms).toContain("49.99");
      expect(t.trial).toContain("3.99");
      expect(t.checkoutSteps[0].body).toContain(t.trial);
      expect(t.faqs[0].a).toContain(t.annualTerms);
      expect(t.annual).toContain("12");
    },
  );
  it.each(["weekly", "annual"] as const)(
    "preserves checkout selection and attribution for %s",
    (billing) => {
      const url = new URL(
        buildPlanCheckoutPath({
          plan: "plus",
          billing,
          campaign: "regression",
        }),
        "https://speakace.org",
      );
      expect(url.pathname).toBe("/api/payments/lemon/checkout");
      expect(url.searchParams.get("billing") ?? "weekly").toBe(billing);
      expect(url.searchParams.get("plan")).toBe("plus");
      expect(url.searchParams.get("campaign")).toBe("regression");
    },
  );
});
const tools = [
  {
    href: "/speaking-timer",
    title: "Speaking Timer",
    description: "Time your answer",
    group: 0,
  },
  {
    href: "/tools/ielts-score-calculator",
    title: "Score Calculator",
    description: "Band estimate",
    group: 1,
  },
  {
    href: "/tools/study-plan",
    title: "Study Plan",
    description: "Plan your practice",
    group: 2,
  },
  {
    href: "/tools/answer-checker",
    title: "Answer Checker",
    description: "Feedback on answers",
    group: 2,
  },
];
describe("multilingual tools discovery", () => {
  it.each([
    "timer",
    "ZAMANLAYICI",
    "zamanlayıcı",
    "Stoppuhr",
    "temporizador",
    "minuteur",
  ])("finds timer using %s", (query) =>
    expect(filterTools(tools, query).map((t) => t.href)).toContain(
      "/speaking-timer",
    ),
  );
  it.each([
    "speaking practice",
    "konuşma pratiği",
    "Sprechübung",
    "práctica oral",
    "pratique orale",
  ])("finds speaking using %s", (query) =>
    expect(filterTools(tools, query)[0]?.href).toBe("/speaking-timer"),
  );
  it.each([
    "score calculator",
    "puan hesaplayıcı",
    "Punkterechner",
    "calculadora de puntuación",
    "calculateur de score",
  ])("finds calculator using %s", (query) =>
    expect(filterTools(tools, query)[0]?.group).toBe(1),
  );
  it.each([
    "study plan",
    "çalışma planı",
    "Lernplan",
    "plan de estudio",
    "plan d’étude",
  ])("finds plan using %s", (query) =>
    expect(filterTools(tools, query)[0]?.href).toBe("/tools/study-plan"),
  );
  it.each([
    "feedback",
    "geri bildirim",
    "Rückmeldung",
    "comentarios",
    "retour",
  ])("finds feedback using %s", (query) =>
    expect(filterTools(tools, query)[0]?.href).toBe("/tools/answer-checker"),
  );
  it("combines filters and search, and resets without losing tools", () => {
    expect(filterTools(tools, "zamanlayıcı", 2)).toHaveLength(0);
    expect(filterTools(tools, "geri bildirim", 2)).toHaveLength(1);
    expect(filterTools(tools, "")).toHaveLength(4);
    expect(filterTools(tools, "not-a-real-tool")).toHaveLength(0);
    expect(normalizeToolQuery("ÇALIŞMA İÇİN")).toBe("calisma icin");
  });
});

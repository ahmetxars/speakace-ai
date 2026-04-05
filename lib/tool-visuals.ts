export type ToolVisual = {
  emoji: string;
  badge: string;
  title: string;
  note: string;
};

export function getToolVisual(slug: string, tr = false): ToolVisual {
  if (slug.includes("calculator")) {
    return {
      emoji: "📊",
      badge: tr ? "Skor araci" : "Score tool",
      title: tr ? "Tahmini band gorunumu" : "Estimated band preview",
      note: tr ? "Puan sinyalini hizli gormek icin." : "Use it to preview your band signal quickly."
    };
  }

  if (slug.includes("answer-checker")) {
    return {
      emoji: "🧠",
      badge: tr ? "Kontrol araci" : "Check tool",
      title: tr ? "Cevap kalitesi tarayici" : "Answer quality scan",
      note: tr ? "Netlik, ornek ve uzunluk sinyali verir." : "Checks clarity, examples, and answer length."
    };
  }

  if (
    slug.includes("study-plan") ||
    slug.includes("schedule") ||
    slug.includes("goal-builder") ||
    slug.includes("daily-goal") ||
    slug.includes("mock-schedule")
  ) {
    return {
      emoji: "🗓️",
      badge: tr ? "Planlayici" : "Planner",
      title: tr ? "Kaydedilebilir calisma plani" : "Saveable study plan",
      note: tr ? "Sisteme kaydet, goreve donustur, maile gonder." : "Save it, turn it into tasks, and email it."
    };
  }

  if (slug.includes("template")) {
    return {
      emoji: "📝",
      badge: tr ? "Sablon" : "Template",
      title: tr ? "Kullanima hazir not duzeni" : "Ready-to-use note structure",
      note: tr ? "Ozellikle TOEFL not tutma icin hizli iskelet." : "A fast note framework, especially for TOEFL tasks."
    };
  }

  return {
    emoji: "✨",
    badge: tr ? "Uretici" : "Generator",
    title: tr ? "Aninda speaking ciktilari" : "Instant speaking outputs",
    note: tr ? "Prompt, acilis, gecis veya fikir uretir." : "Generates prompts, openings, transitions, or ideas."
  };
}

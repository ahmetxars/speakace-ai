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
      badge: tr ? "Skor aracı" : "Score tool",
      title: tr ? "Tahmini band görünümü" : "Estimated band preview",
      note: tr ? "Puan sinyalini hızlı görmek için." : "Use it to preview your band signal quickly."
    };
  }

  if (slug.includes("answer-checker")) {
    return {
      emoji: "🧠",
      badge: tr ? "Kontrol aracı" : "Check tool",
      title: tr ? "Cevap kalitesi tarayıcı" : "Answer quality scan",
      note: tr ? "Netlik, örnek ve uzunluk sinyali verir." : "Checks clarity, examples, and answer length."
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
      badge: tr ? "Planlayıcı" : "Planner",
      title: tr ? "Kaydedilebilir çalışma planı" : "Saveable study plan",
      note: tr ? "Sisteme kaydet, göreve dönüştür, maile gönder." : "Save it, turn it into tasks, and email it."
    };
  }

  if (slug.includes("template")) {
    return {
      emoji: "📝",
      badge: tr ? "Şablon" : "Template",
      title: tr ? "Kullanıma hazır not düzeni" : "Ready-to-use note structure",
      note: tr ? "Özellikle TOEFL not tutma için hızlı iskelet." : "A fast note framework, especially for TOEFL tasks."
    };
  }

  return {
    emoji: "✨",
    badge: tr ? "Üretici" : "Generator",
    title: tr ? "Anında speaking çıktıları" : "Instant speaking outputs",
    note: tr ? "Prompt, açılış, geçiş veya fikir üretir." : "Generates prompts, openings, transitions, or ideas."
  };
}

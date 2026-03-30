"use client";

const TEMPLATES = {
  en: [
    "Give a direct answer first, then add one reason and one example.",
    "Slow down slightly and finish each sentence more clearly.",
    "Use fewer repeated words and replace them with one stronger phrase.",
    "Your structure is improving; now focus on cleaner transitions.",
    "Keep the same idea, but support it with one concrete detail."
  ],
  tr: [
    "Önce doğrudan cevap ver, sonra bir neden ve bir örnek ekle.",
    "Biraz daha yavaş konuş ve her cümleyi daha temiz bitir.",
    "Tekrar eden kelimeleri azalt, yerine bir daha güçlü ifade koy.",
    "Yapın gelişiyor; şimdi daha temiz geçişlere odaklan.",
    "Aynı fikri koru ama bir somut detayla destekle."
  ]
};

export function TeacherNoteTemplates({
  tr,
  onSelect
}: {
  tr: boolean;
  onSelect: (value: string) => void;
}) {
  const templates = tr ? TEMPLATES.tr : TEMPLATES.en;

  return (
    <div className="card" style={{ padding: "0.85rem", background: "rgba(29, 111, 117, 0.08)", display: "grid", gap: "0.6rem" }}>
      <strong style={{ fontSize: "0.95rem" }}>{tr ? "Hızlı not şablonları" : "Quick note templates"}</strong>
      <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
        {templates.map((template) => (
          <button
            key={template}
            type="button"
            className="button button-secondary"
            onClick={() => onSelect(template)}
            style={{ textAlign: "left", justifyContent: "flex-start" }}
          >
            {template}
          </button>
        ))}
      </div>
    </div>
  );
}

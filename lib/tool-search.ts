export type SearchableTool = {
  href: string;
  title: string;
  description: string;
  group: number;
};

/** Accent-insensitive matching also handles Turkish dotted/dotless I consistently. */
export function normalizeToolQuery(value: string) {
  return value
    .toLowerCase()
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}
// Domain concepts, independent of the chosen UI language, keep cross-language searches useful.
const concepts = [
  {
    matches: /timer/,
    aliases:
      "timer zamanlayıcı kronometre minuterie minuteur temporisateur temporizador Zeitmesser Stoppuhr",
  },
  {
    matches: /speaking|cue-card/,
    aliases:
      "speaking practice konuşma pratiği Sprechübung Sprechtraining mündliche Übung práctica oral práctica de conversación expression orale pratique orale",
  },
  {
    matches: /calculator|estimator/,
    aliases:
      "score calculator band estimate puan hesaplayıcı puan hesaplama seviye tahmini Punkterechner Bandrechner Notenrechner calculadora de puntuación calculateur de score calculateur de note",
  },
  {
    matches: /plan|schedule|goal/,
    aliases:
      "study plan çalışma planı çalışma programı Lernplan Studienplan plan de estudio plan d étude programme d études",
  },
  {
    matches: /checker|feedback|replay/,
    aliases:
      "feedback geri bildirim değerlendirme Rückmeldung Bewertung comentarios retroalimentación retour évaluation",
  },
  {
    matches: /phrase|opening|transition/,
    aliases: "phrases kalıplar Redemittel expresiones expressions",
  },
  {
    matches: /question|topic|cue-card|idea/,
    aliases:
      "question topic idea soru konu fikir Frage Thema Idee pregunta tema idée sujet question",
  },
];
export function filterTools<T extends SearchableTool>(
  tools: T[],
  query: string,
  group = -1,
): T[] {
  const terms = normalizeToolQuery(query).split(" ").filter(Boolean);
  return tools.filter((tool) => {
    if (group !== -1 && tool.group !== group) return false;
    const aliases = concepts
      .filter((c) => c.matches.test(tool.href))
      .map((c) => c.aliases)
      .join(" ");
    const index = normalizeToolQuery(
      `${tool.title} ${tool.description} ${aliases}`,
    );
    return terms.every((term) => index.includes(term));
  });
}

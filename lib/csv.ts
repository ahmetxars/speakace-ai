export function csvCell(value: string) {
  // Quote CSV delimiters and make spreadsheet formula prefixes literal text.
  const firstCharacter = value.charCodeAt(0);
  const startsWithControl = firstCharacter < 32 || firstCharacter === 127;
  const startsWithFormula = /^[=+\-@＝＋－＠]/u.test(value.trimStart());
  const escaped = startsWithControl || startsWithFormula ? `'${value}` : value;
  return `"${escaped.replaceAll('"', '""')}"`;
}

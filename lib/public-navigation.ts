/** Parent sections stay identifiable when reading a nested public page. */
export function publicSection(
  pathname: string,
): "audience" | "resources" | null {
  if (
    /^\/for-(students|teachers|schools)(\/|$)/.test(pathname) ||
    pathname === "/teacher-demo"
  )
    return "audience";
  if (
    /^\/(resources|blog|guides|tools)(\/|$)/.test(pathname) ||
    /^\/(ielts-|toefl-|speaking-|daily-|weekly-|free-ielts-)/.test(pathname)
  )
    return "resources";
  return null;
}
export const publicLanguageNotice = {
  en: "Homepage: English and Turkish. Learning pages: five supported languages.",
  tr: "Ana sayfa: İngilizce ve Türkçe. Öğrenme sayfaları: desteklenen beş dil.",
  de: "Startseite: Englisch und Türkisch. Lernseiten: fünf unterstützte Sprachen.",
  es: "Inicio: inglés y turco. Páginas de aprendizaje: cinco idiomas compatibles.",
  fr: "Accueil : anglais et turc. Pages pédagogiques : cinq langues prises en charge.",
};
export const productExperienceLabel = {
  en: "Product experience",
  tr: "Ürün deneyimi",
  de: "Produkterfahrung",
  es: "Experiencia del producto",
  fr: "Expérience produit",
};

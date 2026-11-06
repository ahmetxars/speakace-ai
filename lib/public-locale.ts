import {
  defaultLanguage,
  isPublicLanguage,
  type PublicLanguage,
  type Language,
} from "@/lib/copy";

/** A route may fall back without changing the visitor's saved preference. */
export function getEffectiveLocale(
  preference: Language,
  pathname: string,
): PublicLanguage {
  const language = isPublicLanguage(preference) ? preference : defaultLanguage;
  if (/^\/admin(\/|$)/.test(pathname)) return "tr";
  if (pathname === "/" || /^\/app(\/|$)/.test(pathname))
    return language === "tr" ? "tr" : "en";
  return language;
}

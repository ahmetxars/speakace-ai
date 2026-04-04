import { cookies } from "next/headers";
import { defaultLanguage, getLanguageDirection, isSupportedLanguage, Language } from "@/lib/copy";

export async function getServerLanguage() {
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get("speakace-language")?.value;
  return isSupportedLanguage(cookieLanguage) ? cookieLanguage : defaultLanguage;
}

export async function getServerDirection() {
  const language = await getServerLanguage();
  return getLanguageDirection(language);
}

export function normalizeLanguage(value: string | null | undefined): Language {
  return isSupportedLanguage(value) ? value : defaultLanguage;
}

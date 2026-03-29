import { StudyListFolder, StudyListItem } from "@/lib/types";

const FOLDERS_KEY = "speakace-study-folders";
const ITEMS_KEY = "speakace-study-items";

export function readStudyFolders(): StudyListFolder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FOLDERS_KEY);
    return raw ? (JSON.parse(raw) as StudyListFolder[]) : [];
  } catch {
    return [];
  }
}

export function writeStudyFolders(folders: StudyListFolder[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
}

export function readStudyItems(): StudyListItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ITEMS_KEY);
    return raw ? (JSON.parse(raw) as StudyListItem[]) : [];
  } catch {
    return [];
  }
}

export function writeStudyItems(items: StudyListItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

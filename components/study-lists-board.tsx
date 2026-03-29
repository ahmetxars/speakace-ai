"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { StudyListFolder, StudyListItem } from "@/lib/types";
import { readStudyFolders, readStudyItems, writeStudyFolders, writeStudyItems } from "@/lib/study-lists";

export function StudyListsBoard() {
  const { language } = useAppState();
  const tr = language === "tr";
  const [folders, setFolders] = useState<StudyListFolder[]>([]);
  const [items, setItems] = useState<StudyListItem[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");

  useEffect(() => {
    const nextFolders = readStudyFolders();
    const nextItems = readStudyItems();
    setFolders(nextFolders);
    setItems(nextItems);
    setSelectedFolderId(nextFolders[0]?.id ?? "");
  }, []);

  const selectedItems = useMemo(
    () => items.filter((item) => item.folderId === selectedFolderId),
    [items, selectedFolderId]
  );

  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    const nextFolder: StudyListFolder = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString()
    };
    const next = [nextFolder, ...folders];
    setFolders(next);
    setSelectedFolderId(nextFolder.id);
    setNewFolderName("");
    writeStudyFolders(next);
  };

  const removeFolder = (folderId: string) => {
    const nextFolders = folders.filter((folder) => folder.id !== folderId);
    const nextItems = items.filter((item) => item.folderId !== folderId);
    setFolders(nextFolders);
    setItems(nextItems);
    writeStudyFolders(nextFolders);
    writeStudyItems(nextItems);
    if (selectedFolderId === folderId) {
      setSelectedFolderId(nextFolders[0]?.id ?? "");
    }
  };

  const removeItem = (itemId: string) => {
    const next = items.filter((item) => item.id !== itemId);
    setItems(next);
    writeStudyItems(next);
  };

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{tr ? "Study lists" : "Study lists"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Bookmark klasorlerin" : "Your bookmark folders"}</h1>
        <p style={{ color: "var(--muted)", maxWidth: 760, lineHeight: 1.7 }}>
          {tr ? "Result ekraninda kaydettigin sorulari burada klasorler halinde tutabilir, sonra tekrar practice akisina gonderebilirsin." : "Keep the prompts you saved from result screens in folders here and relaunch them into practice later."}
        </p>
      </section>

      <section className="grid" style={{ gridTemplateColumns: "minmax(280px, 0.9fr) minmax(320px, 1.1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <strong>{tr ? "Yeni klasor" : "New folder"}</strong>
          <input
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            placeholder={tr ? "Ornek: Zor TOEFL sorulari" : "Example: Tough TOEFL prompts"}
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
          <button type="button" className="button button-primary" onClick={createFolder}>
            {tr ? "Klasor olustur" : "Create folder"}
          </button>
          <div style={{ display: "grid", gap: "0.7rem" }}>
            {folders.length ? folders.map((folder) => (
              <div key={folder.id} className="card" style={{ padding: "0.9rem", background: selectedFolderId === folder.id ? "rgba(29,111,117,0.08)" : "var(--surface-strong)", display: "grid", gap: "0.55rem" }}>
                <strong>{folder.name}</strong>
                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                  <button type="button" className="button button-secondary" onClick={() => setSelectedFolderId(folder.id)}>
                    {tr ? "Ac" : "Open"}
                  </button>
                  <button type="button" className="button button-secondary" onClick={() => removeFolder(folder.id)}>
                    {tr ? "Sil" : "Delete"}
                  </button>
                </div>
              </div>
            )) : (
              <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
                {tr ? "Henuz klasor yok." : "No folders yet."}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <strong>{selectedFolderId ? (folders.find((folder) => folder.id === selectedFolderId)?.name ?? (tr ? "Klasor" : "Folder")) : tr ? "Bir klasor sec" : "Select a folder"}</strong>
          {selectedFolderId ? (
            selectedItems.length ? (
              <div className="grid" style={{ gap: "0.75rem" }}>
                {selectedItems.map((item) => (
                  <div key={item.id} className="card" style={{ padding: "0.95rem", background: "var(--surface-strong)", display: "grid", gap: "0.55rem" }}>
                    <strong>{item.title}</strong>
                    <div className="practice-meta">{item.examType} · {humanizeTaskType(item.taskType, tr)}</div>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      <Link
                        className="button button-secondary"
                        href={{
                          pathname: "/app/practice",
                          query: {
                            promptId: item.promptId,
                            examType: item.examType,
                            taskType: item.taskType,
                            difficulty: item.difficulty
                          }
                        }}
                      >
                        {tr ? "Practice'de ac" : "Open in practice"}
                      </Link>
                      <button type="button" className="button button-secondary" onClick={() => removeItem(item.id)}>
                        {tr ? "Kaldir" : "Remove"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
                {tr ? "Bu klasorde henuz soru yok." : "There are no prompts in this folder yet."}
              </div>
            )
          ) : (
            <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
              {tr ? "Sag tarafta icerigi gormek icin soldan bir klasor sec." : "Select a folder on the left to view its prompts here."}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function humanizeTaskType(taskType: string, tr: boolean) {
  const labels: Record<string, { tr: string; en: string }> = {
    "ielts-part-1": { tr: "IELTS Part 1", en: "IELTS Part 1" },
    "ielts-part-2": { tr: "IELTS Part 2", en: "IELTS Part 2" },
    "ielts-part-3": { tr: "IELTS Part 3", en: "IELTS Part 3" },
    "toefl-task-1": { tr: "TOEFL Task 1", en: "TOEFL Task 1" },
    "toefl-task-2": { tr: "TOEFL Task 2", en: "TOEFL Task 2" },
    "toefl-task-3": { tr: "TOEFL Task 3", en: "TOEFL Task 3" },
    "toefl-task-4": { tr: "TOEFL Task 4", en: "TOEFL Task 4" }
  };
  return tr ? (labels[taskType]?.tr ?? taskType) : (labels[taskType]?.en ?? taskType);
}

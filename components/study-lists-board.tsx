"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppState } from "@/components/providers";
import { StudyListFolder, StudyListItem, StudyListTask } from "@/lib/types";
import { readStudyFolders, readStudyItems, writeStudyFolders, writeStudyItems } from "@/lib/study-lists";

type ApiState = {
  folders: StudyListFolder[];
  items: StudyListItem[];
  tasks: StudyListTask[];
};

const emptyState: ApiState = {
  folders: [],
  items: [],
  tasks: []
};

export function StudyListsBoard() {
  const { language } = useAppState();
  const tr = language === "tr";
  const [folders, setFolders] = useState<StudyListFolder[]>([]);
  const [items, setItems] = useState<StudyListItem[]>([]);
  const [tasks, setTasks] = useState<StudyListTask[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskNote, setNewTaskNote] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/study-lists", { cache: "no-store" });
      const payload = (await response.json().catch(() => emptyState)) as Partial<ApiState>;

      if (!response.ok) {
        throw new Error("Unable to load study lists.");
      }

      const nextFolders = payload.folders ?? [];
      const nextItems = payload.items ?? [];
      const nextTasks = payload.tasks ?? [];

      if (!nextFolders.length) {
        const legacyFolders = readStudyFolders();
        const legacyItems = readStudyItems();
        if (legacyFolders.length || legacyItems.length) {
          await fetch("/api/study-lists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "import",
              folders: legacyFolders,
              items: legacyItems
            })
          });
          writeStudyFolders([]);
          writeStudyItems([]);
          return loadBoard();
        }
      }

      setFolders(nextFolders);
      setItems(nextItems);
      setTasks(nextTasks);
      setSelectedFolderId((current) => (nextFolders.some((folder) => folder.id === current) ? current : nextFolders[0]?.id ?? ""));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : tr ? "Calisma listeleri yuklenemedi." : "Study lists could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [tr]);

  useEffect(() => {
    void loadBoard();
  }, [loadBoard]);

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) ?? null,
    [folders, selectedFolderId]
  );

  const selectedItems = useMemo(
    () => items.filter((item) => item.folderId === selectedFolderId),
    [items, selectedFolderId]
  );

  const selectedTasks = useMemo(
    () => tasks.filter((task) => task.folderId === selectedFolderId).sort(sortTasks),
    [tasks, selectedFolderId]
  );

  async function createFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/study-lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create-folder", name })
      });
      const payload = (await response.json()) as { folder?: StudyListFolder; error?: string };
      if (!response.ok || !payload.folder) {
        throw new Error(payload.error ?? "Folder could not be created.");
      }
      const next = [payload.folder, ...folders];
      setFolders(next);
      setSelectedFolderId(payload.folder.id);
      setNewFolderName("");
      setMessage(tr ? "Klasor olusturuldu." : "Folder created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : tr ? "Klasor olusturulamadi." : "Folder could not be created.");
    } finally {
      setSaving(false);
    }
  }

  async function removeFolder(folderId: string) {
    setSaving(true);
    setMessage("");
    try {
      await fetch(`/api/study-lists/folders/${folderId}`, { method: "DELETE" });
      const nextFolders = folders.filter((folder) => folder.id !== folderId);
      setFolders(nextFolders);
      setItems((current) => current.filter((item) => item.folderId !== folderId));
      setTasks((current) => current.filter((task) => task.folderId !== folderId));
      setSelectedFolderId((current) => (current === folderId ? nextFolders[0]?.id ?? "" : current));
      setMessage(tr ? "Klasor silindi." : "Folder deleted.");
    } catch {
      setMessage(tr ? "Klasor silinemedi." : "Folder could not be deleted.");
    } finally {
      setSaving(false);
    }
  }

  async function createTask() {
    if (!selectedFolderId || !newTaskTitle.trim()) return;
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/study-lists/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folderId: selectedFolderId,
          title: newTaskTitle,
          note: newTaskNote,
          dueAt: newTaskDueDate ? new Date(`${newTaskDueDate}T12:00:00`).toISOString() : null
        })
      });
      const payload = (await response.json()) as { task?: StudyListTask; error?: string };
      if (!response.ok || !payload.task) {
        throw new Error(payload.error ?? "Task could not be saved.");
      }
      setTasks((current) => [payload.task!, ...current]);
      setNewTaskTitle("");
      setNewTaskNote("");
      setNewTaskDueDate("");
      setMessage(
        tr
          ? "Gorev kaydedildi. Deadline ilerledikce otomatik bildirim ve mail alacaksin."
          : "Task saved. You will get automatic notifications and reminder emails as the deadline progresses."
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : tr ? "Gorev kaydedilemedi." : "Task could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTask(task: StudyListTask) {
    setSaving(true);
    try {
      const response = await fetch(`/api/study-lists/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completedAt: task.completedAt ? null : new Date().toISOString()
        })
      });
      const payload = (await response.json()) as { task?: StudyListTask };
      if (!response.ok || !payload.task) throw new Error("Update failed");
      setTasks((current) => current.map((item) => (item.id === task.id ? payload.task! : item)));
    } catch {
      setMessage(tr ? "Gorev guncellenemedi." : "Task could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  async function removeTask(taskId: string) {
    setSaving(true);
    try {
      await fetch(`/api/study-lists/tasks/${taskId}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch {
      setMessage(tr ? "Gorev silinemedi." : "Task could not be deleted.");
    } finally {
      setSaving(false);
    }
  }

  async function updateTaskDueDate(task: StudyListTask, value: string) {
    setSaving(true);
    try {
      const response = await fetch(`/api/study-lists/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dueAt: value ? new Date(`${value}T12:00:00`).toISOString() : null
        })
      });
      const payload = (await response.json()) as { task?: StudyListTask };
      if (!response.ok || !payload.task) throw new Error("Update failed");
      setTasks((current) => current.map((item) => (item.id === task.id ? payload.task! : item)));
    } catch {
      setMessage(tr ? "Bitiş tarihi guncellenemedi." : "End date could not be updated.");
    } finally {
      setSaving(false);
    }
  }

  async function removeItem(itemId: string) {
    try {
      await fetch(`/api/study-lists/items/${itemId}`, { method: "DELETE" });
      setItems((current) => current.filter((item) => item.id !== itemId));
    } catch {
      setMessage(tr ? "Kayitli prompt kaldirilamadi." : "Saved prompt could not be removed.");
    }
  }

  return (
    <main className="page-shell section" style={{ display: "grid", gap: "1rem" }}>
      <section className="card" style={{ padding: "1.5rem", display: "grid", gap: "1rem" }}>
        <span className="eyebrow">{tr ? "Çalışma listeleri" : "Study lists"}</span>
        <h1 style={{ margin: 0 }}>{tr ? "Görevli çalışma klasörlerin" : "Your study folders with tasks"}</h1>
        <p style={{ color: "var(--muted)", maxWidth: 760, lineHeight: 1.7 }}>
          {tr
            ? "Kaydettiğin promptlari klasorlerde topla, her klasore gorevler ekle, bitis tarihi belirle ve sure ilerledikce otomatik mail + bildirim al."
            : "Group saved prompts into folders, add tasks to each folder, set end dates, and get automatic email + in-app reminders as time moves forward."}
        </p>
        {message ? (
          <div className="card" style={{ padding: "0.9rem 1rem", background: "rgba(29,111,117,0.08)", color: "var(--ink)" }}>
            {message}
          </div>
        ) : null}
      </section>

      <section className="grid study-lists-shell" style={{ gridTemplateColumns: "minmax(300px, 0.9fr) minmax(360px, 1.1fr)", gap: "1rem", alignItems: "start" }}>
        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "0.9rem" }}>
          <strong>{tr ? "Yeni klasör" : "New folder"}</strong>
          <input
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            placeholder={tr ? "Ornek: Bu haftanin TOEFL planı" : "Example: This week's TOEFL plan"}
            style={{ padding: "0.9rem", borderRadius: 14, border: "1px solid var(--line)" }}
          />
          <button type="button" className="button button-primary" onClick={createFolder} disabled={saving}>
            {tr ? "Klasor olustur" : "Create folder"}
          </button>
          <div style={{ display: "grid", gap: "0.7rem" }}>
            {loading ? (
              <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
                {tr ? "Yukleniyor..." : "Loading..."}
              </div>
            ) : folders.length ? (
              folders.map((folder) => {
                const folderTasks = tasks.filter((task) => task.folderId === folder.id);
                const openState = selectedFolderId === folder.id;
                return (
                  <div
                    key={folder.id}
                    className="card"
                    style={{
                      padding: "0.95rem",
                      background: openState ? "rgba(29,111,117,0.08)" : "var(--surface-strong)",
                      display: "grid",
                      gap: "0.6rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.8rem", alignItems: "center" }}>
                      <strong>{folder.name}</strong>
                      <span className="pill">{folderTasks.length} {tr ? "gorev" : "tasks"}</span>
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "0.95rem" }}>
                      {openState
                        ? tr
                          ? "Bu klasor acik. Sag tarafta promptlari ve gorevlerini yonetebilirsin."
                          : "This folder is open. Manage prompts and tasks on the right."
                        : tr
                          ? "Gorev panelini acmak icin bu klasoru sec."
                          : "Select this folder to open its task panel."}
                    </div>
                    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                      <button type="button" className="button button-secondary" onClick={() => setSelectedFolderId(folder.id)}>
                        {openState ? (tr ? "Acik" : "Opened") : tr ? "Ac" : "Open"}
                      </button>
                      <button type="button" className="button button-secondary" onClick={() => removeFolder(folder.id)}>
                        {tr ? "Sil" : "Delete"}
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
                {tr ? "Henüz klasör yok." : "No folders yet."}
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: "1.2rem", display: "grid", gap: "1rem" }}>
          {selectedFolder ? (
            <>
              <div style={{ display: "grid", gap: "0.45rem" }}>
                <strong style={{ fontSize: "1.1rem" }}>{selectedFolder.name}</strong>
                <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
                  {tr
                    ? "Bu klasorun icine prompt kaydet, yanina gorevler ekle, deadline belirle. Sistem %25, %50, %75 ve deadline noktasinda seni otomatik uyarir."
                    : "Save prompts into this folder, add tasks beside them, and set a deadline. The system will automatically remind you at 25%, 50%, 75%, and at the deadline."}
                </p>
              </div>

              <div className="grid" style={{ gap: "0.8rem", gridTemplateColumns: "1.2fr 1fr" }}>
                <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.75rem" }}>
                  <strong>{tr ? "Yeni görev ekle" : "Add a new task"}</strong>
                  <input
                    value={newTaskTitle}
                    onChange={(event) => setNewTaskTitle(event.target.value)}
                    placeholder={tr ? "Ornek: 3 cue card cevabı kaydet" : "Example: Record 3 cue-card answers"}
                    style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)" }}
                  />
                  <textarea
                    value={newTaskNote}
                    onChange={(event) => setNewTaskNote(event.target.value)}
                    placeholder={tr ? "Kisa not: bu gorevde neyi hedefliyorsun?" : "Short note: what do you want to improve in this task?"}
                    rows={4}
                    style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)", resize: "vertical" }}
                  />
                  <div style={{ display: "grid", gap: "0.35rem" }}>
                    <label style={{ fontWeight: 600 }}>{tr ? "Bitiş tarihi" : "End date"}</label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(event) => setNewTaskDueDate(event.target.value)}
                      style={{ padding: "0.85rem", borderRadius: 14, border: "1px solid var(--line)" }}
                    />
                  </div>
                  <button type="button" className="button button-primary" onClick={createTask} disabled={saving || !newTaskTitle.trim()}>
                    {tr ? "Görevi kaydet" : "Save task"}
                  </button>
                </div>

                <div className="card" style={{ padding: "1rem", background: "rgba(29,111,117,0.08)", display: "grid", gap: "0.65rem" }}>
                  <strong>{tr ? "Otomatik hatırlatıcılar" : "Automatic reminders"}</strong>
                  <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.7 }}>
                    {tr
                      ? "Deadline tanımladığında süre diliminin %25, %50, %75 ve %100 noktalarında hem çan bildirimi hem mail gönderilir."
                      : "Once a deadline is set, bell notifications and emails are sent at 25%, 50%, 75%, and 100% of the task timeline."}
                  </p>
                </div>
              </div>

              <div className="grid" style={{ gap: "0.9rem", gridTemplateColumns: "1fr 1fr", alignItems: "start" }}>
                <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.75rem" }}>
                  <strong>{tr ? "Kaydedilen promptlar" : "Saved prompts"}</strong>
                  {selectedItems.length ? (
                    selectedItems.map((item) => (
                      <div key={item.id} className="card" style={{ padding: "0.9rem", background: "rgba(255,255,255,0.7)", display: "grid", gap: "0.55rem" }}>
                        <strong>{item.title}</strong>
                        <div className="practice-meta">{item.examType} · {humanizeTaskType(item.taskType, tr)}</div>
                        <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
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
                    ))
                  ) : (
                    <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.7)" }}>
                      {tr ? "Bu klasörde henüz kayıtlı prompt yok." : "There are no saved prompts in this folder yet."}
                    </div>
                  )}
                </div>

                <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)", display: "grid", gap: "0.75rem" }}>
                  <strong>{tr ? "Görev paneli" : "Task panel"}</strong>
                  {selectedTasks.length ? (
                    selectedTasks.map((task) => {
                      const timing = describeTaskTiming(task, tr);
                      return (
                        <div key={task.id} className="card" style={{ padding: "0.9rem", background: "rgba(255,255,255,0.7)", display: "grid", gap: "0.55rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "0.7rem", alignItems: "center", flexWrap: "wrap" }}>
                            <strong>{task.title}</strong>
                            <span className="pill">{task.completedAt ? (tr ? "Tamamlandi" : "Completed") : tr ? "Aktif" : "Active"}</span>
                          </div>
                          {task.note ? <div style={{ color: "var(--muted)" }}>{task.note}</div> : null}
                          <div style={{ color: "var(--muted)" }}>{timing}</div>
                          {!task.completedAt ? (
                            <div style={{ display: "grid", gap: "0.35rem" }}>
                              <label style={{ fontWeight: 600, fontSize: "0.95rem" }}>{tr ? "Bitiş tarihi" : "End date"}</label>
                              <input
                                type="date"
                                defaultValue={task.dueAt ? task.dueAt.slice(0, 10) : ""}
                                onBlur={(event) => {
                                  if ((task.dueAt ? task.dueAt.slice(0, 10) : "") !== event.currentTarget.value) {
                                    void updateTaskDueDate(task, event.currentTarget.value);
                                  }
                                }}
                                style={{ padding: "0.7rem 0.85rem", borderRadius: 12, border: "1px solid var(--line)" }}
                              />
                            </div>
                          ) : null}
                          <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
                            <button type="button" className="button button-secondary" onClick={() => toggleTask(task)}>
                              {task.completedAt ? (tr ? "Aktif yap" : "Mark active") : tr ? "Tamamlandı yap" : "Mark complete"}
                            </button>
                            <button type="button" className="button button-secondary" onClick={() => removeTask(task.id)}>
                              {tr ? "Sil" : "Delete"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="card" style={{ padding: "1rem", background: "rgba(255,255,255,0.7)" }}>
                      {tr ? "Bu klasörde henüz görev yok. Yukarıdan sırayla görev ekleyebilirsin." : "There are no tasks in this folder yet. Add tasks above one by one."}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ padding: "1rem", background: "var(--surface-strong)" }}>
              {tr ? "Sağ tarafta görev panelini açmak için soldan bir klasör seç." : "Select a folder on the left to open its task panel here."}
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

function sortTasks(a: StudyListTask, b: StudyListTask) {
  if (a.completedAt && !b.completedAt) return 1;
  if (!a.completedAt && b.completedAt) return -1;
  const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
  const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.MAX_SAFE_INTEGER;
  if (aDue !== bDue) return aDue - bDue;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function describeTaskTiming(task: StudyListTask, tr: boolean) {
  if (task.completedAt) {
    return tr ? "Bu gorev tamamlandi." : "This task is completed.";
  }
  if (!task.dueAt) {
    return tr ? "Henüz bitiş tarihi yok." : "No end date set yet.";
  }

  const dueAt = new Date(task.dueAt);
  const createdAt = new Date(task.createdAt);
  const totalMs = Math.max(dueAt.getTime() - createdAt.getTime(), 1);
  const elapsedPercent = Math.min(100, Math.max(0, Math.round(((Date.now() - createdAt.getTime()) / totalMs) * 100)));
  const remainingMs = dueAt.getTime() - Date.now();
  const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));

  if (remainingMs < 0) {
    return tr
      ? `Süre doldu. Hatırlatıcılar %25 / %50 / %75 / deadline noktalarında gönderildi.`
      : `The deadline has passed. Reminders were sent at 25% / 50% / 75% / deadline milestones.`;
  }

  return tr
    ? `${remainingDays} gün kaldı. Sürenin yaklaşık %${elapsedPercent}'i geçti.`
    : `${remainingDays} day(s) left. Around ${elapsedPercent}% of the timeline has passed.`;
}

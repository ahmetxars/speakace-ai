import { Difficulty, ExamType, StudyListFolder, StudyListItem, StudyListTask, StudyTaskReminder, TaskType } from "@/lib/types";
import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { sendStudyTaskReminderEmail } from "@/lib/server/email";
import { getMember } from "@/lib/store";

type MemoryStudyStore = {
  folders: Map<string, StudyListFolder & { userId: string }>;
  items: Map<string, StudyListItem & { userId: string }>;
  tasks: Map<string, StudyListTask & { userId: string }>;
  reminders: Map<string, StudyTaskReminder>;
};

function getMemoryStudyStore(): MemoryStudyStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceStudyStore?: MemoryStudyStore };
  if (!globalStore.__speakAceStudyStore) {
    globalStore.__speakAceStudyStore = {
      folders: new Map(),
      items: new Map(),
      tasks: new Map(),
      reminders: new Map()
    };
  }

  return globalStore.__speakAceStudyStore;
}

export async function listStudyListData(userId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const [folders, items, tasks] = await Promise.all([
      sql<{ id: string; name: string; created_at: string | Date }[]>`
        select id, name, created_at
        from study_list_folders
        where user_id = ${userId}
        order by created_at desc
      `,
      sql<{
        id: string;
        folder_id: string;
        prompt_id: string;
        exam_type: ExamType;
        task_type: TaskType;
        difficulty: Difficulty;
        title: string;
        created_at: string | Date;
      }[]>`
        select id, folder_id, prompt_id, exam_type, task_type, difficulty, title, created_at
        from study_list_items
        where user_id = ${userId}
        order by created_at desc
      `,
      sql<{
        id: string;
        folder_id: string;
        title: string;
        note: string | null;
        due_at: string | Date | null;
        completed_at: string | Date | null;
        created_at: string | Date;
      }[]>`
        select id, folder_id, title, note, due_at, completed_at, created_at
        from study_list_tasks
        where user_id = ${userId}
        order by created_at desc
      `
    ]);

    return {
      folders: folders.map((folder) => ({
        id: folder.id,
        name: folder.name,
        createdAt: new Date(folder.created_at).toISOString()
      })),
      items: items.map((item) => ({
        id: item.id,
        folderId: item.folder_id,
        promptId: item.prompt_id,
        examType: item.exam_type,
        taskType: item.task_type,
        difficulty: item.difficulty,
        title: item.title,
        createdAt: new Date(item.created_at).toISOString()
      })),
      tasks: tasks.map((task) => ({
        id: task.id,
        folderId: task.folder_id,
        title: task.title,
        note: task.note ?? "",
        dueAt: task.due_at ? new Date(task.due_at).toISOString() : undefined,
        completedAt: task.completed_at ? new Date(task.completed_at).toISOString() : undefined,
        createdAt: new Date(task.created_at).toISOString()
      }))
    };
  }

  const store = getMemoryStudyStore();
  return {
    folders: Array.from(store.folders.values())
      .filter((folder) => folder.userId === userId)
      .map(stripFolder)
      .sort(sortByCreatedAtDesc),
    items: Array.from(store.items.values())
      .filter((item) => item.userId === userId)
      .map(stripItem)
      .sort(sortByCreatedAtDesc),
    tasks: Array.from(store.tasks.values())
      .filter((task) => task.userId === userId)
      .map(stripTask)
      .sort(sortByCreatedAtDesc)
  };
}

export async function createStudyFolder(userId: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Folder name is required.");
  }

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      insert into study_list_folders (id, user_id, name, created_at)
      values (${id}, ${userId}, ${trimmed}, ${createdAt})
    `;
    return { id, name: trimmed, createdAt };
  }

  getMemoryStudyStore().folders.set(id, { id, userId, name: trimmed, createdAt });
  return { id, name: trimmed, createdAt };
}

export async function deleteStudyFolder(userId: string, folderId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      delete from study_list_folders
      where id = ${folderId} and user_id = ${userId}
    `;
    return;
  }

  const store = getMemoryStudyStore();
  store.folders.delete(folderId);
  for (const [itemId, item] of store.items.entries()) {
    if (item.userId === userId && item.folderId === folderId) {
      store.items.delete(itemId);
    }
  }
  for (const [taskId, task] of store.tasks.entries()) {
    if (task.userId === userId && task.folderId === folderId) {
      store.tasks.delete(taskId);
    }
  }
}

export async function createStudyTask(
  userId: string,
  input: { folderId: string; title: string; note?: string; dueAt?: string | null }
) {
  const title = input.title.trim();
  if (!title) {
    throw new Error("Task title is required.");
  }

  const task: StudyListTask = {
    id: crypto.randomUUID(),
    folderId: input.folderId,
    title,
    note: input.note?.trim() ?? "",
    dueAt: input.dueAt ? new Date(input.dueAt).toISOString() : undefined,
    createdAt: new Date().toISOString()
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      insert into study_list_tasks (id, folder_id, user_id, title, note, due_at, created_at)
      values (${task.id}, ${task.folderId}, ${userId}, ${task.title}, ${task.note ?? null}, ${task.dueAt ?? null}, ${task.createdAt})
    `;
    return task;
  }

  getMemoryStudyStore().tasks.set(task.id, { ...task, userId });
  return task;
}

export async function updateStudyTask(
  userId: string,
  taskId: string,
  patch: { title?: string; note?: string; dueAt?: string | null; completedAt?: string | null }
) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const title = patch.title?.trim();
    await sql`
      update study_list_tasks
      set
        title = coalesce(${title ?? null}, title),
        note = coalesce(${patch.note ?? null}, note),
        due_at = case
          when ${patch.dueAt === undefined} then due_at
          else ${patch.dueAt ? new Date(patch.dueAt).toISOString() : null}
        end,
        completed_at = case
          when ${patch.completedAt === undefined} then completed_at
          else ${patch.completedAt ? new Date(patch.completedAt).toISOString() : null}
        end
      where id = ${taskId} and user_id = ${userId}
    `;
    const [task] = await sql<{
      id: string;
      folder_id: string;
      title: string;
      note: string | null;
      due_at: string | Date | null;
      completed_at: string | Date | null;
      created_at: string | Date;
    }[]>`
      select id, folder_id, title, note, due_at, completed_at, created_at
      from study_list_tasks
      where id = ${taskId} and user_id = ${userId}
      limit 1
    `;
    if (!task) throw new Error("Task not found.");
    return {
      id: task.id,
      folderId: task.folder_id,
      title: task.title,
      note: task.note ?? "",
      dueAt: task.due_at ? new Date(task.due_at).toISOString() : undefined,
      completedAt: task.completed_at ? new Date(task.completed_at).toISOString() : undefined,
      createdAt: new Date(task.created_at).toISOString()
    } satisfies StudyListTask;
  }

  const store = getMemoryStudyStore();
  const current = store.tasks.get(taskId);
  if (!current || current.userId !== userId) {
    throw new Error("Task not found.");
  }

  const next = {
    ...current,
    ...(patch.title !== undefined ? { title: patch.title.trim() || current.title } : {}),
    ...(patch.note !== undefined ? { note: patch.note } : {}),
    ...(patch.dueAt !== undefined ? { dueAt: patch.dueAt ? new Date(patch.dueAt).toISOString() : undefined } : {}),
    ...(patch.completedAt !== undefined ? { completedAt: patch.completedAt ? new Date(patch.completedAt).toISOString() : undefined } : {})
  };
  store.tasks.set(taskId, next);
  return stripTask(next);
}

export async function deleteStudyTask(userId: string, taskId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      delete from study_list_tasks
      where id = ${taskId} and user_id = ${userId}
    `;
    return;
  }

  const store = getMemoryStudyStore();
  const current = store.tasks.get(taskId);
  if (current?.userId === userId) {
    store.tasks.delete(taskId);
  }
}

export async function addStudyListItem(
  userId: string,
  input: {
    folderId: string;
    promptId: string;
    examType: ExamType;
    taskType: TaskType;
    difficulty: Difficulty;
    title: string;
  }
) {
  const item: StudyListItem = {
    id: crypto.randomUUID(),
    folderId: input.folderId,
    promptId: input.promptId,
    examType: input.examType,
    taskType: input.taskType,
    difficulty: input.difficulty,
    title: input.title,
    createdAt: new Date().toISOString()
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      delete from study_list_items
      where user_id = ${userId} and prompt_id = ${input.promptId}
    `;
    await sql`
      insert into study_list_items (id, folder_id, user_id, prompt_id, exam_type, task_type, difficulty, title, created_at)
      values (${item.id}, ${item.folderId}, ${userId}, ${item.promptId}, ${item.examType}, ${item.taskType}, ${item.difficulty}, ${item.title}, ${item.createdAt})
    `;
    return item;
  }

  const store = getMemoryStudyStore();
  for (const [existingId, existingItem] of store.items.entries()) {
    if (existingItem.userId === userId && existingItem.promptId === input.promptId) {
      store.items.delete(existingId);
    }
  }
  store.items.set(item.id, { ...item, userId });
  return item;
}

export async function removeStudyListItem(userId: string, itemId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      delete from study_list_items
      where id = ${itemId} and user_id = ${userId}
    `;
    return;
  }

  const store = getMemoryStudyStore();
  const current = store.items.get(itemId);
  if (current?.userId === userId) {
    store.items.delete(itemId);
  }
}

export async function importStudyListData(
  userId: string,
  input: { folders: StudyListFolder[]; items: StudyListItem[] }
) {
  if (!input.folders.length && !input.items.length) return;

  if (hasDatabaseUrl()) {
    const sql = getSql();
    for (const folder of input.folders) {
      await sql`
        insert into study_list_folders (id, user_id, name, created_at)
        values (${folder.id}, ${userId}, ${folder.name}, ${folder.createdAt})
        on conflict (id) do nothing
      `;
    }
    for (const item of input.items) {
      await sql`
        insert into study_list_items (id, folder_id, user_id, prompt_id, exam_type, task_type, difficulty, title, created_at)
        values (${item.id}, ${item.folderId}, ${userId}, ${item.promptId}, ${item.examType}, ${item.taskType}, ${item.difficulty}, ${item.title}, ${item.createdAt})
        on conflict (id) do nothing
      `;
    }
    return;
  }

  const store = getMemoryStudyStore();
  input.folders.forEach((folder) => store.folders.set(folder.id, { ...folder, userId }));
  input.items.forEach((item) => store.items.set(item.id, { ...item, userId }));
}

export async function listStudyTaskRemindersForUser(userId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<{
      id: string;
      task_id: string;
      user_id: string;
      milestone_percent: number;
      title: string;
      body: string;
      href: string | null;
      email_sent_at: string | Date | null;
      created_at: string | Date;
    }[]>`
      select id, task_id, user_id, milestone_percent, title, body, href, email_sent_at, created_at
      from study_task_reminders
      where user_id = ${userId}
      order by created_at desc
    `;
    return rows.map(mapReminderRow);
  }

  return Array.from(getMemoryStudyStore().reminders.values())
    .filter((item) => item.userId === userId)
    .sort(sortByCreatedAtDesc);
}

export async function processStudyTaskReminders(now = new Date()) {
  const activeTasks = await listReminderCandidates();
  const created: StudyTaskReminder[] = [];

  for (const candidate of activeTasks) {
    const dueAt = candidate.dueAt ? new Date(candidate.dueAt) : null;
    if (!dueAt) continue;

    const createdAt = new Date(candidate.createdAt);
    const totalMs = Math.max(dueAt.getTime() - createdAt.getTime(), 1);
    const elapsedPercent = Math.min(100, Math.max(0, ((now.getTime() - createdAt.getTime()) / totalMs) * 100));

    for (const milestone of [25, 50, 75, 100]) {
      if (elapsedPercent < milestone) {
        continue;
      }

      const exists = await hasReminder(candidate.id, milestone);
      if (exists) continue;

      const reminder = await createReminderRecord(candidate, milestone, now);
      created.push(reminder);
      await sendReminderEmail(candidate, reminder).catch(() => undefined);
    }
  }

  return created;
}

type ReminderCandidate = StudyListTask & { userId: string; userEmail: string; userName: string; folderName: string };

async function listReminderCandidates(): Promise<ReminderCandidate[]> {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<{
      id: string;
      folder_id: string;
      title: string;
      note: string | null;
      due_at: string | Date | null;
      completed_at: string | Date | null;
      created_at: string | Date;
      user_id: string;
      email: string;
      name: string;
      folder_name: string;
    }[]>`
      select
        tasks.id,
        tasks.folder_id,
        tasks.title,
        tasks.note,
        tasks.due_at,
        tasks.completed_at,
        tasks.created_at,
        tasks.user_id,
        users.email,
        users.name,
        folders.name as folder_name
      from study_list_tasks tasks
      inner join users on users.id = tasks.user_id
      inner join study_list_folders folders on folders.id = tasks.folder_id
      where tasks.completed_at is null and tasks.due_at is not null
    `;
    return rows.map((row) => ({
      id: row.id,
      folderId: row.folder_id,
      title: row.title,
      note: row.note ?? "",
      dueAt: row.due_at ? new Date(row.due_at).toISOString() : undefined,
      completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      createdAt: new Date(row.created_at).toISOString(),
      userId: row.user_id,
      userEmail: row.email,
      userName: row.name,
      folderName: row.folder_name
    }));
  }

  const store = getMemoryStudyStore();
  const candidates: ReminderCandidate[] = [];
  for (const task of store.tasks.values()) {
    if (task.completedAt || !task.dueAt) continue;
    const member = await getMember(task.userId);
    const folder = store.folders.get(task.folderId);
    if (!member || !folder) continue;
    candidates.push({
      ...stripTask(task),
      userId: task.userId,
      userEmail: member.email,
      userName: member.name,
      folderName: folder.name
    });
  }
  return candidates;
}

async function hasReminder(taskId: string, milestonePercent: number) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<{ id: string }[]>`
      select id
      from study_task_reminders
      where task_id = ${taskId} and milestone_percent = ${milestonePercent}
      limit 1
    `;
    return Boolean(rows[0]);
  }

  return Array.from(getMemoryStudyStore().reminders.values()).some(
    (item) => item.taskId === taskId && item.milestonePercent === milestonePercent
  );
}

async function createReminderRecord(candidate: ReminderCandidate, milestonePercent: number, createdAt: Date) {
  const remainingPercent = Math.max(0, 100 - milestonePercent);
  const dueLabel = candidate.dueAt ? formatDueLabel(new Date(candidate.dueAt)) : "";
  const reminder: StudyTaskReminder = {
    id: crypto.randomUUID(),
    taskId: candidate.id,
    userId: candidate.userId,
    milestonePercent,
    title:
      milestonePercent >= 100
        ? `Study task deadline reached`
        : `${remainingPercent}% of your task time is left`,
    body:
      milestonePercent >= 100
        ? `"${candidate.title}" reached its deadline${dueLabel ? ` (${dueLabel})` : ""}.`
        : `"${candidate.title}" in ${candidate.folderName} is now ${milestonePercent}% through its timeline${dueLabel ? ` and ends ${dueLabel}` : ""}.`,
    href: "/app/study-lists",
    createdAt: createdAt.toISOString(),
    emailSentAt: null
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      insert into study_task_reminders (id, task_id, user_id, milestone_percent, title, body, href, created_at)
      values (${reminder.id}, ${reminder.taskId}, ${reminder.userId}, ${reminder.milestonePercent}, ${reminder.title}, ${reminder.body}, ${reminder.href ?? null}, ${reminder.createdAt})
    `;
    return reminder;
  }

  getMemoryStudyStore().reminders.set(reminder.id, reminder);
  return reminder;
}

async function sendReminderEmail(candidate: ReminderCandidate, reminder: StudyTaskReminder) {
  const result = await sendStudyTaskReminderEmail({
    to: candidate.userEmail,
    name: candidate.userName,
    taskTitle: candidate.title,
    folderName: candidate.folderName,
    dueAt: candidate.dueAt,
    milestonePercent: reminder.milestonePercent
  });
  if (!result.ok) return;

  if (hasDatabaseUrl()) {
    const sql = getSql();
    await sql`
      update study_task_reminders
      set email_sent_at = now()
      where id = ${reminder.id}
    `;
    return;
  }

  const current = getMemoryStudyStore().reminders.get(reminder.id);
  if (current) {
    getMemoryStudyStore().reminders.set(reminder.id, { ...current, emailSentAt: new Date().toISOString() });
  }
}

function mapReminderRow(row: {
  id: string;
  task_id: string;
  user_id: string;
  milestone_percent: number;
  title: string;
  body: string;
  href: string | null;
  email_sent_at: string | Date | null;
  created_at: string | Date;
}): StudyTaskReminder {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    milestonePercent: row.milestone_percent,
    title: row.title,
    body: row.body,
    href: row.href ?? undefined,
    emailSentAt: row.email_sent_at ? new Date(row.email_sent_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString()
  };
}

function formatDueLabel(dueAt: Date) {
  return dueAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });
}

function stripFolder(folder: StudyListFolder & { userId?: string }): StudyListFolder {
  return {
    id: folder.id,
    name: folder.name,
    createdAt: folder.createdAt
  };
}

function stripItem(item: StudyListItem & { userId?: string }): StudyListItem {
  return {
    id: item.id,
    folderId: item.folderId,
    promptId: item.promptId,
    examType: item.examType,
    taskType: item.taskType,
    difficulty: item.difficulty,
    title: item.title,
    createdAt: item.createdAt
  };
}

function stripTask(task: StudyListTask & { userId?: string }): StudyListTask {
  return {
    id: task.id,
    folderId: task.folderId,
    title: task.title,
    note: task.note ?? "",
    dueAt: task.dueAt,
    completedAt: task.completedAt,
    createdAt: task.createdAt
  };
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(a: T, b: T) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

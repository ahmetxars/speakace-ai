import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { SharedClassStudyItem } from "@/lib/types";

type MemorySharedStudyStore = {
  items: Map<string, SharedClassStudyItem>;
};

function getStore(): MemorySharedStudyStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceSharedStudy?: MemorySharedStudyStore };
  if (!globalStore.__speakAceSharedStudy) {
    globalStore.__speakAceSharedStudy = { items: new Map() };
  }
  return globalStore.__speakAceSharedStudy;
}

export async function listClassSharedStudyItems(classId: string) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    return sql<SharedClassStudyItem[]>`
      select
        id,
        class_id as "classId",
        teacher_id as "teacherId",
        prompt_id as "promptId",
        exam_type as "examType",
        task_type as "taskType",
        difficulty,
        title,
        note,
        created_at as "createdAt"
      from class_shared_study_items
      where class_id = ${classId}
      order by created_at desc
    `;
  }

  return [...getStore().items.values()]
    .filter((item) => item.classId === classId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createClassSharedStudyItem(input: Omit<SharedClassStudyItem, "id" | "createdAt">) {
  const next: SharedClassStudyItem = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date().toISOString()
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<SharedClassStudyItem[]>`
      insert into class_shared_study_items (
        id, class_id, teacher_id, prompt_id, exam_type, task_type, difficulty, title, note, created_at
      ) values (
        ${next.id}, ${next.classId}, ${next.teacherId}, ${next.promptId}, ${next.examType}, ${next.taskType}, ${next.difficulty},
        ${next.title}, ${next.note ?? null}, ${next.createdAt}
      )
      returning
        id,
        class_id as "classId",
        teacher_id as "teacherId",
        prompt_id as "promptId",
        exam_type as "examType",
        task_type as "taskType",
        difficulty,
        title,
        note,
        created_at as "createdAt"
    `;
    return rows[0];
  }

  getStore().items.set(next.id, next);
  return next;
}

export async function removeClassSharedStudyItem(input: { teacherId: string; itemId: string }) {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<Array<{ id: string }>>`
      delete from class_shared_study_items
      where id = ${input.itemId} and teacher_id = ${input.teacherId}
      returning id
    `;
    return rows.length > 0;
  }

  const current = getStore().items.get(input.itemId);
  if (!current || current.teacherId !== input.teacherId) return false;
  getStore().items.delete(input.itemId);
  return true;
}

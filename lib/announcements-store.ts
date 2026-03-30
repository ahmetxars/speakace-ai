import { getSql, hasDatabaseUrl } from "@/lib/server/db";
import { AnnouncementItem, MemberProfile } from "@/lib/types";
import { listStudentClasses, listTeacherClasses } from "@/lib/classroom-store";

type MemoryAnnouncementStore = {
  items: Map<string, AnnouncementItem>;
};

function getStore(): MemoryAnnouncementStore {
  const globalStore = globalThis as typeof globalThis & { __speakAceAnnouncements?: MemoryAnnouncementStore };
  if (!globalStore.__speakAceAnnouncements) {
    globalStore.__speakAceAnnouncements = { items: new Map() };
  }
  return globalStore.__speakAceAnnouncements;
}

export async function createAnnouncement(input: {
  authorId: string;
  audienceType: AnnouncementItem["audienceType"];
  classId?: string | null;
  title: string;
  body: string;
}) {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) {
    throw new Error("Announcement title and body are required.");
  }
  const item: AnnouncementItem = {
    id: crypto.randomUUID(),
    authorId: input.authorId,
    audienceType: input.audienceType,
    classId: input.classId ?? null,
    title,
    body,
    createdAt: new Date().toISOString()
  };

  if (hasDatabaseUrl()) {
    const sql = getSql();
    const rows = await sql<AnnouncementItem[]>`
      insert into announcements (id, author_id, audience_type, class_id, title, body, created_at)
      values (${item.id}, ${item.authorId}, ${item.audienceType}, ${item.classId ?? null}, ${item.title}, ${item.body}, ${item.createdAt})
      returning
        id,
        author_id as "authorId",
        audience_type as "audienceType",
        class_id as "classId",
        title,
        body,
        created_at as "createdAt"
    `;
    return rows[0];
  }

  getStore().items.set(item.id, item);
  return item;
}

export async function listAnnouncementsForUser(profile: MemberProfile): Promise<AnnouncementItem[]> {
  if (hasDatabaseUrl()) {
    const sql = getSql();
    const canSeeTeacherAnnouncements = Boolean(profile.isTeacher || profile.teacherAccess);
    const classIds = profile.isTeacher || profile.teacherAccess
      ? (await listTeacherClasses(profile.id)).map((item) => item.id)
      : (await listStudentClasses(profile.id)).map((item) => item.classId);

    if (profile.isAdmin || profile.adminAccess) {
      const rows = (await sql`
        select
          id,
          author_id as "authorId",
          audience_type as "audienceType",
          class_id as "classId",
          title,
          body,
          created_at as "createdAt"
        from announcements
        order by created_at desc
        limit 40
      `) as unknown as AnnouncementItem[];
      return rows;
    }

    if (!classIds.length) {
      const rows = canSeeTeacherAnnouncements
        ? ((await sql`
            select
              id,
              author_id as "authorId",
              audience_type as "audienceType",
              class_id as "classId",
              title,
              body,
              created_at as "createdAt"
            from announcements
            where audience_type = 'global' or audience_type = 'teacher'
            order by created_at desc
            limit 20
          `) as unknown as AnnouncementItem[])
        : ((await sql`
            select
              id,
              author_id as "authorId",
              audience_type as "audienceType",
              class_id as "classId",
              title,
              body,
              created_at as "createdAt"
            from announcements
            where audience_type = 'global'
            order by created_at desc
            limit 20
          `) as unknown as AnnouncementItem[]);
      return rows;
    }

    const rows = canSeeTeacherAnnouncements
      ? ((await sql`
          select
            id,
            author_id as "authorId",
            audience_type as "audienceType",
            class_id as "classId",
            title,
            body,
            created_at as "createdAt"
          from announcements
          where audience_type = 'global' or audience_type = 'teacher' or class_id = any(${classIds})
          order by created_at desc
          limit 20
        `) as unknown as AnnouncementItem[])
      : ((await sql`
          select
            id,
            author_id as "authorId",
            audience_type as "audienceType",
            class_id as "classId",
            title,
            body,
            created_at as "createdAt"
          from announcements
          where audience_type = 'global' or class_id = any(${classIds})
          order by created_at desc
          limit 20
        `) as unknown as AnnouncementItem[]);
    return rows;
  }

  const classIds = profile.isTeacher || profile.teacherAccess
    ? (await listTeacherClasses(profile.id)).map((item) => item.id)
    : (await listStudentClasses(profile.id)).map((item) => item.classId);

  return [...getStore().items.values()]
    .filter((item) => {
      if (profile.isAdmin || profile.adminAccess) return true;
      if (item.audienceType === "global") return true;
      if ((profile.isTeacher || profile.teacherAccess) && item.audienceType === "teacher") return true;
      return Boolean(item.classId && classIds.includes(item.classId));
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 20);
}

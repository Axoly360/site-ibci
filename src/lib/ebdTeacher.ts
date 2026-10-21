import { sql } from "@/lib/db";

export const MAX_EBD_TEACHERS = 3;

/**
 * Resolve os professores escolhidos para uma sala: só entram professores
 * ativos, sem repetir, até o máximo de 3. O texto de exibição junta os nomes
 * dos escolhidos com o nome digitado (professor sem cadastro), se houver.
 */
export async function resolveEbdTeachers(
  teacherMemberIds: unknown,
  typedName: string
): Promise<{ memberIds: string[]; displayName: string | null; tooMany: boolean }> {
  const requested = Array.isArray(teacherMemberIds)
    ? Array.from(
        new Set(teacherMemberIds.filter((v): v is string => typeof v === "string" && v !== ""))
      )
    : [];

  if (requested.length > MAX_EBD_TEACHERS) {
    return { memberIds: [], displayName: null, tooMany: true };
  }

  let found: { id: string; name: string }[] = [];
  if (requested.length > 0) {
    found = (await sql`
      select members.id, members.name
      from teacher_profiles
      join members on members.id = teacher_profiles.member_id
      where teacher_profiles.status = 'ativo'
        and teacher_profiles.member_id = any(${requested}::uuid[])
      order by members.name asc
    `) as { id: string; name: string }[];
  }

  const typedNames = typedName
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
  const names = [...found.map((t) => t.name), ...typedNames];

  return {
    memberIds: found.map((t) => t.id),
    displayName: names.length > 0 ? names.join(", ") : null,
    tooMany: names.length > MAX_EBD_TEACHERS,
  };
}

/** Troca a lista de professores da sala pela informada. */
export async function setEbdClassTeachers(classId: string, memberIds: string[]) {
  await sql`delete from ebd_class_teachers where class_id = ${classId}`;
  if (memberIds.length > 0) {
    await sql`
      insert into ebd_class_teachers (class_id, member_id)
      select ${classId}::uuid, unnest(${memberIds}::uuid[])
    `;
  }
}

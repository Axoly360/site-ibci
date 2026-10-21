import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { MAX_EBD_TEACHERS, resolveEbdTeachers, setEbdClassTeachers } from "@/lib/ebdTeacher";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = text(body?.name);
  if (!name) {
    return NextResponse.json({ error: "Nome da sala é obrigatório." }, { status: 400 });
  }

  const teachers = await resolveEbdTeachers(body?.teacherMemberIds, text(body?.teacherName));
  if (teachers.tooMany) {
    return NextResponse.json(
      { error: `Cada sala pode ter até ${MAX_EBD_TEACHERS} professores.` },
      { status: 400 }
    );
  }

  const [created] = await sql`
    insert into ebd_classes (name, teacher_name, audience, meeting_time, location, description)
    values (
      ${name}, ${teachers.displayName}, ${text(body?.audience) || null},
      ${text(body?.meetingTime) || null}, ${text(body?.location) || null},
      ${text(body?.description) || null}
    )
    returning id
  `;
  await setEbdClassTeachers(created.id, teachers.memberIds);
  return NextResponse.json({ ok: true });
}

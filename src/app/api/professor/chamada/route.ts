import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getActiveTeacher } from "@/lib/teacherAccess";

export async function POST(request: NextRequest) {
  const teacher = await getActiveTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const classId = typeof body?.classId === "string" ? body.classId : "";
  const date = typeof body?.date === "string" ? body.date : "";
  const presentIds: string[] = Array.isArray(body?.presentIds)
    ? body.presentIds.filter((v: unknown): v is string => typeof v === "string")
    : [];

  if (!classId || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Informe a sala e a data." }, { status: 400 });
  }

  const [room] = await sql`
    select c.id from ebd_classes c
    join ebd_class_teachers t on t.class_id = c.id
    where c.id = ${classId} and t.member_id = ${teacher.memberId}
  `;
  if (!room) {
    return NextResponse.json({ error: "Esta sala não é sua." }, { status: 403 });
  }

  const [future] = await sql`select (${date}::date > current_date) as is_future`;
  if (future?.is_future) {
    return NextResponse.json({ error: "Não é possível lançar chamada de data futura." }, { status: 400 });
  }

  const [session] = await sql`
    insert into ebd_sessions (class_id, session_date, recorded_by)
    values (${classId}, ${date}::date, ${teacher.memberId})
    on conflict (class_id, session_date) do update set recorded_by = excluded.recorded_by
    returning id
  `;

  await sql`delete from ebd_attendance where session_id = ${session.id}`;
  if (presentIds.length > 0) {
    await sql`
      insert into ebd_attendance (session_id, enrollment_id)
      select ${session.id}::uuid, id from ebd_enrollments
      where class_id = ${classId}::uuid and id = any(${presentIds}::uuid[])
    `;
  }

  return NextResponse.json({ ok: true });
}

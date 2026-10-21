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
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

  if (!classId || name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: "Informe o nome do aluno." }, { status: 400 });
  }

  const [room] = await sql`
    select c.id from ebd_classes c
    join ebd_class_teachers t on t.class_id = c.id
    where c.id = ${classId} and t.member_id = ${teacher.memberId}
  `;
  if (!room) {
    return NextResponse.json({ error: "Esta sala não é sua." }, { status: 403 });
  }

  const [dup] = await sql`
    select id from ebd_enrollments
    where class_id = ${classId} and lower(guest_name) = lower(${name})
  `;
  if (dup) {
    return NextResponse.json({ error: "Já existe um aluno com esse nome nesta sala." }, { status: 409 });
  }

  await sql`
    insert into ebd_enrollments (class_id, guest_name, guest_phone, added_by)
    values (${classId}, ${name}, ${phone || null}, ${teacher.memberId})
  `;
  return NextResponse.json({ ok: true });
}

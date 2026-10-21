import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { MAX_EBD_TEACHERS, resolveEbdTeachers, setEbdClassTeachers } from "@/lib/ebdTeacher";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  await sql`
    update ebd_classes set
      name = ${name},
      teacher_name = ${teachers.displayName},
      audience = ${text(body?.audience) || null},
      meeting_time = ${text(body?.meetingTime) || null},
      location = ${text(body?.location) || null},
      description = ${text(body?.description) || null}
    where id = ${id}
  `;
  await setEbdClassTeachers(id, teachers.memberIds);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from ebd_classes where id = ${id}`;
  return NextResponse.json({ ok: true });
}

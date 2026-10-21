import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getActiveTeacher } from "@/lib/teacherAccess";

/** O professor só remove alunos avulsos da própria sala; membros e crianças saem pela Secretaria. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const teacher = await getActiveTeacher();
  if (!teacher) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`
    delete from ebd_enrollments
    where id = ${id}
      and guest_name is not null
      and class_id in (select class_id from ebd_class_teachers where member_id = ${teacher.memberId})
  `;
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

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
  const kind = body?.kind;
  const personId = typeof body?.personId === "string" ? body.personId : "";
  if ((kind !== "member" && kind !== "child") || !personId) {
    return NextResponse.json({ error: "Selecione um aluno." }, { status: 400 });
  }

  if (kind === "member") {
    await sql`
      insert into ebd_enrollments (class_id, member_id)
      select ${id}::uuid, members.id from members
      where members.id = ${personId}::uuid and members.is_validated_member = true
      on conflict do nothing
    `;
  } else {
    await sql`
      insert into ebd_enrollments (class_id, child_id)
      select ${id}::uuid, member_children.id from member_children
      where member_children.id = ${personId}::uuid
      on conflict do nothing
    `;
  }

  return NextResponse.json({ ok: true });
}

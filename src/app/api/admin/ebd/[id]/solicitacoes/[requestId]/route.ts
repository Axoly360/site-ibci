import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  const { id, requestId } = await params;
  const session = await getAdminSession();
  if (!session || !hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  if (decision !== "aprovado" && decision !== "recusado") {
    return NextResponse.json({ error: "Decisão inválida." }, { status: 400 });
  }

  const [reqRow] = await sql`
    select class_id, member_id, child_id from ebd_join_requests
    where id = ${requestId} and class_id = ${id} and status = 'pendente'
  `;
  if (!reqRow) {
    return NextResponse.json({ error: "Solicitação não encontrada." }, { status: 404 });
  }

  await sql`
    update ebd_join_requests
    set status = ${decision}, decided_at = now(), decided_by = ${session.id}
    where id = ${requestId}
  `;

  if (decision === "aprovado") {
    if (reqRow.member_id) {
      await sql`
        insert into ebd_enrollments (class_id, member_id)
        values (${reqRow.class_id}, ${reqRow.member_id})
        on conflict do nothing
      `;
    } else if (reqRow.child_id) {
      await sql`
        insert into ebd_enrollments (class_id, child_id)
        values (${reqRow.class_id}, ${reqRow.child_id})
        on conflict do nothing
      `;
    }
  }

  return NextResponse.json({ ok: true });
}

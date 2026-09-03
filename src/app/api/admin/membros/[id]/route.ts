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
  const decision = body?.decision;
  if (decision !== "aprovado" && decision !== "recusado") {
    return NextResponse.json({ error: "Decisão inválida." }, { status: 400 });
  }

  const [req_] = await sql`
    update membership_requests
    set status = ${decision}, decided_at = now(), decided_by = ${session!.id}
    where id = ${id} and status = 'pendente'
    returning member_id
  `;

  if (!req_) {
    return NextResponse.json(
      { error: "Cadastro não encontrado ou já decidido." },
      { status: 404 }
    );
  }

  if (decision === "aprovado") {
    await sql`update members set is_validated_member = true where id = ${req_.member_id}`;
  }

  return NextResponse.json({ ok: true });
}

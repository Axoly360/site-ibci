import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getBoardMemberFor } from "@/lib/orgAccess";

/** Aprova ou recusa um pedido pendente de participação. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
  const { orgId, memberId } = await params;
  if (!(await getBoardMemberFor(orgId))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  if (decision !== "aprovar" && decision !== "recusar") {
    return NextResponse.json({ error: "Decisão inválida." }, { status: 400 });
  }

  if (decision === "aprovar") {
    await sql`
      update organization_members set status = 'ativo', decided_at = now()
      where organization_id = ${orgId} and member_id = ${memberId} and status = 'pendente'
    `;
  } else {
    await sql`
      delete from organization_members
      where organization_id = ${orgId} and member_id = ${memberId} and status = 'pendente'
    `;
  }
  return NextResponse.json({ ok: true });
}

/** Remove um integrante da organização. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string; memberId: string }> }
) {
  const { orgId, memberId } = await params;
  if (!(await getBoardMemberFor(orgId))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from organization_members where organization_id = ${orgId} and member_id = ${memberId}`;
  return NextResponse.json({ ok: true });
}

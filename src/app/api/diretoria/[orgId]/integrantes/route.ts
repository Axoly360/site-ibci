import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getBoardMemberFor } from "@/lib/orgAccess";

/** A diretoria adiciona direto um membro validado como integrante ativo. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  if (!(await getBoardMemberFor(orgId))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const memberId = typeof body?.memberId === "string" ? body.memberId : "";
  if (!memberId) {
    return NextResponse.json({ error: "Escolha um membro." }, { status: 400 });
  }

  const [member] = await sql`
    select 1 as ok from members where id = ${memberId} and is_validated_member = true
  `;
  if (!member) {
    return NextResponse.json({ error: "Escolha um membro com cadastro validado." }, { status: 400 });
  }

  await sql`
    insert into organization_members (organization_id, member_id, status, decided_at)
    values (${orgId}, ${memberId}, 'ativo', now())
    on conflict (organization_id, member_id)
    do update set status = 'ativo', decided_at = now()
  `;
  return NextResponse.json({ ok: true });
}

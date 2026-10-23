import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

async function validatedMemberId() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) };
  const [member] = await sql`select is_validated_member from members where id = ${session.memberId}`;
  if (!member?.is_validated_member) {
    return { error: NextResponse.json({ error: "Cadastro ainda não validado." }, { status: 403 }) };
  }
  return { memberId: session.memberId };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await validatedMemberId();
  if ("error" in auth) return auth.error;

  const [org] = await sql`select id from church_organizations where id = ${id}`;
  if (!org) return NextResponse.json({ error: "Organização não encontrada." }, { status: 404 });

  const created = await sql`
    insert into organization_members (organization_id, member_id)
    values (${id}, ${auth.memberId})
    on conflict do nothing
    returning organization_id
  `;
  if (created.length === 0) {
    return NextResponse.json(
      { error: "Você já participa ou já tem um pedido pendente nesta organização." },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const auth = await validatedMemberId();
  if ("error" in auth) return auth.error;

  await sql`delete from organization_members where organization_id = ${id} and member_id = ${auth.memberId}`;
  return NextResponse.json({ ok: true });
}

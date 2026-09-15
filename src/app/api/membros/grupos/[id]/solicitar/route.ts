import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) {
    return NextResponse.json({ error: "Cadastro ainda não validado." }, { status: 403 });
  }

  const [group] = await sql`select id from member_groups where id = ${id}`;
  if (!group) {
    return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
  }

  const [alreadyMember] = await sql`
    select id from member_group_members
    where group_id = ${id} and member_id = ${session.memberId}
  `;
  if (alreadyMember) {
    return NextResponse.json({ error: "Você já faz parte deste grupo." }, { status: 409 });
  }

  const [pending] = await sql`
    select id from group_join_requests
    where group_id = ${id} and member_id = ${session.memberId} and status = 'pendente'
  `;
  if (pending) {
    return NextResponse.json({ error: "Você já tem uma solicitação pendente para este grupo." }, { status: 409 });
  }

  await sql`
    insert into group_join_requests (group_id, member_id)
    values (${id}, ${session.memberId})
  `;

  return NextResponse.json({ ok: true });
}

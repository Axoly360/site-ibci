import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(
  _request: NextRequest,
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

  const [room] = await sql`select id from ebd_classes where id = ${id}`;
  if (!room) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }

  const [alreadyIn] = await sql`
    select id from ebd_enrollments where class_id = ${id} and member_id = ${session.memberId}
  `;
  if (alreadyIn) {
    return NextResponse.json({ error: "Você já faz parte desta sala." }, { status: 409 });
  }

  const [pending] = await sql`
    select id from ebd_join_requests
    where class_id = ${id} and member_id = ${session.memberId} and status = 'pendente'
  `;
  if (pending) {
    return NextResponse.json(
      { error: "Você já tem uma solicitação pendente para esta sala." },
      { status: 409 }
    );
  }

  await sql`
    insert into ebd_join_requests (class_id, member_id) values (${id}, ${session.memberId})
  `;
  return NextResponse.json({ ok: true });
}

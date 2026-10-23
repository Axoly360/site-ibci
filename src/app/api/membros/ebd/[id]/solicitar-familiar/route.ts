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

  const body = await request.json().catch(() => null);
  const childId = typeof body?.childId === "string" ? body.childId : "";
  if (!childId) {
    return NextResponse.json({ error: "Escolha o familiar." }, { status: 400 });
  }

  // O familiar precisa ser do próprio membro logado.
  const [child] = await sql`
    select id from member_children where id = ${childId} and member_id = ${session.memberId}
  `;
  if (!child) {
    return NextResponse.json({ error: "Familiar não encontrado." }, { status: 404 });
  }

  const [room] = await sql`select id from ebd_classes where id = ${id}`;
  if (!room) {
    return NextResponse.json({ error: "Sala não encontrada." }, { status: 404 });
  }

  const [alreadyIn] = await sql`
    select id from ebd_enrollments where class_id = ${id} and child_id = ${childId}
  `;
  if (alreadyIn) {
    return NextResponse.json({ error: "Este familiar já faz parte desta sala." }, { status: 409 });
  }

  const [pending] = await sql`
    select id from ebd_join_requests
    where class_id = ${id} and child_id = ${childId} and status = 'pendente'
  `;
  if (pending) {
    return NextResponse.json(
      { error: "Já existe um pedido pendente desta sala para este familiar." },
      { status: 409 }
    );
  }

  await sql`insert into ebd_join_requests (class_id, child_id) values (${id}, ${childId})`;
  return NextResponse.json({ ok: true });
}

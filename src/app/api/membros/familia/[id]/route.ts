import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { RELATIONSHIP_OPTIONS } from "@/lib/family";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const birthdate = typeof body?.birthdate === "string" ? body.birthdate.trim() : "";
  const sex = typeof body?.sex === "string" ? body.sex.trim() : "";
  const relationshipInput = typeof body?.relationship === "string" ? body.relationship.trim() : "";
  const relationship = RELATIONSHIP_OPTIONS.includes(relationshipInput as (typeof RELATIONSHIP_OPTIONS)[number])
    ? relationshipInput
    : "Filho(a)";

  if (!name) {
    return NextResponse.json({ error: "Nome do familiar é obrigatório." }, { status: 400 });
  }

  const [updated] = await sql`
    update member_children
    set name = ${name}, birthdate = ${birthdate || null}, sex = ${sex || null},
        relationship = ${relationship}
    where id = ${id} and member_id = ${session.memberId}
    returning id
  `;
  if (!updated) {
    return NextResponse.json({ error: "Familiar não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  await sql`
    delete from member_children where id = ${id} and member_id = ${session.memberId}
  `;

  return NextResponse.json({ ok: true });
}

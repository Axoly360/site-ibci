import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { RELATIONSHIP_OPTIONS } from "@/lib/family";

export async function POST(request: NextRequest) {
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

  await sql`
    insert into member_children (member_id, name, birthdate, sex, relationship)
    values (${session.memberId}, ${name}, ${birthdate || null}, ${sex || null}, ${relationship})
  `;

  return NextResponse.json({ ok: true });
}

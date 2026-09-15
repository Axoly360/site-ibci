import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const cpf = typeof body?.cpf === "string" ? body.cpf.trim() : "";
  const consent = body?.consent === true;

  if (!name) {
    return NextResponse.json({ error: "Nome completo é obrigatório." }, { status: 400 });
  }
  if (!consent) {
    return NextResponse.json(
      { error: "É preciso concordar com o uso dos dados para continuar." },
      { status: 400 }
    );
  }

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (member?.is_validated_member) {
    return NextResponse.json({ error: "Você já é um membro validado." }, { status: 409 });
  }

  const [pendente] = await sql`
    select id from membership_requests
    where member_id = ${session.memberId} and status = 'pendente'
  `;
  if (pendente) {
    return NextResponse.json(
      { error: "Já existe um cadastro em análise para você." },
      { status: 409 }
    );
  }

  await sql`
    update members set name = ${name}, phone = ${phone || null}, cpf = ${cpf || null}
    where id = ${session.memberId}
  `;

  await sql`
    insert into membership_requests (member_id, phone, cpf)
    values (${session.memberId}, ${phone || null}, ${cpf || null})
  `;

  return NextResponse.json({ ok: true });
}

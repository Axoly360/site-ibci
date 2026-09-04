import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
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
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const cpf = typeof body?.cpf === "string" ? body.cpf.trim() : "";
  const birthdate = typeof body?.birthdate === "string" ? body.birthdate.trim() : "";
  const address = typeof body?.address === "string" ? body.address.trim() : "";
  const timeAtChurch =
    typeof body?.timeAtChurch === "string" ? body.timeAtChurch.trim() : "";
  const baptismDate = typeof body?.baptismDate === "string" ? body.baptismDate.trim() : "";
  const arrivalDate = typeof body?.arrivalDate === "string" ? body.arrivalDate.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
  }

  await sql`
    update members set
      name = ${name},
      phone = ${phone || null},
      cpf = ${cpf || null},
      birthdate = ${birthdate || null},
      address = ${address || null},
      time_at_church = ${timeAtChurch || null},
      baptism_date = ${baptismDate || null},
      arrival_date = ${arrivalDate || null}
    where id = ${session.memberId}
  `;

  return NextResponse.json({ ok: true });
}

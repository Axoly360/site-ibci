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
  const maritalStatus = typeof body?.maritalStatus === "string" ? body.maritalStatus.trim() : "";
  const birthplace = typeof body?.birthplace === "string" ? body.birthplace.trim() : "";
  const profession = typeof body?.profession === "string" ? body.profession.trim() : "";
  const sex = body?.sex === "Feminino" || body?.sex === "Masculino" ? body.sex : "";

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
      arrival_date = ${arrivalDate || null},
      marital_status = ${maritalStatus || null},
      birthplace = ${birthplace || null},
      profession = ${profession || null},
      sex = ${sex || null}
    where id = ${session.memberId}
  `;

  // Solicitação de ministério diaconal: só mexe enquanto não confirmada pela
  // Secretaria; depois de confirmado, o membro não altera por aqui.
  if (typeof body?.deaconKind === "string") {
    const deaconKind = body.deaconKind.trim();
    const [deacon] = await sql`
      select status from deacon_profiles where member_id = ${session.memberId}
    `;
    if (deaconKind === "Diácono" || deaconKind === "Diaconisa") {
      if (!deacon) {
        await sql`
          insert into deacon_profiles (member_id, kind) values (${session.memberId}, ${deaconKind})
        `;
      } else if (deacon.status === "solicitado") {
        await sql`
          update deacon_profiles set kind = ${deaconKind} where member_id = ${session.memberId}
        `;
      }
    } else if (deaconKind === "" && deacon?.status === "solicitado") {
      await sql`delete from deacon_profiles where member_id = ${session.memberId}`;
    }
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getDeaconBoardMember } from "@/lib/deaconAccess";

export async function POST(request: NextRequest) {
  if (!(await getDeaconBoardMember())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const kind = typeof body?.kind === "string" ? body.kind.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if ((kind !== "atividade" && kind !== "tarefa") || !name || name.length > 80) {
    return NextResponse.json({ error: "Informe um nome válido (até 80 caracteres)." }, { status: 400 });
  }

  await sql`
    insert into deacon_catalog (kind, name, position)
    values (
      ${kind}, ${name},
      coalesce((select max(position) from deacon_catalog where kind = ${kind}), 0) + 1
    )
    on conflict (kind, name) do nothing
  `;
  return NextResponse.json({ ok: true });
}

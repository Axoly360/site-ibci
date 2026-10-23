import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = text(body?.name);
  const shortName = text(body?.shortName);
  if (!name || !shortName || name.length > 80 || shortName.length > 20) {
    return NextResponse.json(
      { error: "Informe o nome (até 80) e a sigla (até 20 caracteres)." },
      { status: 400 }
    );
  }

  const created = await sql`
    insert into church_organizations (name, short_name, position)
    values (
      ${name}, ${shortName},
      coalesce((select max(position) from church_organizations), 0) + 1
    )
    on conflict (short_name) do nothing
    returning id
  `;
  if (created.length === 0) {
    return NextResponse.json({ error: "Já existe uma organização com essa sigla." }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

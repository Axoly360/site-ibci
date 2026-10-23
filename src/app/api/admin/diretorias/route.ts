import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

const OFFICES = ["Presidente", "Vice-presidente"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const memberId = text(body?.memberId);
  const organizationId = text(body?.organizationId);
  const office = text(body?.office);
  const startDate = text(body?.startDate);
  const endDate = text(body?.endDate);

  if (!memberId || !organizationId || !OFFICES.includes(office) || !ISO_DATE.test(startDate)) {
    return NextResponse.json(
      { error: "Informe membro, organização, cargo e data de início." },
      { status: 400 }
    );
  }
  if (endDate && (!ISO_DATE.test(endDate) || endDate < startDate)) {
    return NextResponse.json(
      { error: "A data de fim não pode ser anterior à de início." },
      { status: 400 }
    );
  }

  const [member] = await sql`
    select 1 as ok from members where id = ${memberId} and is_validated_member = true
  `;
  if (!member) {
    return NextResponse.json({ error: "Escolha um membro com cadastro validado." }, { status: 400 });
  }

  const created = await sql`
    insert into member_offices (member_id, organization_id, office, start_date, end_date)
    values (${memberId}, ${organizationId}, ${office}, ${startDate}::date, ${endDate || null}::date)
    on conflict do nothing
    returning id
  `;
  if (created.length === 0) {
    return NextResponse.json(
      { error: "Esse cargo já foi lançado para essa pessoa com a mesma data de início." },
      { status: 409 }
    );
  }
  return NextResponse.json({ ok: true });
}

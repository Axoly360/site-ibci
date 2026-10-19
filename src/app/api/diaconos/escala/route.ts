import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getDeaconBoardMember } from "@/lib/deaconAccess";

export async function POST(request: NextRequest) {
  if (!(await getDeaconBoardMember())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const serviceDate = typeof body?.serviceDate === "string" ? body.serviceDate.trim() : "";
  const activity = typeof body?.activity === "string" ? body.activity.trim() : "";
  const task = typeof body?.task === "string" ? body.task.trim() : "";
  const memberId = typeof body?.memberId === "string" ? body.memberId.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate) || !activity || !memberId) {
    return NextResponse.json({ error: "Informe data, atividade e diácono." }, { status: 400 });
  }

  const [active] = await sql`
    select 1 as ok from deacon_profiles where member_id = ${memberId} and status = 'ativo'
  `;
  if (!active) {
    return NextResponse.json({ error: "Só diáconos ativos entram na escala." }, { status: 400 });
  }

  await sql`
    insert into deacon_schedule (service_date, service_label, member_id, post, notes)
    values (${serviceDate}, ${activity}, ${memberId}, ${task || null}, ${notes || null})
  `;
  return NextResponse.json({ ok: true });
}

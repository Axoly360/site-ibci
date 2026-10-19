import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "diaconos")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const serviceDate = typeof body?.serviceDate === "string" ? body.serviceDate.trim() : "";
  const serviceLabel = typeof body?.serviceLabel === "string" ? body.serviceLabel.trim() : "";
  const memberId = typeof body?.memberId === "string" ? body.memberId.trim() : "";
  const post = typeof body?.post === "string" ? body.post.trim() : "";

  if (!/^\d{4}-\d{2}-\d{2}$/.test(serviceDate) || !serviceLabel || !memberId) {
    return NextResponse.json({ error: "Informe data, culto e diácono." }, { status: 400 });
  }

  const [active] = await sql`
    select 1 as ok from deacon_profiles where member_id = ${memberId} and status = 'ativo'
  `;
  if (!active) {
    return NextResponse.json({ error: "Só diáconos ativos entram na escala." }, { status: 400 });
  }

  await sql`
    insert into deacon_schedule (service_date, service_label, member_id, post)
    values (${serviceDate}, ${serviceLabel}, ${memberId}, ${post || null})
  `;
  return NextResponse.json({ ok: true });
}

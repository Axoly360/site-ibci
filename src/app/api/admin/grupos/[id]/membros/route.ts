import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const memberId = typeof body?.memberId === "string" ? body.memberId : "";
  if (!memberId) {
    return NextResponse.json({ error: "Selecione um membro." }, { status: 400 });
  }

  await sql`
    insert into member_group_members (group_id, member_id)
    values (${id}, ${memberId})
    on conflict (group_id, member_id) do nothing
  `;

  return NextResponse.json({ ok: true });
}

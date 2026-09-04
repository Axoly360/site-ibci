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
  const isLeadership = Boolean(body?.isLeadership);
  const churchRole = typeof body?.churchRole === "string" ? body.churchRole.trim() : "";

  await sql`
    update members
    set is_leadership = ${isLeadership}, church_role = ${churchRole || null}
    where id = ${id}
  `;

  return NextResponse.json({ ok: true });
}

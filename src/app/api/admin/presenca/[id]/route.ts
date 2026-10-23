import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!session || !hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from service_attendance where id = ${id}`;
  return NextResponse.json({ ok: true });
}

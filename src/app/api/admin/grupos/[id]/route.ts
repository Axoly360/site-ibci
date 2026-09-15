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
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const leaderName = typeof body?.leaderName === "string" ? body.leaderName.trim() : "";
  const meetingDay = typeof body?.meetingDay === "string" ? body.meetingDay.trim() : "";
  const location = typeof body?.location === "string" ? body.location.trim() : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Nome do grupo é obrigatório." }, { status: 400 });
  }

  await sql`
    update member_groups set
      name = ${name},
      leader_name = ${leaderName || null},
      meeting_day = ${meetingDay || null},
      location = ${location || null},
      description = ${description || null}
    where id = ${id}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from member_groups where id = ${id}`;

  return NextResponse.json({ ok: true });
}

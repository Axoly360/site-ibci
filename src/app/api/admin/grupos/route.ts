import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
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
    insert into member_groups (name, leader_name, meeting_day, location, description)
    values (${name}, ${leaderName || null}, ${meetingDay || null}, ${location || null}, ${description || null})
  `;

  return NextResponse.json({ ok: true });
}

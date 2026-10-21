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
  const status = body?.status;
  if (status !== "ativo" && status !== "afastado") {
    return NextResponse.json({ error: "Situação inválida." }, { status: 400 });
  }

  await sql`
    update teacher_profiles
    set status = ${status}, approved_at = coalesce(approved_at, now())
    where member_id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from ebd_class_teachers where member_id = ${id}`;
  await sql`delete from teacher_profiles where member_id = ${id}`;
  return NextResponse.json({ ok: true });
}

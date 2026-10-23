import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

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
  const startDate = text(body?.startDate);
  const endDate = text(body?.endDate);

  if (!ISO_DATE.test(startDate)) {
    return NextResponse.json({ error: "Informe a data de início." }, { status: 400 });
  }
  if (endDate && (!ISO_DATE.test(endDate) || endDate < startDate)) {
    return NextResponse.json(
      { error: "A data de fim não pode ser anterior à de início." },
      { status: 400 }
    );
  }

  try {
    await sql`
      update member_offices
      set start_date = ${startDate}::date, end_date = ${endDate || null}::date
      where id = ${id}
    `;
  } catch {
    return NextResponse.json(
      { error: "Já existe esse cargo para essa pessoa com essa data de início." },
      { status: 409 }
    );
  }
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

  await sql`delete from member_offices where id = ${id}`;
  return NextResponse.json({ ok: true });
}

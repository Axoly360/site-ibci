import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getBoardMemberFor } from "@/lib/orgAccess";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
  const { orgId, eventId } = await params;
  if (!(await getBoardMemberFor(orgId))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const title = text(body?.title);
  const date = text(body?.date);
  if (!title || title.length > 120 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Informe o título (até 120 caracteres) e a data." },
      { status: 400 }
    );
  }

  const updated = await sql`
    update organization_events set
      title = ${title},
      event_date = ${date}::date,
      event_time = ${text(body?.time) || null},
      location = ${text(body?.location) || null},
      description = ${text(body?.description) || null}
    where id = ${eventId} and organization_id = ${orgId}
    returning id
  `;
  if (updated.length === 0) {
    return NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ orgId: string; eventId: string }> }
) {
  const { orgId, eventId } = await params;
  if (!(await getBoardMemberFor(orgId))) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from organization_events where id = ${eventId} and organization_id = ${orgId}`;
  return NextResponse.json({ ok: true });
}

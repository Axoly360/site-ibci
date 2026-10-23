import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getBoardMemberFor } from "@/lib/orgAccess";

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params;
  const memberId = await getBoardMemberFor(orgId);
  if (!memberId) {
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

  await sql`
    insert into organization_events
      (organization_id, title, event_date, event_time, location, description, created_by)
    values (
      ${orgId}, ${title}, ${date}::date, ${text(body?.time) || null},
      ${text(body?.location) || null}, ${text(body?.description) || null}, ${memberId}
    )
  `;
  return NextResponse.json({ ok: true });
}

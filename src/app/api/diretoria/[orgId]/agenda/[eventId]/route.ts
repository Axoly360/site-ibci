import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getBoardMemberFor } from "@/lib/orgAccess";

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

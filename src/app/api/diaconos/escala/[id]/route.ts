import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getDeaconBoardMember } from "@/lib/deaconAccess";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await getDeaconBoardMember())) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from deacon_schedule where id = ${id}`;
  return NextResponse.json({ ok: true });
}

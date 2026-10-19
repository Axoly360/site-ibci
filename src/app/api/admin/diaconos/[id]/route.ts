import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

const STATUSES = ["solicitado", "ativo", "afastado", "emerito"];
const KINDS = ["Diácono", "Diaconisa"];

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "diaconos")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const status = text(body?.status);
  const kind = text(body?.kind);
  if (!STATUSES.includes(status) || !KINDS.includes(kind)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }
  const congregationId = text(body?.congregationId);

  await sql`
    update deacon_profiles set
      status = ${status},
      kind = ${kind},
      consecration_date = ${text(body?.consecrationDate) || null},
      area = ${text(body?.area) || null},
      congregation_id = ${congregationId || null},
      notes = ${text(body?.notes) || null},
      is_board = ${Boolean(body?.isBoard) && status === "ativo"},
      approved_at = case
        when ${status} <> 'solicitado' then coalesce(approved_at, now())
        else null
      end
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
  if (!hasPermission(session, "diaconos")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from deacon_profiles where member_id = ${id}`;
  return NextResponse.json({ ok: true });
}

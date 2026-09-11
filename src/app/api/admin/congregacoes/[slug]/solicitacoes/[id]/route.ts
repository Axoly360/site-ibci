import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "congregacoes")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const decision = body?.decision;
  const responseNote = typeof body?.responseNote === "string" ? body.responseNote.trim() : "";

  if (decision !== "aprovado" && decision !== "recusado") {
    return NextResponse.json({ error: "Decisão inválida." }, { status: 400 });
  }

  const [updated] = await sql`
    update congregation_requests
    set status = ${decision}, decided_at = now(), decided_by = ${session!.id},
        response_note = ${responseNote || null}
    where id = ${id} and status = 'pendente'
    returning id
  `;

  if (!updated) {
    return NextResponse.json(
      { error: "Solicitação não encontrada ou já decidida." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}

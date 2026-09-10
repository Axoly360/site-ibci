import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

const TYPES = ["entrada", "saida"];

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "financeiro")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const type = typeof body?.type === "string" ? body.type : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const amount = typeof body?.amount === "number" ? body.amount : Number(body?.amount);
  const entryDate = typeof body?.entryDate === "string" ? body.entryDate : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const memberId = typeof body?.memberId === "string" && body.memberId ? body.memberId : null;
  const requestedBy =
    typeof body?.requestedBy === "string" && body.requestedBy.trim()
      ? body.requestedBy.trim()
      : null;

  if (!TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }
  if (!category) {
    return NextResponse.json({ error: "Informe a categoria." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Informe um valor válido." }, { status: 400 });
  }
  if (!entryDate) {
    return NextResponse.json({ error: "Informe a data." }, { status: 400 });
  }

  // member_id só se aplica a entradas (quem contribuiu); requested_by só a
  // saídas (quem solicitou a despesa) — evita salvar o campo do tipo errado
  // mesmo que o client mande os dois por engano.
  await sql`
    insert into financial_entries
      (type, category, amount, entry_date, description, member_id, requested_by, created_by)
    values (
      ${type}, ${category}, ${amount}, ${entryDate}, ${description || null},
      ${type === "entrada" ? memberId : null},
      ${type === "saida" ? requestedBy : null},
      ${session!.id}
    )
  `;

  return NextResponse.json({ ok: true });
}

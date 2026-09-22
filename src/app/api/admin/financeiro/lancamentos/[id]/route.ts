import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

const TYPES = ["entrada", "saida"];

/** Corrige um lançamento já feito (ex.: erro de digitação de valor/data).
 * Não mexe no comprovante/prestação de contas de origem — só corrige os
 * dados do lançamento em si. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!hasPermission(session, "financeiro")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const type = typeof body?.type === "string" ? body.type : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const amount = Number(body?.amount);
  const entryDate = typeof body?.entryDate === "string" ? body.entryDate : "";
  const description = typeof body?.description === "string" ? body.description.trim() : "";
  const requestedBy = typeof body?.requestedBy === "string" ? body.requestedBy.trim() : "";

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

  const [updated] = await sql`
    update financial_entries
    set type = ${type}, category = ${category}, amount = ${amount},
        entry_date = ${entryDate}, description = ${description || null},
        requested_by = ${type === "saida" ? requestedBy || null : null}
    where id = ${id}
    returning id
  `;
  if (!updated) {
    return NextResponse.json({ error: "Lançamento não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

/** Exclui um lançamento feito por engano. Se ele veio de um comprovante ou
 * de uma prestação de contas de congregação, devolve a origem pro estado
 * "pendente" (em vez de deixá-la marcada como "aprovada" apontando pra um
 * lançamento que não existe mais) — assim dá pra corrigir e lançar de novo. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!hasPermission(session, "financeiro")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;

  await sql`
    update contribution_receipts
    set status = 'pendente', financial_entry_id = null, approved_by = null, approved_at = null
    where financial_entry_id = ${id}
  `;
  await sql`
    update congregation_financial_submissions
    set status = 'pendente', financial_entry_id = null, approved_by = null, approved_at = null
    where financial_entry_id = ${id}
  `;
  await sql`delete from financial_entries where id = ${id}`;

  return NextResponse.json({ ok: true });
}

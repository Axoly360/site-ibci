import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!hasPermission(session, "financeiro")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { id } = await params;

  const [receipt] = await sql`
    select contribution_receipts.id, contribution_receipts.member_id,
           contribution_receipts.category, contribution_receipts.sender_type,
           contribution_receipts.type, contribution_receipts.amount,
           contribution_receipts.note, contribution_receipts.file_url,
           contribution_receipts.status, members.name as member_name
    from contribution_receipts
    join members on members.id = contribution_receipts.member_id
    where contribution_receipts.id = ${id}
  `;

  if (!receipt) {
    return NextResponse.json({ error: "Comprovante não encontrado." }, { status: 404 });
  }
  if (receipt.status === "aprovado") {
    return NextResponse.json({ error: "Este comprovante já foi aprovado." }, { status: 409 });
  }
  if (!receipt.category || !receipt.type || !receipt.amount) {
    return NextResponse.json(
      { error: "Comprovante sem categoria, tipo ou valor — não é possível aprovar." },
      { status: 400 }
    );
  }

  // "Quem enviou" (Membro/Congregado/Visitante/etc.) é sobre quem entregou o
  // comprovante, diferente de "requested_by" (Pastor/Tesouraria/etc., quem
  // solicitou uma saída) — por isso vai só na descrição, não num campo 1:1.
  const description = [
    receipt.sender_type && receipt.sender_type !== "Membro"
      ? `Enviado como: ${receipt.sender_type}`
      : null,
    receipt.note,
  ]
    .filter(Boolean)
    .join(" — ");

  const [entry] = await sql`
    insert into financial_entries (type, category, amount, description, member_id, receipt_url, created_by)
    values (
      ${receipt.type}, ${receipt.category}, ${receipt.amount}, ${description || null},
      ${receipt.type === "entrada" ? receipt.member_id : null},
      ${receipt.file_url}, ${session!.id}
    )
    returning id
  `;

  await sql`
    update contribution_receipts
    set status = 'aprovado', financial_entry_id = ${entry.id},
        approved_by = ${session!.id}, approved_at = now()
    where id = ${id}
  `;

  return NextResponse.json({ ok: true, financialEntryId: entry.id });
}

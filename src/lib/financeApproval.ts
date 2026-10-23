import { sql } from "@/lib/db";

export type ApprovalResult =
  | { ok: true; id: string }
  | { ok: false; error: string; status: number };

const TYPES = ["entrada", "saida"];

/**
 * Aprova com um clique um comprovante enviado por membro: cria o lançamento
 * com os dados que o membro informou (data = dia do envio) e marca o
 * comprovante como aprovado. Mesma regra do formulário de Lançamentos —
 * inclusive o UPDATE atômico que impede aprovar duas vezes e, se perder a
 * corrida, desfaz o lançamento recém-criado.
 */
export async function approveMemberReceipt(
  receiptId: string,
  adminId: string
): Promise<ApprovalResult> {
  const [r] = await sql`
    select id, member_id, file_url, note, category, sender_type, type,
           amount::float8 as amount, status,
           to_char(created_at at time zone 'America/Recife', 'YYYY-MM-DD') as entry_date
    from contribution_receipts
    where id = ${receiptId}
  `;
  if (!r) return { ok: false, error: "Comprovante não encontrado.", status: 404 };
  if (r.status === "aprovado") {
    return { ok: false, error: "Este comprovante já foi lançado.", status: 409 };
  }
  if (!r.category || !TYPES.includes(r.type) || !(Number(r.amount) > 0)) {
    return {
      ok: false,
      error: "Comprovante sem categoria, tipo ou valor. Selecione-o para preencher no formulário.",
      status: 400,
    };
  }

  const description =
    [r.sender_type && r.sender_type !== "Membro" ? `Enviado como: ${r.sender_type}` : null, r.note]
      .filter(Boolean)
      .join(" — ") || null;

  const [entry] = await sql`
    insert into financial_entries
      (type, category, amount, entry_date, description, member_id, receipt_url, created_by)
    values (
      ${r.type}, ${r.category}, ${r.amount}, ${r.entry_date}, ${description},
      ${r.member_id}, ${r.file_url}, ${adminId}
    )
    returning id
  `;

  const [claimed] = await sql`
    update contribution_receipts
    set status = 'aprovado', financial_entry_id = ${entry.id},
        approved_by = ${adminId}, approved_at = now()
    where id = ${receiptId} and status != 'aprovado'
    returning id
  `;
  if (!claimed) {
    await sql`delete from financial_entries where id = ${entry.id}`;
    return {
      ok: false,
      error: "Este comprovante já foi lançado (por outra aba ou usuário).",
      status: 409,
    };
  }

  return { ok: true, id: entry.id as string };
}

/** Mesma aprovação direta, para a prestação de contas enviada por uma congregação. */
export async function approveCongregationSubmission(
  submissionId: string,
  adminId: string
): Promise<ApprovalResult> {
  const [s] = await sql`
    select id, type, category, amount::float8 as amount, entry_date, description, receipt_url,
           status, congregation_id, congregation_user_id
    from congregation_financial_submissions
    where id = ${submissionId}
  `;
  if (!s) return { ok: false, error: "Prestação de contas não encontrada.", status: 404 };
  if (s.status === "aprovado") {
    return { ok: false, error: "Esta prestação de contas já foi lançada.", status: 409 };
  }

  const [entry] = await sql`
    insert into financial_entries
      (type, category, amount, entry_date, description, receipt_url,
       congregation_id, congregation_user_id, created_by)
    values (
      ${s.type}, ${s.category}, ${s.amount}, ${s.entry_date}, ${s.description || null},
      ${s.receipt_url}, ${s.congregation_id}, ${s.congregation_user_id}, ${adminId}
    )
    returning id
  `;

  const [claimed] = await sql`
    update congregation_financial_submissions
    set status = 'aprovado', financial_entry_id = ${entry.id},
        approved_by = ${adminId}, approved_at = now()
    where id = ${submissionId} and status != 'aprovado'
    returning id
  `;
  if (!claimed) {
    await sql`delete from financial_entries where id = ${entry.id}`;
    return {
      ok: false,
      error: "Esta prestação de contas já foi lançada (por outra aba ou usuário).",
      status: 409,
    };
  }

  return { ok: true, id: entry.id as string };
}

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { isImageOrPdfFile, sanitizeFileName } from "@/lib/fileValidation";

const TYPES = ["entrada", "saida"];

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "financeiro")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const type = typeof formData.get("type") === "string" ? String(formData.get("type")) : "";
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const entryDate = String(formData.get("entryDate") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const memberIdRaw = formData.get("memberId");
  const memberId = typeof memberIdRaw === "string" && memberIdRaw ? memberIdRaw : null;
  const requestedByRaw = formData.get("requestedBy");
  const requestedBy =
    typeof requestedByRaw === "string" && requestedByRaw.trim() ? requestedByRaw.trim() : null;
  const comprovanteIdRaw = formData.get("comprovanteId");
  const comprovanteId =
    typeof comprovanteIdRaw === "string" && comprovanteIdRaw ? comprovanteIdRaw : null;
  const congregacaoSubmissaoIdRaw = formData.get("congregacaoSubmissaoId");
  const congregacaoSubmissaoId =
    typeof congregacaoSubmissaoIdRaw === "string" && congregacaoSubmissaoIdRaw
      ? congregacaoSubmissaoIdRaw
      : null;
  const congregationIdRaw = formData.get("congregationId");
  const congregationId =
    typeof congregationIdRaw === "string" && congregationIdRaw ? congregationIdRaw : null;
  const congregationUserIdRaw = formData.get("congregationUserId");
  const congregationUserId =
    typeof congregationUserIdRaw === "string" && congregationUserIdRaw
      ? congregationUserIdRaw
      : null;
  const existingReceiptUrlRaw = formData.get("existingReceiptUrl");
  const existingReceiptUrl =
    typeof existingReceiptUrlRaw === "string" && existingReceiptUrlRaw
      ? existingReceiptUrlRaw
      : null;
  const file = formData.get("file");

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

  // Se vem de um comprovante selecionado no Financeiro, confere que ele
  // ainda não foi lançado — evita duplicar caso o botão seja clicado duas
  // vezes ou a mesma tela fique aberta em duas abas.
  if (comprovanteId) {
    const [receipt] = await sql`
      select status from contribution_receipts where id = ${comprovanteId}
    `;
    if (!receipt) {
      return NextResponse.json({ error: "Comprovante não encontrado." }, { status: 404 });
    }
    if (receipt.status === "aprovado") {
      return NextResponse.json(
        { error: "Este comprovante já foi lançado." },
        { status: 409 }
      );
    }
  }

  // Mesma cautela para prestação de contas de congregação: confere que
  // ainda não foi lançada antes de criar a linha real.
  if (congregacaoSubmissaoId) {
    const [submissao] = await sql`
      select status from congregation_financial_submissions where id = ${congregacaoSubmissaoId}
    `;
    if (!submissao) {
      return NextResponse.json(
        { error: "Prestação de contas não encontrada." },
        { status: 404 }
      );
    }
    if (submissao.status === "aprovado") {
      return NextResponse.json(
        { error: "Esta prestação de contas já foi lançada." },
        { status: 409 }
      );
    }
  }

  let receiptUrl: string | null = existingReceiptUrl;
  if (file && typeof file !== "string") {
    if (!(await isImageOrPdfFile(file))) {
      return NextResponse.json(
        { error: "Envie o comprovante em PDF, PNG ou JPEG." },
        { status: 400 }
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo maior que 10 MB não é permitido." },
        { status: 400 }
      );
    }
    try {
      const blob = await put(`financeiro/${Date.now()}-${sanitizeFileName(file.name)}`, file, {
        access: "public",
      });
      receiptUrl = blob.url;
    } catch {
      return NextResponse.json(
        { error: "Armazenamento de arquivos ainda não configurado." },
        { status: 500 }
      );
    }
  }

  // member_id identifica quem está associado ao lançamento — quem
  // contribuiu (entrada) ou, quando a saída partiu de um comprovante
  // enviado por um membro (ex.: reembolso de despesa), quem a solicitou.
  // requested_by (papel administrativo: Pastor/Tesouraria/etc.) só se aplica
  // a saídas e é independente do member_id.
  const [entry] = await sql`
    insert into financial_entries
      (type, category, amount, entry_date, description, member_id, requested_by, receipt_url,
       congregation_id, congregation_user_id, created_by)
    values (
      ${type}, ${category}, ${amount}, ${entryDate}, ${description || null},
      ${memberId},
      ${type === "saida" ? requestedBy : null},
      ${receiptUrl},
      ${congregationId},
      ${congregationUserId},
      ${session!.id}
    )
    returning id
  `;

  // Reivindica o comprovante/prestação de contas com um UPDATE atômico
  // (`where status != 'aprovado'`) em vez de confiar só na checagem lá em
  // cima — fecha a janela de corrida entre "checar" e "marcar aprovado" se
  // duas abas/pessoas aprovarem o mesmo comprovante quase ao mesmo tempo.
  // Se perder a corrida, desfaz o lançamento recém-criado (evita duplicar).
  if (comprovanteId) {
    const [claimed] = await sql`
      update contribution_receipts
      set status = 'aprovado', financial_entry_id = ${entry.id},
          approved_by = ${session!.id}, approved_at = now()
      where id = ${comprovanteId} and status != 'aprovado'
      returning id
    `;
    if (!claimed) {
      await sql`delete from financial_entries where id = ${entry.id}`;
      return NextResponse.json(
        { error: "Este comprovante já foi lançado (por outra aba ou usuário)." },
        { status: 409 }
      );
    }
  }

  if (congregacaoSubmissaoId) {
    const [claimed] = await sql`
      update congregation_financial_submissions
      set status = 'aprovado', financial_entry_id = ${entry.id},
          approved_by = ${session!.id}, approved_at = now()
      where id = ${congregacaoSubmissaoId} and status != 'aprovado'
      returning id
    `;
    if (!claimed) {
      await sql`delete from financial_entries where id = ${entry.id}`;
      return NextResponse.json(
        { error: "Esta prestação de contas já foi lançada (por outra aba ou usuário)." },
        { status: 409 }
      );
    }
  }

  return NextResponse.json({ ok: true, id: entry.id });
}

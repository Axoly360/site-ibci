import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

const TYPES = ["entrada", "saida"];
const ALLOWED_RECEIPT_TYPES = ["application/pdf", "image/png", "image/jpeg"];

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

  let receiptUrl: string | null = existingReceiptUrl;
  if (file && typeof file !== "string") {
    if (!ALLOWED_RECEIPT_TYPES.includes(file.type)) {
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
      const blob = await put(`financeiro/${Date.now()}-${file.name}`, file, {
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
      (type, category, amount, entry_date, description, member_id, requested_by, receipt_url, created_by)
    values (
      ${type}, ${category}, ${amount}, ${entryDate}, ${description || null},
      ${memberId},
      ${type === "saida" ? requestedBy : null},
      ${receiptUrl},
      ${session!.id}
    )
    returning id
  `;

  if (comprovanteId) {
    await sql`
      update contribution_receipts
      set status = 'aprovado', financial_entry_id = ${entry.id},
          approved_by = ${session!.id}, approved_at = now()
      where id = ${comprovanteId}
    `;
  }

  return NextResponse.json({ ok: true, id: entry.id });
}

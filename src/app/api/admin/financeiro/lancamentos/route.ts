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

  let receiptUrl: string | null = null;
  if (type === "saida" && file && typeof file !== "string") {
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

  // member_id só se aplica a entradas (quem contribuiu); requested_by e
  // receipt_url só a saídas (quem solicitou a despesa e o comprovante) —
  // evita salvar o campo do tipo errado mesmo que o client mande os dois.
  await sql`
    insert into financial_entries
      (type, category, amount, entry_date, description, member_id, requested_by, receipt_url, created_by)
    values (
      ${type}, ${category}, ${amount}, ${entryDate}, ${description || null},
      ${type === "entrada" ? memberId : null},
      ${type === "saida" ? requestedBy : null},
      ${type === "saida" ? receiptUrl : null},
      ${session!.id}
    )
  `;

  return NextResponse.json({ ok: true });
}

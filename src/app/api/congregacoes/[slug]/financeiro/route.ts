import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getCongregationSession } from "@/lib/congregation-session";
import { isImageOrPdfFile, sanitizeFileName } from "@/lib/fileValidation";

const TYPES = ["entrada", "saida"];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getCongregationSession();
  if (!session || session.congregationSlug !== slug) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const type = String(formData.get("type") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const entryDate = String(formData.get("entryDate") ?? "");
  const description = String(formData.get("description") ?? "").trim();
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
      const blob = await put(`congregacoes/${slug}/${Date.now()}-${sanitizeFileName(file.name)}`, file, {
        access: "public",
        addRandomSuffix: true,
      });
      receiptUrl = blob.url;
    } catch {
      return NextResponse.json(
        { error: "Armazenamento de arquivos ainda não configurado." },
        { status: 500 }
      );
    }
  }

  // Fica pendente até o financeiro da central revisar e lançar — não entra
  // direto em financial_entries.
  await sql`
    insert into congregation_financial_submissions
      (congregation_id, congregation_user_id, type, category, amount, entry_date, description, receipt_url)
    values (
      ${session.congregationId}, ${session.id}, ${type}, ${category}, ${amount}, ${entryDate},
      ${description || null}, ${receiptUrl}
    )
  `;

  return NextResponse.json({ ok: true });
}

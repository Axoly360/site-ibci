import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";
import { isImageOrPdfFile, sanitizeFileName } from "@/lib/fileValidation";

const TYPES = ["entrada", "saida"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const receipts = await sql`
    select id, file_name, file_url, note, category, sender_type, type, amount, status, created_at
    from contribution_receipts
    where member_id = ${session.memberId}
    order by created_at desc
  `;

  return NextResponse.json({ receipts });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) {
    return NextResponse.json({ error: "Cadastro ainda não validado." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const note = formData?.get("note");
  const category = String(formData?.get("category") ?? "").trim();
  const senderType = String(formData?.get("senderType") ?? "").trim();
  const type = String(formData?.get("type") ?? "");
  const amount = Number(formData?.get("amount"));

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!(await isImageOrPdfFile(file))) {
    return NextResponse.json(
      { error: "Envie um arquivo em PDF, PNG ou JPEG." },
      { status: 400 }
    );
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Arquivo maior que 10 MB não é permitido." },
      { status: 400 }
    );
  }
  if (!category) {
    return NextResponse.json({ error: "Escolha a categoria." }, { status: 400 });
  }
  if (!TYPES.includes(type)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Informe um valor válido." }, { status: 400 });
  }

  let blob;
  try {
    blob = await put(`comprovantes/${session.memberId}/${Date.now()}-${sanitizeFileName(file.name)}`, file, {
      access: "private",
      addRandomSuffix: true,
      token: process.env.BLOB_PRIVATE_READ_WRITE_TOKEN,
    });
  } catch {
    return NextResponse.json(
      { error: "Armazenamento de arquivos ainda não configurado." },
      { status: 500 }
    );
  }

  await sql`
    insert into contribution_receipts
      (member_id, file_name, file_url, note, category, sender_type, type, amount)
    values (
      ${session.memberId}, ${file.name}, ${blob.pathname},
      ${typeof note === "string" && note ? note : null},
      ${category}, ${senderType || null}, ${type}, ${amount}
    )
  `;

  return NextResponse.json({ ok: true });
}

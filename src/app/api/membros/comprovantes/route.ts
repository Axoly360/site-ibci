import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const receipts = await sql`
    select id, file_name, file_url, note, created_at
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

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
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

  let blob;
  try {
    blob = await put(`comprovantes/${session.memberId}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
  } catch {
    return NextResponse.json(
      { error: "Armazenamento de arquivos ainda não configurado." },
      { status: 500 }
    );
  }

  await sql`
    insert into contribution_receipts (member_id, file_name, file_url, note)
    values (${session.memberId}, ${file.name}, ${blob.url}, ${typeof note === "string" && note ? note : null})
  `;

  return NextResponse.json({ ok: true, url: blob.url });
}

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/session";

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

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Nenhuma imagem enviada." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie um arquivo de imagem." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Imagem maior que 5 MB não é permitida." },
      { status: 400 }
    );
  }

  let blob;
  try {
    blob = await put(`membros/${session.memberId}/foto-${Date.now()}`, file, {
      access: "public",
    });
  } catch {
    return NextResponse.json(
      { error: "Armazenamento de arquivos ainda não configurado." },
      { status: 500 }
    );
  }

  await sql`update members set photo_url = ${blob.url} where id = ${session.memberId}`;

  return NextResponse.json({ ok: true, url: blob.url });
}

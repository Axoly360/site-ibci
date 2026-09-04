import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Arquivo maior que 10 MB não é permitido." },
      { status: 400 }
    );
  }

  let blob;
  try {
    blob = await put(`membros/${id}/${Date.now()}-${file.name}`, file, {
      access: "public",
    });
  } catch {
    return NextResponse.json(
      { error: "Armazenamento de arquivos ainda não configurado." },
      { status: 500 }
    );
  }

  await sql`
    insert into member_files (member_id, file_name, file_url, uploaded_by)
    values (${id}, ${file.name}, ${blob.url}, ${session!.id})
  `;

  return NextResponse.json({ ok: true, url: blob.url, name: file.name });
}

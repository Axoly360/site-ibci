import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const { fileId } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "membros")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const [file] = await sql`select file_url from member_files where id = ${fileId}`;
  if (!file) {
    return NextResponse.json({ error: "Arquivo não encontrado." }, { status: 404 });
  }

  try {
    await del(file.file_url);
  } catch {
    // Segue removendo o registro mesmo se o arquivo já não existir no armazenamento.
  }

  await sql`delete from member_files where id = ${fileId}`;

  return NextResponse.json({ ok: true });
}

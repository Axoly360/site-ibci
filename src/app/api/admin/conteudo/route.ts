import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { setContent } from "@/lib/content";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : "";
  const value = typeof body?.value === "string" ? body.value : "";
  const path = typeof body?.path === "string" ? body.path : "/";

  if (!key) {
    return NextResponse.json({ error: "Chave de conteúdo ausente." }, { status: 400 });
  }

  // Rota genérica de site_content, usada por várias telas com donos
  // diferentes (Seções é Mídias, Consentimento é Secretaria/documentos) —
  // a permissão exigida depende do prefixo da chave sendo salva.
  const session = await getAdminSession();
  const requiredPermission = key.startsWith("consentimento.") ? "documentos" : "paginas";
  if (!hasPermission(session, requiredPermission)) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await setContent(key, value);
  revalidatePath(path);

  return NextResponse.json({ ok: true });
}

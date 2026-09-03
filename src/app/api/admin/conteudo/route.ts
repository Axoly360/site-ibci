import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { setContent } from "@/lib/content";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const key = typeof body?.key === "string" ? body.key : "";
  const value = typeof body?.value === "string" ? body.value : "";
  const path = typeof body?.path === "string" ? body.path : "/";

  if (!key) {
    return NextResponse.json({ error: "Chave de conteúdo ausente." }, { status: 400 });
  }

  await setContent(key, value);
  revalidatePath(path);

  return NextResponse.json({ ok: true });
}

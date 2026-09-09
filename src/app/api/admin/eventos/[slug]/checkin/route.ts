import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { performCheckin } from "@/lib/checkin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getAdminSession();
  if (!hasPermission(session, "eventos")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const { slug } = await params;
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code) {
    return NextResponse.json({ error: "Informe o código." }, { status: 400 });
  }

  const result = await performCheckin(code, session!.id, slug);

  if (result.status === "not_found") {
    return NextResponse.json({ error: "Código não encontrado." }, { status: 404 });
  }

  return NextResponse.json(result);
}

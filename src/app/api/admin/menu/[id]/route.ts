import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const href = typeof body?.href === "string" ? body.href.trim() : "";
  const value = typeof body?.value === "string" ? body.value.trim() : "";
  const visible = body?.visible !== false;

  if (!label || !href) {
    return NextResponse.json(
      { error: "Nome e link são obrigatórios." },
      { status: 400 }
    );
  }

  await sql`
    update nav_items
    set label = ${label}, href = ${href}, value = ${value || null}, visible = ${visible}
    where id = ${id}
  `;

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await sql`delete from nav_items where id = ${id}`;

  return NextResponse.json({ ok: true });
}

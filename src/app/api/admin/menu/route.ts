import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  const href = typeof body?.href === "string" ? body.href.trim() : "";
  const value = typeof body?.value === "string" ? body.value.trim() : "";
  const parentId = typeof body?.parentId === "string" ? body.parentId : null;

  if (!label || !href) {
    return NextResponse.json(
      { error: "Nome e link são obrigatórios." },
      { status: 400 }
    );
  }

  const [{ max }] = await sql`
    select coalesce(max(position), -1) as max from nav_items
    where parent_id is not distinct from ${parentId}
  `;

  await sql`
    insert into nav_items (parent_id, label, href, value, position)
    values (${parentId}, ${label}, ${href}, ${value || null}, ${max + 1})
  `;

  return NextResponse.json({ ok: true });
}

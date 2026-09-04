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
  const direction = body?.direction === "up" ? "up" : "down";

  const [item] = await sql`select parent_id, position from nav_items where id = ${id}`;
  if (!item) {
    return NextResponse.json({ error: "Item não encontrado." }, { status: 404 });
  }

  const [neighbor] =
    direction === "up"
      ? await sql`
          select id, position from nav_items
          where parent_id is not distinct from ${item.parent_id} and position < ${item.position}
          order by position desc limit 1
        `
      : await sql`
          select id, position from nav_items
          where parent_id is not distinct from ${item.parent_id} and position > ${item.position}
          order by position asc limit 1
        `;

  if (!neighbor) {
    return NextResponse.json({ ok: true }); // já está na ponta, nada a fazer
  }

  await sql`update nav_items set position = ${neighbor.position} where id = ${id}`;
  await sql`update nav_items set position = ${item.position} where id = ${neighbor.id}`;

  return NextResponse.json({ ok: true });
}

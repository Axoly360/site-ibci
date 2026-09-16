import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
  const direction = body?.direction;
  if (direction !== "up" && direction !== "down") {
    return NextResponse.json({ error: "Direção inválida." }, { status: 400 });
  }

  const [current] = await sql`select id, position from sermon_videos where id = ${id}`;
  if (!current) {
    return NextResponse.json({ error: "Vídeo não encontrado." }, { status: 404 });
  }

  const [neighbor] =
    direction === "up"
      ? await sql`
          select id, position from sermon_videos
          where position < ${current.position}
          order by position desc
          limit 1
        `
      : await sql`
          select id, position from sermon_videos
          where position > ${current.position}
          order by position asc
          limit 1
        `;

  if (!neighbor) {
    return NextResponse.json({ ok: true });
  }

  await sql`update sermon_videos set position = ${neighbor.position} where id = ${current.id}`;
  await sql`update sermon_videos set position = ${current.position} where id = ${neighbor.id}`;

  revalidatePath("/");
  revalidatePath("/para-voce/mensagens");

  return NextResponse.json({ ok: true });
}

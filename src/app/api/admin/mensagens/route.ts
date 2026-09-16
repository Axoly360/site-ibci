import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { extractYoutubeId } from "@/lib/sermonVideos";

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!hasPermission(session, "paginas")) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const link = typeof body?.link === "string" ? body.link.trim() : "";
  const title = typeof body?.title === "string" ? body.title.trim() : "";

  if (!link || !title) {
    return NextResponse.json(
      { error: "Link do vídeo e título são obrigatórios." },
      { status: 400 }
    );
  }

  const youtubeId = extractYoutubeId(link);
  if (!youtubeId) {
    return NextResponse.json(
      { error: "Não foi possível identificar o vídeo nesse link do YouTube." },
      { status: 400 }
    );
  }

  const [{ min_position }] = await sql`
    select coalesce(min(position), 1) as min_position from sermon_videos
  `;

  await sql`
    insert into sermon_videos (youtube_id, title, position)
    values (${youtubeId}, ${title}, ${min_position - 1})
  `;

  revalidatePath("/");
  revalidatePath("/para-voce/mensagens");

  return NextResponse.json({ ok: true });
}

import { sql } from "@/lib/db";

export interface SermonVideo {
  id: string;
  youtubeId: string;
  title: string;
}

/** Nunca inventa dados: se o banco falhar, devolve lista vazia. */
export async function getSermonVideos(): Promise<SermonVideo[]> {
  try {
    const rows = await sql`
      select id, youtube_id, title from sermon_videos
      order by position asc, created_at asc
    `;
    return rows.map((r: { id: string; youtube_id: string; title: string }) => ({
      id: r.id,
      youtubeId: r.youtube_id,
      title: r.title,
    }));
  } catch {
    return [];
  }
}

/**
 * Aceita um link completo do YouTube (watch, youtu.be, live, shorts) ou já
 * o próprio ID de 11 caracteres, e devolve só o ID do vídeo.
 */
export function extractYoutubeId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.slice(1).split("/")[0] || null;
    }
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return v;
      const match = url.pathname.match(/\/(live|shorts|embed)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[2];
    }
  } catch {
    return null;
  }
  return null;
}

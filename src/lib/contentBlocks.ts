import { sql } from "@/lib/db";

export interface ContentBlock {
  key: string;
  title: string | null;
  subtitle: string | null;
  image_url: string | null;
  image_mobile_url: string | null;
  video_url: string | null;
  link_url: string | null;
}

/**
 * Lê todos os blocos de conteúdo (banners/vídeos) editáveis pelo painel.
 * Se o banco falhar, devolve um mapa vazio — cada seção da home já sabe
 * cair para o conteúdo estático quando não há override.
 */
export async function getContentBlocks(): Promise<Record<string, ContentBlock>> {
  try {
    const rows = await sql`select * from content_blocks`;
    const map: Record<string, ContentBlock> = {};
    for (const row of rows) map[row.key] = row as ContentBlock;
    return map;
  } catch {
    return {};
  }
}

interface SetContentBlockInput {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  imageMobileUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
}

/**
 * Atualiza (ou cria) um bloco. Campos ausentes/undefined mantêm o valor
 * já salvo — só sobrescreve o que veio preenchido no formulário.
 */
export async function setContentBlock(key: string, input: SetContentBlockInput) {
  await sql`
    insert into content_blocks (key, title, subtitle, image_url, image_mobile_url, video_url, link_url, updated_at)
    values (${key}, ${input.title ?? null}, ${input.subtitle ?? null}, ${input.imageUrl ?? null}, ${input.imageMobileUrl ?? null}, ${input.videoUrl ?? null}, ${input.linkUrl ?? null}, now())
    on conflict (key) do update set
      title = coalesce(${input.title ?? null}, content_blocks.title),
      subtitle = coalesce(${input.subtitle ?? null}, content_blocks.subtitle),
      image_url = coalesce(${input.imageUrl ?? null}, content_blocks.image_url),
      image_mobile_url = coalesce(${input.imageMobileUrl ?? null}, content_blocks.image_mobile_url),
      video_url = coalesce(${input.videoUrl ?? null}, content_blocks.video_url),
      link_url = coalesce(${input.linkUrl ?? null}, content_blocks.link_url),
      updated_at = now()
  `;
}

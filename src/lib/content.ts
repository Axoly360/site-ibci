import { sql } from "@/lib/db";

/**
 * Lê um texto editável do painel (tabela site_content). Se o banco ainda
 * não estiver configurado ou a chave não existir, devolve o texto padrão
 * atual do site — nunca quebra a página por falta de infraestrutura.
 */
export async function getContent(key: string, fallback: string): Promise<string> {
  try {
    const [row] = await sql`select value from site_content where key = ${key}`;
    return row?.value ?? fallback;
  } catch {
    return fallback;
  }
}

export async function setContent(key: string, value: string): Promise<void> {
  await sql`
    insert into site_content (key, value, updated_at)
    values (${key}, ${value}, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
  `;
}

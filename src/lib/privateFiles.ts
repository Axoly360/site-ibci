import { del } from "@vercel/blob";

/**
 * Arquivos sensíveis migraram do Blob Store público (URL completa) para o
 * privado (guardamos só o pathname). As colunas do banco continuam com o
 * mesmo nome e podem ter os dois formatos ao mesmo tempo — linhas antigas
 * com URL, linhas novas com pathname — até o script de migração (Fase 4)
 * rodar. Este helper decide qual formato é qual sem exigir alteração de
 * schema nem quebrar os registros já existentes.
 */
export function isLegacyBlobUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

const PRIVATE_BLOB_TOKEN = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;

/** Apaga um arquivo sensível guardado como URL legada (store público) ou pathname (store privado). */
export async function deleteStoredFile(value: string): Promise<void> {
  if (isLegacyBlobUrl(value)) {
    await del(value);
  } else {
    await del(value, { token: PRIVATE_BLOB_TOKEN });
  }
}

/**
 * Gera o link para exibir/baixar um arquivo sensível a partir do valor
 * guardado no banco — URL legada (mostra direto) ou pathname novo (passa
 * pela rota autenticada /api/arquivos/[...path]). Nenhum componente deve
 * montar esse link na mão.
 */
export function resolvePrivateFileUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (isLegacyBlobUrl(value)) return value;
  return `/api/arquivos/${value}`;
}

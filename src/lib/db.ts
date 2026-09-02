import { neon } from "@neondatabase/serverless";

/**
 * Requer a env var DATABASE_URL (criada automaticamente ao conectar um
 * banco Neon/Vercel Postgres ao projeto). Ver db/schema.sql para as tabelas.
 *
 * A conexão só é criada no primeiro uso (não no import do módulo), para não
 * quebrar o build enquanto a env var ainda não existir no projeto.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: ((strings: TemplateStringsArray, ...values: any[]) => Promise<any[]>) | null =
  null;

function getClient() {
  if (!client) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL não configurado.");
    }
    client = neon(process.env.DATABASE_URL);
  }
  return client;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  return getClient()(strings, ...values);
}

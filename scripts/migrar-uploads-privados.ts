/**
 * Migra os uploads sensíveis já existentes (enviados antes da Fase 2, quando
 * ainda iam pro Blob Store público) para o Blob Store privado, e atualiza as
 * colunas do banco de URL completa para pathname — o mesmo formato que as
 * rotas já gravam para uploads novos.
 *
 * Uso:
 *   npx tsx scripts/migrar-uploads-privados.ts               (= --dry-run)
 *   npx tsx scripts/migrar-uploads-privados.ts --dry-run      apenas lista o que seria feito
 *   npx tsx scripts/migrar-uploads-privados.ts --apply        copia os arquivos e atualiza o banco
 *   npx tsx scripts/migrar-uploads-privados.ts --delete-public  apaga os originais públicos já migrados (passo separado, ver abaixo)
 *
 * Variáveis de ambiente necessárias (não são carregadas automaticamente —
 * exporte-as no shell, ou rode com `node --env-file=.env.local` se usar
 * Node 20.6+, depois de `vercel env pull .env.local`):
 *   DATABASE_URL
 *   BLOB_PRIVATE_READ_WRITE_TOKEN
 *
 * O script é idempotente: rodar --apply de novo só migra o que ainda estiver
 * com URL antiga; linhas já com pathname são ignoradas.
 *
 * --delete-public é um passo SEPARADO e intencionalmente não é chamado por
 * --apply. Só apaga um blob público se a coluna correspondente já não
 * referenciar mais aquela URL (ou seja, se a migração daquele arquivo já foi
 * confirmada no banco) e pede confirmação digitada antes de apagar qualquer
 * coisa.
 */
import { neon } from "@neondatabase/serverless";
import { put, del } from "@vercel/blob";
import { createInterface } from "node:readline/promises";

const DATABASE_URL = process.env.DATABASE_URL;
const PRIVATE_TOKEN = process.env.BLOB_PRIVATE_READ_WRITE_TOKEN;

if (!DATABASE_URL) {
  console.error("Defina DATABASE_URL antes de rodar este script.");
  process.exit(1);
}
if (!PRIVATE_TOKEN) {
  console.error("Defina BLOB_PRIVATE_READ_WRITE_TOKEN antes de rodar este script.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const deletePublic = args.includes("--delete-public");
const dryRun = !apply && !deletePublic;

interface TableSpec {
  table: string;
  idColumn: string;
  urlColumn: string;
  label: string;
}

// Os 5 pontos que armazenam arquivo sensível — mesmos da Fase 2.
const SPECS: TableSpec[] = [
  { table: "members", idColumn: "id", urlColumn: "photo_url", label: "members.photo_url" },
  { table: "member_files", idColumn: "id", urlColumn: "file_url", label: "member_files.file_url" },
  {
    table: "contribution_receipts",
    idColumn: "id",
    urlColumn: "file_url",
    label: "contribution_receipts.file_url",
  },
  {
    table: "financial_entries",
    idColumn: "id",
    urlColumn: "receipt_url",
    label: "financial_entries.receipt_url",
  },
  {
    table: "congregation_financial_submissions",
    idColumn: "id",
    urlColumn: "receipt_url",
    label: "congregation_financial_submissions.receipt_url",
  },
];

function isLegacyUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/** Extrai o pathname (sem domínio nem barra inicial) de uma URL do Blob Store público. */
function pathnameFromUrl(value: string): string {
  return new URL(value).pathname.replace(/^\/+/, "");
}

interface Report {
  label: string;
  totalLegado: number;
  copiados: number;
  atualizados: number;
  erros: { id: string; erro: string }[];
}

async function migrarTabela(spec: TableSpec): Promise<Report> {
  const report: Report = { label: spec.label, totalLegado: 0, copiados: 0, atualizados: 0, erros: [] };

  const rows = (await sql(
    `select ${spec.idColumn} as id, ${spec.urlColumn} as url from ${spec.table} where ${spec.urlColumn} is not null`
  )) as { id: string; url: string }[];

  const legados = rows.filter((r) => isLegacyUrl(r.url));
  report.totalLegado = legados.length;

  for (const row of legados) {
    const pathname = pathnameFromUrl(row.url);
    console.log(`[${spec.label}] ${dryRun ? "(dry-run) " : ""}${row.id} -> ${pathname}`);

    if (dryRun) continue;

    try {
      const resposta = await fetch(row.url);
      if (!resposta.ok) {
        throw new Error(`download falhou (${resposta.status})`);
      }
      const bytes = await resposta.arrayBuffer();
      await put(pathname, Buffer.from(bytes), {
        access: "private",
        token: PRIVATE_TOKEN,
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: resposta.headers.get("content-type") ?? undefined,
      });
      report.copiados += 1;

      // Só atualiza se a coluna ainda tiver o mesmo valor legado — evita
      // sobrescrever uma edição feita por alguém entre a leitura e agora.
      const [updated] = (await sql(
        `update ${spec.table} set ${spec.urlColumn} = $1 where ${spec.idColumn} = $2 and ${spec.urlColumn} = $3 returning ${spec.idColumn}`,
        [pathname, row.id, row.url]
      )) as { id: string }[];
      if (updated) report.atualizados += 1;
    } catch (err) {
      report.erros.push({ id: row.id, erro: err instanceof Error ? err.message : String(err) });
    }
  }

  return report;
}

async function apagarPublicosJaMigrados() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  console.log(
    "\nATENÇÃO: isto apaga os arquivos originais do Blob Store PÚBLICO cujas linhas no banco\n" +
      "já apontam para o pathname privado (ou seja, já foram migradas e confirmadas).\n" +
      "Um arquivo só é apagado se NENHUMA linha ainda referenciar sua URL pública antiga.\n"
  );
  const resposta = await rl.question('Digite "APAGAR" para confirmar: ');
  rl.close();
  if (resposta.trim() !== "APAGAR") {
    console.log("Cancelado — nada foi apagado.");
    return;
  }

  // Precisa saber, para cada linha JÁ migrada (valor = pathname), qual era a
  // URL pública original. Como a coluna já foi sobrescrita com o pathname na
  // Fase de --apply, isso só é possível reconstruindo a URL a partir do
  // pathname + domínio do store público — por isso pedimos o domínio aqui.
  const rl2 = createInterface({ input: process.stdin, output: process.stdout });
  const publicBase = (
    await rl2.question(
      "Domínio do Blob Store PÚBLICO (ex.: https://xxxxx.public.blob.vercel-storage.com): "
    )
  ).trim().replace(/\/+$/, "");
  rl2.close();

  for (const spec of SPECS) {
    const rows = (await sql(
      `select ${spec.urlColumn} as pathname from ${spec.table} where ${spec.urlColumn} is not null`
    )) as { pathname: string }[];
    const jaMigrados = rows.filter((r) => !isLegacyUrl(r.pathname));

    for (const row of jaMigrados) {
      const publicUrl = `${publicBase}/${row.pathname}`;
      // Confere de novo, agora, que nenhuma linha (em nenhuma tabela) ainda
      // aponta pra essa URL pública — proteção extra contra corrida com um
      // --apply rodando em paralelo.
      let aindaReferenciado = false;
      for (const outraSpec of SPECS) {
        const [match] = (await sql(
          `select 1 from ${outraSpec.table} where ${outraSpec.urlColumn} = $1 limit 1`,
          [publicUrl]
        )) as unknown[];
        if (match) {
          aindaReferenciado = true;
          break;
        }
      }
      if (aindaReferenciado) {
        console.log(`[pular] ${publicUrl} ainda referenciado por alguma linha — não apagado.`);
        continue;
      }
      try {
        await del(publicUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
        console.log(`[apagado] ${publicUrl}`);
      } catch (err) {
        console.log(`[erro] ${publicUrl}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }
}

async function main() {
  console.log(
    dryRun
      ? "Modo --dry-run: só mostra o que seria migrado, nada é alterado.\n"
      : deletePublic
        ? "Modo --delete-public.\n"
        : "Modo --apply: vai copiar arquivos e atualizar o banco.\n"
  );

  if (deletePublic) {
    await apagarPublicosJaMigrados();
    return;
  }

  const relatorios: Report[] = [];
  for (const spec of SPECS) {
    relatorios.push(await migrarTabela(spec));
  }

  console.log("\n=== Relatório ===");
  for (const r of relatorios) {
    console.log(
      `${r.label}: ${r.totalLegado} com URL antiga | ${r.copiados} copiados | ${r.atualizados} linhas atualizadas | ${r.erros.length} erro(s)`
    );
    for (const e of r.erros) {
      console.log(`   - erro em ${e.id}: ${e.erro}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import Card from "@/components/ui/Card";
import CongregacaoLancamentoForm from "@/components/congregacoes/CongregacaoLancamentoForm";
import { getCongregationSession } from "@/lib/congregation-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Prestação de Contas | Congregação IBCI",
  robots: { index: false, follow: false },
};

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const STATUS_LABEL: Record<string, string> = {
  pendente: "Aguardando análise",
  aprovado: "Aprovado",
};

export default async function CongregacaoFinanceiroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getCongregationSession();
  if (!session || session.congregationSlug !== slug) {
    redirect(`/congregacoes/${slug}/entrar`);
  }

  const [congregation] = await sql`
    select annual_budget from congregations where id = ${session.congregationId}
  `;
  const annualBudget =
    congregation?.annual_budget !== null && congregation?.annual_budget !== undefined
      ? Number(congregation.annual_budget)
      : null;

  const currentYear = new Date().getFullYear();
  // Balanço só com o que já foi aprovado pela central (financial_entries é o
  // livro-caixa oficial) — o que ainda está pendente não conta pro saldo nem
  // consome o orçamento até ser revisado.
  const aprovadosDoAno = await sql`
    select type, amount from financial_entries
    where congregation_id = ${session.congregationId}
      and entry_date >= ${`${currentYear}-01-01`} and entry_date <= ${`${currentYear}-12-31`}
  `;

  let entradasAno = 0;
  let saidasAno = 0;
  for (const entry of aprovadosDoAno) {
    if (entry.type === "entrada") entradasAno += Number(entry.amount);
    else saidasAno += Number(entry.amount);
  }
  const saldoAno = entradasAno - saidasAno;
  const orcamentoDisponivel = annualBudget !== null ? annualBudget - saidasAno : null;

  const lancamentos = await sql`
    select id, type, category, amount, entry_date, description, receipt_url, status
    from congregation_financial_submissions
    where congregation_id = ${session.congregationId}
    order by entry_date desc, created_at desc
    limit 30
  `;

  return (
    <div className="bg-bg-light">
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Prestação de Contas
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            {session.congregationName}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href={`/congregacoes/${slug}/painel`}
          className="inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para o painel
        </Link>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card className="p-5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
              Entradas ({currentYear})
            </span>
            <p className="mt-2 font-heading text-xl font-bold text-primary">
              {formatCurrency(entradasAno)}
            </p>
          </Card>
          <Card className="p-5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
              Saídas ({currentYear})
            </span>
            <p className="mt-2 font-heading text-xl font-bold text-red-600">
              {formatCurrency(saidasAno)}
            </p>
          </Card>
          <Card className="p-5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
              Saldo
            </span>
            <p
              className={`mt-2 font-heading text-xl font-bold ${
                saldoAno >= 0 ? "text-primary" : "text-red-600"
              }`}
            >
              {formatCurrency(saldoAno)}
            </p>
          </Card>
          <Card className="p-5 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
              Orçamento Disponível
            </span>
            <p className="mt-2 font-heading text-xl font-bold text-secondary">
              {orcamentoDisponivel !== null ? formatCurrency(orcamentoDisponivel) : "—"}
            </p>
            {annualBudget === null && (
              <p className="mt-1 text-xs text-text-neutral/50">
                Orçamento anual ainda não definido pela central.
              </p>
            )}
          </Card>
        </div>

        <CongregacaoLancamentoForm slug={slug} />

        <Card className="p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-primary">
            Últimos lançamentos
          </h2>
          {lancamentos.length === 0 ? (
            <p className="text-sm text-text-neutral/60">Nenhum lançamento ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4">Categoria</th>
                    <th className="py-2 pr-4">Descrição</th>
                    <th className="py-2 pr-4">Comprovante</th>
                    <th className="py-2 pr-4 text-right">Valor</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentos.map((entry) => (
                    <tr key={entry.id} className="border-b border-black/5">
                      <td className="py-3 pr-4 text-text-neutral/80">
                        {formatDate(entry.entry_date)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`font-semibold ${
                            entry.type === "entrada" ? "text-primary" : "text-red-600"
                          }`}
                        >
                          {entry.type === "entrada" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/80">{entry.category}</td>
                      <td className="py-3 pr-4 text-text-neutral/70">
                        {entry.description || "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {entry.receipt_url ? (
                          <a
                            href={entry.receipt_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-semibold text-secondary hover:underline"
                          >
                            <FileText className="h-4 w-4 shrink-0" />
                            Ver
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-text-neutral">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`text-xs font-semibold ${
                            entry.status === "aprovado" ? "text-primary" : "text-secondary"
                          }`}
                        >
                          {STATUS_LABEL[entry.status] ?? entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

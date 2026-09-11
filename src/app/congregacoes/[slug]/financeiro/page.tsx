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

  const lancamentos = await sql`
    select id, type, category, amount, entry_date, description, receipt_url
    from financial_entries
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

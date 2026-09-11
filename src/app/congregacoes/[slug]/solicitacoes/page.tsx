import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";
import SolicitacaoForm from "@/components/congregacoes/SolicitacaoForm";
import { getCongregationSession } from "@/lib/congregation-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Solicitações | Congregação IBCI",
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<string, string> = {
  pendente: "Aguardando análise",
  aprovado: "Aprovado",
  recusado: "Recusado",
};

function formatCurrency(value: string | null) {
  if (!value) return "—";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function CongregacaoSolicitacoesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getCongregationSession();
  if (!session || session.congregationSlug !== slug) {
    redirect(`/congregacoes/${slug}/entrar`);
  }

  const solicitacoes = await sql`
    select id, category, description, estimated_amount, status, requested_at, response_note
    from congregation_requests
    where congregation_id = ${session.congregationId}
    order by requested_at desc
  `;

  return (
    <div className="bg-bg-light">
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Solicitações
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

        <SolicitacaoForm slug={slug} />

        <Card className="p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-primary">
            Histórico
          </h2>
          {solicitacoes.length === 0 ? (
            <p className="text-sm text-text-neutral/60">Nenhuma solicitação enviada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Categoria</th>
                    <th className="py-2 pr-4">Descrição</th>
                    <th className="py-2 pr-4 text-right">Valor est.</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitacoes.map((s) => (
                    <tr key={s.id} className="border-b border-black/5 align-top">
                      <td className="py-3 pr-4 text-text-neutral/80">
                        {formatDate(s.requested_at)}
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/80">{s.category}</td>
                      <td className="py-3 pr-4 text-text-neutral/70">{s.description}</td>
                      <td className="py-3 pr-4 text-right text-text-neutral/80">
                        {formatCurrency(s.estimated_amount)}
                      </td>
                      <td className="py-3 pr-4">
                        <div
                          className={`font-semibold ${
                            s.status === "aprovado"
                              ? "text-primary"
                              : s.status === "recusado"
                                ? "text-red-600"
                                : "text-secondary"
                          }`}
                        >
                          {STATUS_LABEL[s.status] ?? s.status}
                        </div>
                        {s.response_note && (
                          <div className="mt-0.5 text-xs text-text-neutral/60">
                            {s.response_note}
                          </div>
                        )}
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

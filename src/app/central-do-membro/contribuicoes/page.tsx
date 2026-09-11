import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";
import ContributionSummary from "@/components/membros/ContributionSummary";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Contribuições e Saídas | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function MinhasContribuicoesPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");

  // Só busca lançamentos vinculados ao próprio membro logado — o memberId
  // vem da sessão assinada no servidor, nunca de um parâmetro do client.
  // Inclui entradas (contribuições) e saídas que o membro solicitou (ex.:
  // reembolso de despesa), quando a tesouraria vinculou o lançamento a ele.
  const lancamentos = await sql`
    select id, type, category, amount, entry_date, description
    from financial_entries
    where member_id = ${session.memberId}
    order by entry_date desc
  `;

  const contribuicoes = lancamentos.filter((c) => c.type === "entrada");

  const currentYear = new Date().getFullYear();
  const doAnoAtual = contribuicoes.filter(
    (c) => new Date(c.entry_date).getUTCFullYear() === currentYear
  );
  const totalAnoAtual = doAnoAtual.reduce((sum, c) => sum + Number(c.amount), 0);

  return (
    <div className="bg-bg-light">
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Contribuições e Saídas
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Contribuições e saídas registradas em seu nome pela tesouraria da
            igreja.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        <ContributionSummary
          memberName={session.name}
          year={currentYear}
          total={totalAnoAtual}
          count={doAnoAtual.length}
        />

        <Card className="p-6">
          <h2 className="mb-1 font-heading text-lg font-semibold text-primary">
            Histórico completo
          </h2>
          <p className="mb-4 text-sm text-text-neutral/60">
            Só aparecem aqui os lançamentos que a tesouraria registrou com
            vínculo ao seu cadastro — inclui contribuições e saídas
            solicitadas por você (ex.: reembolso de despesa).
          </p>

          {lancamentos.length === 0 ? (
            <p className="text-sm text-text-neutral/60">
              Nenhum lançamento registrado em seu nome até o momento.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4">Categoria</th>
                    <th className="py-2 pr-4">Descrição</th>
                    <th className="py-2 pr-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentos.map((c) => (
                    <tr key={c.id} className="border-b border-black/5">
                      <td className="py-3 pr-4 text-text-neutral/80">
                        {formatDate(c.entry_date)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`font-semibold ${
                            c.type === "entrada" ? "text-primary" : "text-red-600"
                          }`}
                        >
                          {c.type === "entrada" ? "Entrada" : "Saída"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/80">{c.category}</td>
                      <td className="py-3 pr-4 text-text-neutral/70">
                        {c.description || "—"}
                      </td>
                      <td className="py-3 pr-4 text-right font-semibold text-text-neutral">
                        {formatCurrency(c.amount)}
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

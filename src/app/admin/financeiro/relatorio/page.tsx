import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Relatório Financeiro | Painel IBCI",
  robots: { index: false, follow: false },
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Início do período com base num preset, em horário local (não UTC). */
function presetRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const to = todayISO();

  if (preset === "semana") {
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    return { from: from.toISOString().slice(0, 10), to };
  }
  if (preset === "mes") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: from.toISOString().slice(0, 10), to };
  }
  if (preset === "ano") {
    const from = new Date(now.getFullYear(), 0, 1);
    return { from: from.toISOString().slice(0, 10), to };
  }
  // "dia" (padrão)
  return { from: to, to };
}

export default async function AdminFinanceiroRelatorioPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string; congregacao?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "financeiro")) redirect("/admin");

  const params = await searchParams;
  const preset = params.preset || "mes";
  const range = params.from && params.to ? { from: params.from, to: params.to } : presetRange(preset);
  const congregacaoFiltro = params.congregacao || "";

  const congregacoes = await sql`select slug, name from congregations order by name asc`;

  // "sede" = só lançamentos sem congregação (congregation_id is null); um
  // slug específico filtra só aquela congregação; vazio = todos, sem filtro.
  const entries =
    congregacaoFiltro === "sede"
      ? await sql`
          select type, category, amount
          from financial_entries
          where entry_date >= ${range.from} and entry_date <= ${range.to}
            and congregation_id is null
        `
      : congregacaoFiltro
        ? await sql`
            select financial_entries.type, financial_entries.category, financial_entries.amount
            from financial_entries
            join congregations on congregations.id = financial_entries.congregation_id
            where financial_entries.entry_date >= ${range.from} and financial_entries.entry_date <= ${range.to}
              and congregations.slug = ${congregacaoFiltro}
          `
        : await sql`
            select type, category, amount
            from financial_entries
            where entry_date >= ${range.from} and entry_date <= ${range.to}
          `;

  let totalEntradas = 0;
  let totalSaidas = 0;
  const porCategoria = new Map<string, { entrada: number; saida: number }>();

  for (const entry of entries) {
    const amount = Number(entry.amount);
    const current = porCategoria.get(entry.category) ?? { entrada: 0, saida: 0 };
    if (entry.type === "entrada") {
      totalEntradas += amount;
      current.entrada += amount;
    } else {
      totalSaidas += amount;
      current.saida += amount;
    }
    porCategoria.set(entry.category, current);
  }

  const saldo = totalEntradas - totalSaidas;
  const csvQuery = new URLSearchParams({
    from: range.from,
    to: range.to,
    ...(congregacaoFiltro ? { congregacao: congregacaoFiltro } : {}),
  }).toString();

  const presets = [
    { key: "dia", label: "Hoje" },
    { key: "semana", label: "Últimos 7 dias" },
    { key: "mes", label: "Este mês" },
    { key: "ano", label: "Este ano" },
  ];

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Relatório Financeiro"
        description={`Período: ${range.from} a ${range.to}`}
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/financeiro"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para Financeiro
        </Link>

        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Link
                key={p.key}
                href={`/admin/financeiro/relatorio?preset=${p.key}`}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  preset === p.key && !params.from
                    ? "bg-primary text-white"
                    : "border border-black/10 text-text-neutral/70 hover:border-primary/40"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          <form className="flex flex-wrap items-end gap-3" method="get">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                De
              </label>
              <input
                type="date"
                name="from"
                defaultValue={range.from}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Até
              </label>
              <input
                type="date"
                name="to"
                defaultValue={range.to}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Congregação
              </label>
              <select
                name="congregacao"
                defaultValue={congregacaoFiltro}
                className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-text-neutral"
              >
                <option value="">Todas</option>
                <option value="sede">Só a sede</option>
                {congregacoes.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-full bg-secondary px-5 py-2 text-sm font-bold text-primary hover:bg-secondary-light"
            >
              Filtrar
            </button>
          </form>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-6 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
              Entradas
            </span>
            <p className="mt-2 font-heading text-2xl font-bold text-primary">
              {formatCurrency(totalEntradas)}
            </p>
          </Card>
          <Card className="p-6 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
              Saídas
            </span>
            <p className="mt-2 font-heading text-2xl font-bold text-red-600">
              {formatCurrency(totalSaidas)}
            </p>
          </Card>
          <Card className="p-6 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
              Saldo
            </span>
            <p
              className={`mt-2 font-heading text-2xl font-bold ${
                saldo >= 0 ? "text-primary" : "text-red-600"
              }`}
            >
              {formatCurrency(saldo)}
            </p>
          </Card>
        </div>

        <Card className="mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-primary">
              Por categoria
            </h2>
            <a
              href={`/api/admin/financeiro/relatorio/csv?${csvQuery}`}
              className="text-sm font-semibold text-secondary hover:underline"
            >
              Exportar CSV
            </a>
          </div>
          {porCategoria.size === 0 ? (
            <p className="text-sm text-text-neutral/60">
              Nenhum lançamento no período selecionado.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                  <th className="py-2 pr-4">Categoria</th>
                  <th className="py-2 pr-4 text-right">Entradas</th>
                  <th className="py-2 pr-4 text-right">Saídas</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(porCategoria.entries()).map(([categoria, valores]) => (
                  <tr key={categoria} className="border-b border-black/5">
                    <td className="py-3 pr-4 text-text-neutral">{categoria}</td>
                    <td className="py-3 pr-4 text-right text-primary">
                      {valores.entrada > 0 ? formatCurrency(valores.entrada) : "—"}
                    </td>
                    <td className="py-3 pr-4 text-right text-red-600">
                      {valores.saida > 0 ? formatCurrency(valores.saida) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
}

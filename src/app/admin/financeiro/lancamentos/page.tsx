import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import LancamentoForm from "@/components/admin/LancamentoForm";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Lançamentos | Painel IBCI",
  robots: { index: false, follow: false },
};

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default async function AdminLancamentosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "financeiro")) redirect("/admin");

  const members = await sql`
    select id, name, email from members order by name asc
  `;

  const recentes = await sql`
    select financial_entries.id, financial_entries.type, financial_entries.category,
           financial_entries.amount, financial_entries.entry_date,
           financial_entries.description, members.name as member_name
    from financial_entries
    left join members on members.id = financial_entries.member_id
    order by financial_entries.entry_date desc, financial_entries.created_at desc
    limit 20
  `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Lançamentos"
        description="Registre entradas e saídas financeiras manualmente."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/financeiro"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para Financeiro
        </Link>

        <LancamentoForm members={members} />

        <Card className="mt-10 p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-primary">
            Últimos lançamentos
          </h2>
          {recentes.length === 0 ? (
            <p className="text-sm text-text-neutral/60">Nenhum lançamento ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4">Categoria</th>
                    <th className="py-2 pr-4">Membro</th>
                    <th className="py-2 pr-4">Descrição</th>
                    <th className="py-2 pr-4 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((entry) => (
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
                      <td className="py-3 pr-4 text-text-neutral/80">
                        {entry.member_name || "—"}
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/70">
                        {entry.description || "—"}
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

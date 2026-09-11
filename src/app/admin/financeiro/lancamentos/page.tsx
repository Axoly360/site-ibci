import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
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

export default async function AdminLancamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ comprovanteId?: string; congregacaoSubmissaoId?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "financeiro")) redirect("/admin");

  const { comprovanteId, congregacaoSubmissaoId } = await searchParams;

  const members = await sql`
    select id, name, email from members order by name asc
  `;

  let initialComprovante = null;
  if (comprovanteId) {
    const [receipt] = await sql`
      select contribution_receipts.id, contribution_receipts.type, contribution_receipts.category,
             contribution_receipts.amount, contribution_receipts.note, contribution_receipts.sender_type,
             contribution_receipts.member_id, contribution_receipts.file_url, contribution_receipts.status,
             members.name as member_name
      from contribution_receipts
      join members on members.id = contribution_receipts.member_id
      where contribution_receipts.id = ${comprovanteId}
    `;
    // Se já foi lançado (status = aprovado) não pré-preenche de novo — evita
    // duplicar o lançamento se o link for reaberto.
    if (receipt && receipt.status !== "aprovado") {
      initialComprovante = {
        id: receipt.id,
        type: receipt.type as "entrada" | "saida",
        category: receipt.category as string,
        amount: String(receipt.amount),
        description: [
          receipt.sender_type && receipt.sender_type !== "Membro"
            ? `Enviado como: ${receipt.sender_type}`
            : null,
          receipt.note,
        ]
          .filter(Boolean)
          .join(" — "),
        // Mantém o vínculo com o membro mesmo em saídas (ex.: reembolso de
        // despesa que o próprio membro solicitou via comprovante).
        memberId: receipt.member_id as string,
        memberName: receipt.member_name as string,
        fileUrl: receipt.file_url as string,
      };
    }
  }

  if (congregacaoSubmissaoId) {
    const [submissao] = await sql`
      select congregation_financial_submissions.id, congregation_financial_submissions.type,
             congregation_financial_submissions.category, congregation_financial_submissions.amount,
             congregation_financial_submissions.description, congregation_financial_submissions.receipt_url,
             congregation_financial_submissions.status, congregation_financial_submissions.congregation_id,
             congregation_financial_submissions.congregation_user_id,
             congregations.name as congregation_name
      from congregation_financial_submissions
      join congregations on congregations.id = congregation_financial_submissions.congregation_id
      where congregation_financial_submissions.id = ${congregacaoSubmissaoId}
    `;
    // Mesma cautela do comprovante: se já foi lançado, não pré-preenche de
    // novo (evita duplicar caso o link seja reaberto).
    if (submissao && submissao.status !== "aprovado") {
      initialComprovante = {
        kind: "congregacao",
        id: submissao.id,
        type: submissao.type as "entrada" | "saida",
        category: submissao.category as string,
        amount: String(submissao.amount),
        description: submissao.description ?? "",
        memberId: null,
        memberName: submissao.congregation_name as string,
        fileUrl: submissao.receipt_url as string,
        congregationId: submissao.congregation_id as string,
        congregationUserId: submissao.congregation_user_id as string,
      };
    }
  }

  const recentes = await sql`
    select financial_entries.id, financial_entries.type, financial_entries.category,
           financial_entries.amount, financial_entries.entry_date,
           financial_entries.description, financial_entries.requested_by,
           financial_entries.receipt_url, members.name as member_name,
           congregations.name as congregation_name
    from financial_entries
    left join members on members.id = financial_entries.member_id
    left join congregations on congregations.id = financial_entries.congregation_id
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

        <LancamentoForm members={members} initialComprovante={initialComprovante} />

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
                    <th className="py-2 pr-4">Membro/Solicitante</th>
                    <th className="py-2 pr-4">Congregação</th>
                    <th className="py-2 pr-4">Descrição</th>
                    <th className="py-2 pr-4">Comprovante</th>
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
                        {entry.type === "saida"
                          ? entry.requested_by || entry.member_name || "—"
                          : entry.member_name || "—"}
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/70">
                        {entry.congregation_name || "Sede"}
                      </td>
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

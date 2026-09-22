import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import LancamentoForm, { type InitialComprovante } from "@/components/admin/LancamentoForm";
import LancamentoActions from "@/components/admin/LancamentoActions";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { resolvePrivateFileUrl } from "@/lib/privateFiles";

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
  searchParams: Promise<{
    comprovanteId?: string;
    congregacaoSubmissaoId?: string;
    nome?: string;
    cpf?: string;
    congregacao?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "financeiro")) redirect("/admin");

  const { comprovanteId, congregacaoSubmissaoId, ...filtroParams } = await searchParams;
  const nome = filtroParams.nome?.trim() || null;
  const cpf = filtroParams.cpf?.trim() || null;
  const from = filtroParams.from || null;
  const to = filtroParams.to || null;
  const congregacaoFiltro = filtroParams.congregacao || "";
  const filtroAtivo = Boolean(nome || cpf || from || to || congregacaoFiltro);

  const members = await sql`
    select id, name, email from members order by name asc
  `;

  let initialComprovante: InitialComprovante | null = null;
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

  const congregacoes = await sql`select slug, name from congregations order by name asc`;

  // Sem filtro: só os 20 mais recentes. Com filtro, é uma busca — mostra mais
  // resultados (até 200) em vez do recorte fixo de "últimos lançamentos".
  const limit = filtroAtivo ? 200 : 20;

  // "sede" = só lançamentos sem congregação (congregation_id is null); um
  // slug específico filtra só aquela congregação; vazio = todos, sem filtro
  // (mesma convenção usada em /admin/financeiro/relatorio).
  const recentes =
    congregacaoFiltro === "sede"
      ? await sql`
          select financial_entries.id, financial_entries.type, financial_entries.category,
                 financial_entries.amount, financial_entries.entry_date,
                 financial_entries.description, financial_entries.requested_by,
                 financial_entries.receipt_url, members.name as member_name,
                 members.cpf as member_cpf, congregations.name as congregation_name
          from financial_entries
          left join members on members.id = financial_entries.member_id
          left join congregations on congregations.id = financial_entries.congregation_id
          where financial_entries.congregation_id is null
            and (${nome}::text is null or members.name ilike '%' || ${nome} || '%' or financial_entries.requested_by ilike '%' || ${nome} || '%')
            and (${cpf}::text is null or members.cpf ilike '%' || ${cpf} || '%')
            and (${from}::text is null or financial_entries.entry_date >= ${from}::text)
            and (${to}::text is null or financial_entries.entry_date <= ${to}::text)
          order by financial_entries.entry_date desc, financial_entries.created_at desc
          limit ${limit}
        `
      : congregacaoFiltro
        ? await sql`
            select financial_entries.id, financial_entries.type, financial_entries.category,
                   financial_entries.amount, financial_entries.entry_date,
                   financial_entries.description, financial_entries.requested_by,
                   financial_entries.receipt_url, members.name as member_name,
                   members.cpf as member_cpf, congregations.name as congregation_name
            from financial_entries
            left join members on members.id = financial_entries.member_id
            join congregations on congregations.id = financial_entries.congregation_id
            where congregations.slug = ${congregacaoFiltro}
              and (${nome}::text is null or members.name ilike '%' || ${nome} || '%' or financial_entries.requested_by ilike '%' || ${nome} || '%')
              and (${cpf}::text is null or members.cpf ilike '%' || ${cpf} || '%')
              and (${from}::text is null or financial_entries.entry_date >= ${from}::text)
              and (${to}::text is null or financial_entries.entry_date <= ${to}::text)
            order by financial_entries.entry_date desc, financial_entries.created_at desc
            limit ${limit}
          `
        : await sql`
            select financial_entries.id, financial_entries.type, financial_entries.category,
                   financial_entries.amount, financial_entries.entry_date,
                   financial_entries.description, financial_entries.requested_by,
                   financial_entries.receipt_url, members.name as member_name,
                   members.cpf as member_cpf, congregations.name as congregation_name
            from financial_entries
            left join members on members.id = financial_entries.member_id
            left join congregations on congregations.id = financial_entries.congregation_id
            where (${nome}::text is null or members.name ilike '%' || ${nome} || '%' or financial_entries.requested_by ilike '%' || ${nome} || '%')
              and (${cpf}::text is null or members.cpf ilike '%' || ${cpf} || '%')
              and (${from}::text is null or financial_entries.entry_date >= ${from}::text)
              and (${to}::text is null or financial_entries.entry_date <= ${to}::text)
            order by financial_entries.entry_date desc, financial_entries.created_at desc
            limit ${limit}
          `;
  for (const entry of recentes) entry.receipt_url = resolvePrivateFileUrl(entry.receipt_url);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Lançamentos"
        description="Registre entradas e saídas financeiras manualmente."
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/financeiro"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para Financeiro
        </Link>

        <div className="mx-auto max-w-2xl">
          <LancamentoForm members={members} initialComprovante={initialComprovante} />
        </div>

        <Card className="mt-10 p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-primary">
            Comprovantes de entradas e saídas
          </h2>

          <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Nome (membro ou solicitante)
              </label>
              <input
                type="text"
                name="nome"
                defaultValue={nome ?? ""}
                placeholder="Buscar por nome"
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                defaultValue={cpf ?? ""}
                placeholder="Buscar por CPF"
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
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                De
              </label>
              <input
                type="date"
                name="from"
                defaultValue={from ?? ""}
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
                defaultValue={to ?? ""}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-secondary px-5 py-2 text-sm font-bold text-primary hover:bg-secondary-light"
            >
              Filtrar
            </button>
            {filtroAtivo && (
              <Link
                href="/admin/financeiro/lancamentos"
                className="text-sm font-semibold text-text-neutral/60 hover:underline"
              >
                Limpar filtros
              </Link>
            )}
          </form>

          {filtroAtivo && (
            <div className="mb-4 text-sm font-semibold text-text-neutral/70">
              {recentes.length}{" "}
              {recentes.length === 1 ? "comprovante encontrado" : "comprovantes encontrados"}
            </div>
          )}

          {recentes.length === 0 ? (
            <p className="text-sm text-text-neutral/60">
              {filtroAtivo
                ? "Nenhum lançamento encontrado para esse filtro."
                : "Nenhum lançamento ainda."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Tipo</th>
                    <th className="py-2 pr-4">Categoria</th>
                    <th className="py-2 pr-4">Membro/Solicitante</th>
                    <th className="py-2 pr-4">CPF</th>
                    <th className="py-2 pr-4">Congregação</th>
                    <th className="py-2 pr-4">Descrição</th>
                    <th className="py-2 pr-4">Comprovante</th>
                    <th className="py-2 pr-4 text-right">Valor</th>
                    <th className="py-2 pr-4">Ações</th>
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
                        {entry.member_cpf || "—"}
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
                      <td className="py-3 pr-4">
                        <LancamentoActions
                          entry={{
                            id: entry.id,
                            type: entry.type,
                            category: entry.category,
                            amount: entry.amount,
                            entry_date: entry.entry_date,
                            description: entry.description,
                            requested_by: entry.requested_by,
                          }}
                        />
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

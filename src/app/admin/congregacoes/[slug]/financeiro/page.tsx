import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import CongregationFinanceiroManager from "@/components/admin/CongregationFinanceiroManager";
import CongregationBudgetForm from "@/components/admin/CongregationBudgetForm";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { resolvePrivateFileUrl } from "@/lib/privateFiles";

export const metadata: Metadata = {
  title: "Financeiro da Congregação | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminCongregacaoFinanceiroPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  // Precisa ser "financeiro" (não "congregacoes") porque quem revisa aqui
  // é quem consegue de fato confirmar o lançamento na tela seguinte — a API
  // de lançamentos só aceita essa permissão.
  if (!hasPermission(session, "financeiro")) redirect("/admin");

  const { slug } = await params;
  const [congregation] = await sql`
    select id, name, annual_budget from congregations where slug = ${slug}
  `;
  if (!congregation) notFound();

  const submissoes = await sql`
    select id, type, category, amount, entry_date, description, receipt_url, status
    from congregation_financial_submissions
    where congregation_id = ${congregation.id}
    order by (status = 'pendente') desc, entry_date desc
  `;
  for (const s of submissoes) s.receipt_url = resolvePrivateFileUrl(s.receipt_url);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner title="Financeiro da Congregação" description={congregation.name} />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-4">
          <Link
            href="/admin/congregacoes"
            className="text-sm font-semibold text-secondary hover:underline"
          >
            ← Voltar para Congregações
          </Link>
          <Link
            href={`/admin/financeiro/relatorio?congregacao=${slug}`}
            className="text-sm font-semibold text-secondary hover:underline"
          >
            Ver relatório consolidado
          </Link>
        </div>
        <CongregationBudgetForm
          slug={slug}
          currentBudget={congregation.annual_budget !== null ? Number(congregation.annual_budget) : null}
        />
        <CongregationFinanceiroManager slug={slug} submissoes={submissoes} />
      </div>
    </div>
  );
}

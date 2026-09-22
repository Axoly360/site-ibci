import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Send } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import ComprovantesManager from "@/components/admin/ComprovantesManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { resolvePrivateFileUrl } from "@/lib/privateFiles";

export const metadata: Metadata = {
  title: "Financeiro | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminFinanceiroPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "financeiro")) redirect("/admin");

  const comprovantes = await sql`
    select contribution_receipts.id, contribution_receipts.file_name,
           contribution_receipts.file_url, contribution_receipts.note,
           contribution_receipts.category, contribution_receipts.sender_type,
           contribution_receipts.type, contribution_receipts.amount,
           contribution_receipts.status, contribution_receipts.created_at,
           coalesce(members.name, 'Membro excluído') as name, members.email
    from contribution_receipts
    left join members on members.id = contribution_receipts.member_id
    order by (contribution_receipts.status = 'pendente') desc, contribution_receipts.created_at desc
  `;
  for (const c of comprovantes) c.file_url = resolvePrivateFileUrl(c.file_url);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Financeiro"
        description="Comprovantes de dízimos e ofertas enviados pelos membros."
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link href="/admin/financeiro/lancamentos">
            <Card className="flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Send className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-base font-semibold text-primary">
                  Lançamentos
                </h2>
                <p className="text-sm text-text-neutral/70">
                  Registrar entradas e saídas manualmente.
                </p>
              </div>
            </Card>
          </Link>
          <Link href="/admin/financeiro/relatorio">
            <Card className="flex items-center gap-3 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-heading text-base font-semibold text-primary">
                  Relatório
                </h2>
                <p className="text-sm text-text-neutral/70">
                  Totais por período e exportação em CSV.
                </p>
              </div>
            </Card>
          </Link>
        </div>

        <ComprovantesManager comprovantes={comprovantes} />
      </div>
    </div>
  );
}

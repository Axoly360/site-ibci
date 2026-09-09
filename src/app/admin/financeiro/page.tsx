import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Building2, Send } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Financeiro | Painel IBCI",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminFinanceiroPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "financeiro")) redirect("/admin");

  const comprovantes = await sql`
    select contribution_receipts.id, contribution_receipts.file_name,
           contribution_receipts.file_url, contribution_receipts.note,
           contribution_receipts.created_at, members.name, members.email
    from contribution_receipts
    join members on members.id = contribution_receipts.member_id
    order by contribution_receipts.created_at desc
  `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Financeiro"
        description="Comprovantes de dízimos e ofertas enviados pelos membros."
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
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

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-3 text-primary">
            <Building2 className="h-6 w-6 text-secondary" />
            <h2 className="font-heading text-lg font-semibold">
              Comprovantes recebidos ({comprovantes.length})
            </h2>
          </div>

          {comprovantes.length === 0 ? (
            <p className="text-sm text-text-neutral/60">
              Nenhum comprovante enviado até o momento.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                    <th className="py-2 pr-4">Membro</th>
                    <th className="py-2 pr-4">Enviado em</th>
                    <th className="py-2 pr-4">Arquivo</th>
                    <th className="py-2 pr-4">Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {comprovantes.map((comprovante) => (
                    <tr key={comprovante.id} className="border-b border-black/5">
                      <td className="py-3 pr-4">
                        <div className="font-semibold text-text-neutral">
                          {comprovante.name}
                        </div>
                        <div className="text-xs text-text-neutral/60">
                          {comprovante.email}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/80">
                        {formatDate(comprovante.created_at)}
                      </td>
                      <td className="py-3 pr-4">
                        <a
                          href={comprovante.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-semibold text-secondary hover:underline"
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          {comprovante.file_name}
                        </a>
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/70">
                        {comprovante.note || "—"}
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

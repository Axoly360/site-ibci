import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Send, UserRound } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Congregações | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminCongregacoesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "congregacoes")) redirect("/admin");

  const congregacoes = await sql`
    select congregations.id, congregations.name, congregations.slug,
           (select count(*)::int from congregation_requests
             where congregation_id = congregations.id and status = 'pendente') as pendentes
    from congregations
    order by congregations.name asc
  `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Congregações"
        description="Filiais da IBCI — responsáveis, solicitações e prestação de contas."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          {congregacoes.map((c) => (
            <Card key={c.id} className="p-6">
              <div className="mb-4 flex items-center gap-3 text-primary">
                <Building2 className="h-6 w-6 text-secondary" />
                <h2 className="font-heading text-lg font-semibold">{c.name}</h2>
                {c.pendentes > 0 && (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-primary">
                    {c.pendentes} pendente{c.pendentes > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/admin/congregacoes/${c.slug}/solicitacoes`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                >
                  <Send className="h-4 w-4" />
                  Solicitações
                </Link>
                <Link
                  href={`/admin/congregacoes/${c.slug}/responsaveis`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                >
                  <UserRound className="h-4 w-4" />
                  Responsáveis
                </Link>
                <Link
                  href={`/admin/financeiro/relatorio?congregacao=${c.slug}`}
                  className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                >
                  <Building2 className="h-4 w-4" />
                  Financeiro
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

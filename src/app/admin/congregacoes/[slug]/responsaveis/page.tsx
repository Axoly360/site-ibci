import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import CongregationUsersManager from "@/components/admin/CongregationUsersManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Responsáveis | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminCongregacaoResponsaveisPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "congregacoes")) redirect("/admin");

  const { slug } = await params;
  const [congregation] = await sql`select id, name from congregations where slug = ${slug}`;
  if (!congregation) notFound();

  const users = await sql`
    select id, name, email, status from congregation_users
    where congregation_id = ${congregation.id}
    order by name asc
  `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Responsáveis"
        description={congregation.name}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/congregacoes"
          className="mb-6 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para Congregações
        </Link>
        <CongregationUsersManager slug={slug} users={users} />
      </div>
    </div>
  );
}

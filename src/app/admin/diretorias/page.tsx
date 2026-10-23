import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import OfficesManager from "@/components/admin/OfficesManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Diretorias | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminDiretoriasPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const [organizations, offices, members] = await Promise.all([
    sql`select id, name, short_name from church_organizations order by position asc, short_name asc`,
    sql`
      select o.id, m.name as member_name, o.organization_id, g.short_name as org_short, o.office,
             o.start_date::text as start_date, o.end_date::text as end_date,
             (o.start_date <= current_date and (o.end_date is null or o.end_date >= current_date)) as active
      from member_offices o
      join members m on m.id = o.member_id
      join church_organizations g on g.id = o.organization_id
      order by active desc, g.position asc, o.office asc, o.start_date desc
    `,
    sql`select id, name from members where is_validated_member = true order by name asc`,
  ]);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Diretorias"
        description="Presidentes e vice-presidentes de cada organização, com o mandato. A insígnia aparece no perfil do membro."
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <OfficesManager
          organizations={organizations as Parameters<typeof OfficesManager>[0]["organizations"]}
          offices={offices as Parameters<typeof OfficesManager>[0]["offices"]}
          members={members as Parameters<typeof OfficesManager>[0]["members"]}
        />
      </div>
    </div>
  );
}

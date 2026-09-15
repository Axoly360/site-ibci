import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import GroupsManager from "@/components/admin/GroupsManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Grupos | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminGruposPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const groups = await sql`
    select mg.id, mg.name, mg.leader_name, mg.meeting_day, mg.location, mg.description,
           count(distinct mgm.member_id)::int as member_count,
           count(distinct gjr.id) filter (where gjr.status = 'pendente')::int as pending_count
    from member_groups mg
    left join member_group_members mgm on mgm.group_id = mg.id
    left join group_join_requests gjr on gjr.group_id = mg.id
    group by mg.id
    order by mg.name asc
  `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Grupos"
        description="Grupos/células da igreja e quem faz parte de cada um."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <GroupsManager groups={groups} />
      </div>
    </div>
  );
}

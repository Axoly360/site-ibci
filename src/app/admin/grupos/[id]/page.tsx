import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import GroupMembersManager from "@/components/admin/GroupMembersManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Membros do Grupo | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminGrupoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const { id } = await params;
  const [group] = await sql`select id, name from member_groups where id = ${id}`;
  if (!group) notFound();

  const members = await sql`
    select members.id, members.name, members.email
    from member_group_members
    join members on members.id = member_group_members.member_id
    where member_group_members.group_id = ${id}
    order by members.name asc
  `;

  const availableMembers = await sql`
    select id, name, email from members
    where is_validated_member = true
      and id not in (
        select member_id from member_group_members where group_id = ${id}
      )
    order by name asc
  `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner title="Membros do Grupo" description={group.name} />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/grupos"
          className="mb-6 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para Grupos
        </Link>
        <GroupMembersManager groupId={id} members={members} availableMembers={availableMembers} />
      </div>
    </div>
  );
}

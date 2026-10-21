import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import EbdStudentsManager from "@/components/admin/EbdStudentsManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Alunos da Sala | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminEbdSalaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const { id } = await params;
  const [room] = await sql`select id, name from ebd_classes where id = ${id}`;
  if (!room) notFound();

  const [students, availableMembers, availableChildren] = await Promise.all([
    sql`
      select e.id, coalesce(m.name, c.name) as name,
             case when e.member_id is not null then 'Membro' else 'Criança' end as kind,
             p.name as parent_name
      from ebd_enrollments e
      left join members m on m.id = e.member_id
      left join member_children c on c.id = e.child_id
      left join members p on p.id = c.member_id
      where e.class_id = ${id}
      order by name asc
    `,
    sql`
      select id, name from members
      where is_validated_member = true
        and id not in (
          select member_id from ebd_enrollments where class_id = ${id} and member_id is not null
        )
      order by name asc
    `,
    sql`
      select c.id, c.name, p.name as parent_name
      from member_children c
      join members p on p.id = c.member_id
      where c.id not in (
        select child_id from ebd_enrollments where class_id = ${id} and child_id is not null
      )
      order by c.name asc
    `,
  ]);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner title="Alunos da Sala" description={room.name} />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/ebd"
          className="mb-6 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para EBD
        </Link>
        <EbdStudentsManager
          classId={id}
          students={students as Parameters<typeof EbdStudentsManager>[0]["students"]}
          availableMembers={availableMembers as Parameters<typeof EbdStudentsManager>[0]["availableMembers"]}
          availableChildren={availableChildren as Parameters<typeof EbdStudentsManager>[0]["availableChildren"]}
        />
      </div>
    </div>
  );
}

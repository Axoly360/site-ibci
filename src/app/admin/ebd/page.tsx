import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import EbdManager from "@/components/admin/EbdManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "EBD | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminEbdPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const [classes, teachers] = await Promise.all([
    sql`
    select c.id, c.name, c.teacher_name, c.audience, c.meeting_time, c.location, c.description,
           coalesce((select array_agg(t.member_id) from ebd_class_teachers t where t.class_id = c.id), '{}') as teacher_member_ids,
           count(distinct e.id)::int as student_count,
           count(distinct r.id) filter (where r.status = 'pendente')::int as pending_count
    from ebd_classes c
    left join ebd_enrollments e on e.class_id = c.id
    left join ebd_join_requests r on r.class_id = c.id
    group by c.id
    order by c.name asc
  `,
    sql`
      select m.id, m.name
      from teacher_profiles tp
      join members m on m.id = tp.member_id
      where tp.status = 'ativo'
      order by m.name asc
    `,
  ]);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Escola Bíblica Dominical"
        description="Salas da EBD, professores e quem estuda em cada uma."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EbdManager
          classes={classes as Parameters<typeof EbdManager>[0]["classes"]}
          teachers={teachers as Parameters<typeof EbdManager>[0]["teachers"]}
        />
      </div>
    </div>
  );
}

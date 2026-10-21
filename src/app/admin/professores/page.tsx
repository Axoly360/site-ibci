import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import TeacherManager, { type TeacherRow } from "@/components/admin/TeacherManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Professores | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminProfessoresPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const rows = await sql`
    select t.member_id, t.status, m.name, m.email, m.phone,
           coalesce(
             (select array_agg(c.name order by c.name) from ebd_classes c
              join ebd_class_teachers ct on ct.class_id = c.id
              where ct.member_id = t.member_id),
             '{}'
           ) as classes
    from teacher_profiles t
    join members m on m.id = t.member_id
    order by m.name asc
  `;

  const all: TeacherRow[] = rows.map((r) => ({
    memberId: r.member_id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    status: r.status,
    classes: r.classes ?? [],
  }));

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Professores"
        description="Aprove quem pediu para ser professor(a) da EBD. A sala é atribuída em Admin → EBD."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <TeacherManager
          requests={all.filter((t) => t.status === "solicitado")}
          teachers={all.filter((t) => t.status !== "solicitado")}
        />
      </div>
    </div>
  );
}

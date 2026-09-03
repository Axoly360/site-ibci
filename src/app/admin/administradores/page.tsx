import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import { getAdminSession, hasPermission, ROLES } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Administradores | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdministradoresPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "admins")) redirect("/admin");

  const admins = await sql`
    select id, name, email, role, permissions, status
    from admin_users
    order by created_at asc
  `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Administradores"
        description="Quem tem acesso ao painel e o que cada pessoa pode fazer."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <AdminUsersManager admins={admins} roles={ROLES} currentAdminId={session.id} />
      </div>
    </div>
  );
}

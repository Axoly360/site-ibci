import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import PresencaManager, { type AttendanceRow } from "@/components/admin/PresencaManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Presença nos cultos | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminPresencaPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const rows = await sql`
    select id, service_date::text as service_date, service_label, total, visitors, notes
    from service_attendance
    order by service_date desc, service_label asc
    limit 60
  `;

  const recife = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Recife" }));
  const today = `${recife.getFullYear()}-${String(recife.getMonth() + 1).padStart(2, "0")}-${String(
    recife.getDate()
  ).padStart(2, "0")}`;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Presença nos cultos"
        description="Lance quantas pessoas estiveram em cada culto. A média aparece nas Estatísticas."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <PresencaManager rows={rows as AttendanceRow[]} today={today} />
      </div>
    </div>
  );
}

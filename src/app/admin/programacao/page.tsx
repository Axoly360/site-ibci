import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import ScheduleManager from "@/components/admin/ScheduleManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getWeeklySchedule } from "@/lib/weeklySchedule";

export const metadata: Metadata = {
  title: "Programação da Semana | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminProgramacaoPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "paginas")) redirect("/admin");

  const items = await getWeeklySchedule();

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Programação da Semana"
        description="Itens exibidos na seção Programação da Semana, na home."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ScheduleManager items={items} />
      </div>
    </div>
  );
}

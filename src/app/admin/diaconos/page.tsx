import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import DeaconManager, {
  type DeaconRow,
  type DeaconScheduleRow,
} from "@/components/admin/DeaconManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Diáconos | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminDiaconosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "diaconos")) redirect("/admin");

  const [profiles, scheduleRows, congregations] = await Promise.all([
    sql`
      select deacon_profiles.member_id, members.name, members.email, members.phone,
             deacon_profiles.kind, deacon_profiles.status, deacon_profiles.consecration_date,
             deacon_profiles.area, deacon_profiles.congregation_id, deacon_profiles.notes,
             deacon_profiles.is_board,
             congregations.name as congregation_name
      from deacon_profiles
      join members on members.id = deacon_profiles.member_id
      left join congregations on congregations.id = deacon_profiles.congregation_id
      order by members.name asc
    `,
    sql`
      select deacon_schedule.id, deacon_schedule.service_date::text as service_date,
             deacon_schedule.service_label, deacon_schedule.post, members.name as member_name
      from deacon_schedule
      join members on members.id = deacon_schedule.member_id
      where deacon_schedule.service_date >= current_date
      order by deacon_schedule.service_date asc, deacon_schedule.service_label asc
    `,
    sql`select id, name from congregations order by name asc`,
  ]);

  const all: DeaconRow[] = profiles.map((p) => ({
    memberId: p.member_id,
    name: p.name,
    email: p.email,
    phone: p.phone,
    kind: p.kind,
    status: p.status,
    consecrationDate: p.consecration_date,
    area: p.area,
    congregationId: p.congregation_id,
    congregationName: p.congregation_name,
    notes: p.notes,
    isBoard: Boolean(p.is_board),
  }));

  const schedule: DeaconScheduleRow[] = scheduleRows.map((s) => ({
    id: s.id,
    serviceDate: s.service_date,
    serviceLabel: s.service_label,
    memberName: s.member_name,
    post: s.post,
  }));

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Diáconos"
        description="Ministério diaconal: solicitações, cadastro dos diáconos e escala."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <DeaconManager
          requests={all.filter((d) => d.status === "solicitado")}
          deacons={all.filter((d) => d.status !== "solicitado")}
          schedule={schedule}
          congregations={congregations.map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  );
}

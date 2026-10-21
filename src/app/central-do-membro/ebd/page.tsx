import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import EbdJoinList, { type EbdToJoin } from "@/components/membros/EbdJoinList";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "EBD | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function EbdMembroPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");

  const [classes, myEnrollments, myRequests] = await Promise.all([
    sql`
      select id, name, teacher_name, audience, meeting_time, location, description
      from ebd_classes order by name asc
    `,
    sql`select class_id from ebd_enrollments where member_id = ${session.memberId}`,
    sql`
      select class_id, status from ebd_join_requests
      where member_id = ${session.memberId}
      order by requested_at desc
    `,
  ]);

  const enrolled = new Set(myEnrollments.map((r: { class_id: string }) => r.class_id));
  const latestRequest = new Map<string, string>();
  for (const r of myRequests as { class_id: string; status: string }[]) {
    if (!latestRequest.has(r.class_id)) latestRequest.set(r.class_id, r.status);
  }

  const view: EbdToJoin[] = classes.map((c: Omit<EbdToJoin, "status">) => ({
    ...c,
    status: enrolled.has(c.id)
      ? "membro"
      : ((latestRequest.get(c.id) as EbdToJoin["status"]) ?? null),
  }));

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Escola Bíblica Dominical"
        description="Escolha a sala da EBD que você frequenta. A secretaria confirma."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />
        <EbdJoinList classes={view} />
      </div>
    </div>
  );
}

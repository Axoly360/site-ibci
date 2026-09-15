import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import GroupJoinList, { type GroupToJoin } from "@/components/membros/GroupJoinList";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Grupos | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function GruposPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");

  const [groups, myMemberships, myRequests] = await Promise.all([
    sql`select id, name, leader_name, meeting_day, location, description from member_groups order by name asc`,
    sql`select group_id from member_group_members where member_id = ${session.memberId}`,
    sql`
      select group_id, status, requested_at from group_join_requests
      where member_id = ${session.memberId}
      order by requested_at desc
    `,
  ]);

  const memberGroupIds = new Set(myMemberships.map((m: { group_id: string }) => m.group_id));
  const latestRequestByGroup = new Map<string, string>();
  for (const r of myRequests as { group_id: string; status: string }[]) {
    if (!latestRequestByGroup.has(r.group_id)) {
      latestRequestByGroup.set(r.group_id, r.status);
    }
  }

  const groupsView: GroupToJoin[] = groups.map((group: Omit<GroupToJoin, "status">) => ({
    ...group,
    status: memberGroupIds.has(group.id)
      ? "membro"
      : ((latestRequestByGroup.get(group.id) as GroupToJoin["status"]) ?? null),
  }));

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Grupos"
        description="Conheça os grupos/células da igreja e solicite para participar."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <GroupJoinList groups={groupsView} />
      </div>
    </div>
  );
}

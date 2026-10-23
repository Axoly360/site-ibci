import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import OrganizationList, { type OrgView } from "@/components/membros/OrganizationList";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Organizações | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function OrganizacoesPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`select is_validated_member from members where id = ${session.memberId}`;
  if (!member?.is_validated_member) redirect("/central-do-membro");

  const [orgs, mine, events] = await Promise.all([
    sql`select id, name, short_name from church_organizations order by position asc, short_name asc`,
    sql`select organization_id, status from organization_members where member_id = ${session.memberId}`,
    sql`
      select e.id, e.organization_id, e.title, e.event_date::text as event_date,
             e.event_time, e.location, e.description
      from organization_events e
      where e.event_date >= current_date
        and e.organization_id in (
          select organization_id from organization_members
          where member_id = ${session.memberId} and status = 'ativo'
        )
      order by e.event_date asc, e.event_time asc nulls last
    `,
  ]);

  const statusByOrg = new Map<string, "ativo" | "pendente">(
    mine.map((r) => [r.organization_id as string, r.status as "ativo" | "pendente"])
  );

  const view: OrgView[] = orgs.map((o) => ({
    id: o.id,
    name: o.name,
    short_name: o.short_name,
    status: statusByOrg.get(o.id) ?? null,
    events: events
      .filter((e) => e.organization_id === o.id)
      .map((e) => ({
        id: e.id,
        title: e.title,
        event_date: e.event_date,
        event_time: e.event_time,
        location: e.location,
        description: e.description,
      })),
  }));

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Organizações"
        description="Participe da SHB, MM, UBACI, Unijovem e acompanhe a agenda de cada uma."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />
        <OrganizationList orgs={view} />
      </div>
    </div>
  );
}

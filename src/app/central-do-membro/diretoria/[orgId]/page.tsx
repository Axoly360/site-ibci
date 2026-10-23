import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import OrgBoardManager from "@/components/membros/OrgBoardManager";
import { getBoardOrgs } from "@/lib/orgAccess";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Área da Diretoria | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function DiretoriaOrgPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const board = await getBoardOrgs();
  if (!board) redirect("/central-do-membro/area");
  const org = board.orgs.find((o) => o.id === orgId);
  if (!org) redirect("/central-do-membro/diretoria");

  const [orgRow] = await sql`select id from church_organizations where id = ${orgId}`;
  if (!orgRow) notFound();

  const [pending, members, events, directors] = await Promise.all([
    sql`
      select m.id, m.name, m.email
      from organization_members om join members m on m.id = om.member_id
      where om.organization_id = ${orgId} and om.status = 'pendente'
      order by om.requested_at asc
    `,
    sql`
      select m.id, m.name
      from organization_members om join members m on m.id = om.member_id
      where om.organization_id = ${orgId} and om.status = 'ativo'
      order by m.name asc
    `,
    sql`
      select e.id, e.title, e.event_date::text as event_date, e.event_time, e.location,
             e.description, (e.event_date < current_date) as is_past
      from organization_events e
      where e.organization_id = ${orgId}
        and e.event_date >= current_date - interval '60 days'
      order by e.event_date asc, e.event_time asc nulls last
    `,
    sql`
      select o.office, m.name
      from member_offices o join members m on m.id = o.member_id
      where o.organization_id = ${orgId}
        and o.start_date <= current_date
        and (o.end_date is null or o.end_date >= current_date)
      order by o.office asc, m.name asc
    `,
  ]);

  return (
    <div className="bg-bg-light">
      <PageBanner title={`Diretoria · ${org.short_name}`} description={org.name} />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/central-do-membro/area"
          className="mb-6 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar à Área do Membro
        </Link>

        {directors.length > 0 && (
          <p className="mb-8 rounded-xl bg-white px-5 py-4 text-sm text-text-neutral/80 shadow-sm">
            <span className="font-bold text-primary">Diretoria em exercício: </span>
            {directors.map((d) => `${d.office}: ${d.name}`).join(" · ")}
          </p>
        )}

        <OrgBoardManager
          orgId={orgId}
          pending={pending as Parameters<typeof OrgBoardManager>[0]["pending"]}
          members={members as Parameters<typeof OrgBoardManager>[0]["members"]}
          events={events as Parameters<typeof OrgBoardManager>[0]["events"]}
        />
      </div>
    </div>
  );
}

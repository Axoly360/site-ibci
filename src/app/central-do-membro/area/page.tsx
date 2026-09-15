import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MemberProfileSummary from "@/components/membros/MemberProfileSummary";
import MemberGroupsCard from "@/components/membros/MemberGroupsCard";
import DashboardCategoryTiles from "@/components/membros/DashboardCategoryTiles";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Área do Membro | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function AreaDoMembroPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member, is_leadership, church_role, name, email, phone,
           photo_url, marital_status, birthplace, profession, birthdate,
           baptism_date, time_at_church
    from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");

  const groups = await sql`
    select mg.id, mg.name, mg.leader_name, mg.meeting_day, mg.location
    from member_group_members mgm
    join member_groups mg on mg.id = mgm.group_id
    where mgm.member_id = ${session.memberId}
    order by mg.name asc
  `;

  return (
    <div className="bg-bg-light">
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Área do Membro
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Olá, {session.name}! Atalhos e serviços práticos para facilitar sua
            participação e comunhão na IBCI.
          </p>
          <form action="/api/auth/sair" method="POST" className="mt-6">
            <input type="hidden" name="next" value="/central-do-membro" />
            <button
              type="submit"
              className="rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-secondary-light"
            >
              Sair
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <MemberProfileSummary member={{ id: session.memberId, ...member }} />
        <MemberGroupsCard groups={groups} />
        <DashboardCategoryTiles isLeadership={member.is_leadership} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import FamilyMembersManager, {
  type EbdClassOption,
} from "@/components/membros/FamilyMembersManager";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Grupo Familiar | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function GrupoFamiliarPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const familiares = await sql`
    select id, name, birthdate, sex, relationship
    from member_children
    where member_id = ${session.memberId}
    order by created_at asc
  `;

  // EBD por familiar. Se as tabelas/colunas novas ainda não existirem, a tela
  // segue funcionando sem a escolha de sala.
  let ebdClasses: EbdClassOption[] = [];
  const ebdByFamiliar: Record<string, { enrolled: string[]; pending: string[] }> = {};
  let canPickEbd = false;
  try {
    const [me] = await sql`select is_validated_member from members where id = ${session.memberId}`;
    canPickEbd = Boolean(me?.is_validated_member);

    const [classes, enrolled, pending] = await Promise.all([
      sql`select id, name, audience from ebd_classes order by name asc`,
      sql`
        select e.child_id, c.name as class_name
        from ebd_enrollments e
        join ebd_classes c on c.id = e.class_id
        where e.child_id in (select id from member_children where member_id = ${session.memberId})
      `,
      sql`
        select r.child_id, c.name as class_name
        from ebd_join_requests r
        join ebd_classes c on c.id = r.class_id
        where r.status = 'pendente'
          and r.child_id in (select id from member_children where member_id = ${session.memberId})
      `,
    ]);
    ebdClasses = classes as EbdClassOption[];
    for (const row of enrolled as { child_id: string; class_name: string }[]) {
      (ebdByFamiliar[row.child_id] ||= { enrolled: [], pending: [] }).enrolled.push(row.class_name);
    }
    for (const row of pending as { child_id: string; class_name: string }[]) {
      (ebdByFamiliar[row.child_id] ||= { enrolled: [], pending: [] }).pending.push(row.class_name);
    }
  } catch {
    ebdClasses = [];
    canPickEbd = false;
  }

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Grupo Familiar"
        description="Cadastre seus familiares que também congregam na IBCI (cônjuge, filhos e outros) — isso facilita a entrada das crianças no Ministério Infantil e ajuda a diretoria a te conhecer melhor."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />
        <FamilyMembersManager
          familiares={familiares}
          ebdClasses={canPickEbd ? ebdClasses : []}
          ebdByFamiliar={ebdByFamiliar}
        />
      </div>
    </div>
  );
}

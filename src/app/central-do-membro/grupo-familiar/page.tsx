import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import FamilyMembersManager from "@/components/membros/FamilyMembersManager";
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

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Grupo Familiar"
        description="Cadastre seus familiares que também congregam na IBCI (cônjuge, filhos e outros) — isso facilita a entrada das crianças no Ministério Infantil e ajuda a diretoria a te conhecer melhor."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />
        <FamilyMembersManager familiares={familiares} />
      </div>
    </div>
  );
}

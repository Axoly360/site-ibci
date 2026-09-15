import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import ChildrenManager from "@/components/membros/ChildrenManager";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Ministério Infantil | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function FilhosPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const children = await sql`
    select id, name, birthdate, sex
    from member_children
    where member_id = ${session.memberId}
    order by created_at asc
  `;

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministério Infantil"
        description="Cadastre seus filhos para facilitar a entrada deles no Ministério Infantil."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ChildrenManager children={children} />
      </div>
    </div>
  );
}

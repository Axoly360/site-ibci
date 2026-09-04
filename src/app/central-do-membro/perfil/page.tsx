import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import ProfileForm from "@/components/membros/ProfileForm";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Meu Cadastro | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select name, email, is_validated_member, phone, cpf, birthdate, address,
           time_at_church, baptism_date, arrival_date, photo_url
    from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Meu Cadastro"
        description="Mantenha seus dados atualizados com a igreja."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ProfileForm profile={member} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import ProfileForm from "@/components/membros/ProfileForm";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";
import { hasMissingConsent } from "@/lib/consentGate";

export const metadata: Metadata = {
  title: "Meu Cadastro | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select name, email, is_validated_member, phone, cpf, birthdate, address,
           time_at_church, baptism_date, arrival_date, photo_url,
           marital_status, birthplace, profession
    from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");
  if (await hasMissingConsent(session.memberId)) {
    redirect("/central-do-membro/consentimento");
  }

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Meu Cadastro"
        description="Mantenha seus dados atualizados com a igreja."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />
        <ProfileForm profile={member} />
      </div>
    </div>
  );
}

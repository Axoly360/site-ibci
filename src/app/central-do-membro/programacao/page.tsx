import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import WeeklyScheduleSection from "@/components/home/WeeklyScheduleSection";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";
import { getWeeklySchedule } from "@/lib/weeklySchedule";
import { hasMissingConsent } from "@/lib/consentGate";

export const metadata: Metadata = {
  title: "Escala de Cultos & Avisos | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function ProgramacaoMembroPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");
  if (await hasMissingConsent(session.memberId)) {
    redirect("/central-do-membro/consentimento");
  }

  const items = await getWeeklySchedule();

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Escala de Cultos & Avisos"
        description="Programação da semana e os principais avisos da liderança."
      />
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <BackToMemberArea />
      </div>
      <WeeklyScheduleSection items={items} />
    </div>
  );
}

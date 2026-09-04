import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import WeeklyScheduleSection from "@/components/home/WeeklyScheduleSection";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

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

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Escala de Cultos & Avisos"
        description="Programação da semana e os principais avisos da liderança."
      />
      <WeeklyScheduleSection />
    </div>
  );
}

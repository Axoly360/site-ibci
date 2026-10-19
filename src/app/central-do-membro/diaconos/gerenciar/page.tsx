import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import DeaconBoardManager from "@/components/membros/DeaconBoardManager";
import { getDeaconBoardMember } from "@/lib/deaconAccess";
import { hasMissingConsent } from "@/lib/consentGate";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Gerenciar Escala dos Diáconos | IBCI",
  robots: { index: false, follow: false },
};

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export default async function GerenciarEscalaDiaconosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const board = await getDeaconBoardMember();
  if (!board) redirect("/central-do-membro/diaconos");
  if (await hasMissingConsent(board.memberId)) {
    redirect("/central-do-membro/consentimento");
  }

  const { mes } = await searchParams;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const month = mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes) ? mes : currentMonth;
  const start = `${month}-01`;

  const [entries, catalog, deacons] = await Promise.all([
    sql`
      select deacon_schedule.id, deacon_schedule.service_date::text as service_date,
             deacon_schedule.service_label, deacon_schedule.post, deacon_schedule.notes,
             members.name
      from deacon_schedule
      join members on members.id = deacon_schedule.member_id
      where deacon_schedule.service_date >= ${start}::date
        and deacon_schedule.service_date < (${start}::date + interval '1 month')
      order by deacon_schedule.service_date asc, deacon_schedule.service_label asc, members.name asc
    `,
    sql`select id, kind, name from deacon_catalog order by kind asc, position asc, name asc`,
    sql`
      select members.id as member_id, members.name
      from deacon_profiles
      join members on members.id = deacon_profiles.member_id
      where deacon_profiles.status = 'ativo'
      order by members.name asc
    `,
  ]);

  const [y, m] = month.split("-").map(Number);

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Escala e Atividades"
        description="Monte a escala mensal e ajuste as atividades e tarefas do corpo diaconal."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/central-do-membro/diaconos"
          className="mb-6 inline-block text-sm font-semibold text-primary hover:underline"
        >
          ← Voltar à Área dos Diáconos
        </Link>

        <div className="mb-8 flex items-center justify-between gap-4">
          <Link
            href={`/central-do-membro/diaconos/gerenciar?mes=${shiftMonth(month, -1)}`}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-primary shadow-sm"
          >
            ← Mês anterior
          </Link>
          <h2 className="font-heading text-xl font-bold text-primary">
            {MONTHS[m - 1]} de {y}
          </h2>
          <Link
            href={`/central-do-membro/diaconos/gerenciar?mes=${shiftMonth(month, 1)}`}
            className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-primary shadow-sm"
          >
            Próximo mês →
          </Link>
        </div>

        <DeaconBoardManager
          month={month}
          entries={entries.map((e) => ({
            id: e.id,
            serviceDate: e.service_date,
            activity: e.service_label,
            task: e.post,
            memberName: e.name,
            notes: e.notes,
          }))}
          activities={catalog.filter((c) => c.kind === "atividade").map((c) => ({ id: c.id, name: c.name }))}
          tasks={catalog.filter((c) => c.kind === "tarefa").map((c) => ({ id: c.id, name: c.name }))}
          deacons={deacons.map((d) => ({ memberId: d.member_id, name: d.name }))}
        />
      </div>
    </div>
  );
}

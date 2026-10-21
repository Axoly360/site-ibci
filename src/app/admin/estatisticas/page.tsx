import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import {
  BarList,
  ChartCard,
  Donut,
  Empty,
  MonthBars,
  StatCard,
  StatSection,
} from "@/components/admin/StatsWidgets";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getChurchStats } from "@/lib/churchStats";

export const metadata: Metadata = {
  title: "Estatísticas | Painel IBCI",
  robots: { index: false, follow: false },
};

const PERIODS = [3, 6, 12];

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export default async function EstatisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "admins")) redirect("/admin");

  const { periodo } = await searchParams;
  const months = PERIODS.includes(Number(periodo)) ? Number(periodo) : 12;

  const stats = await getChurchStats(months, hasPermission(session, "financeiro"));
  const { members, children, finance } = stats;

  const alerts: { label: string; value: number; href: string }[] = [
    { label: "Cadastros aguardando validação", value: members.pending, href: "/admin/membros" },
    { label: "Pedidos de grupo pendentes", value: stats.pendingGroupRequests, href: "/admin/grupos" },
    { label: "Pedidos de sala da EBD", value: stats.pendingEbdRequests, href: "/admin/ebd" },
    { label: "Solicitações de diácono", value: stats.deacons.solicitado, href: "/admin/diaconos" },
    ...(finance
      ? [{ label: "Comprovantes aguardando conferência", value: stats.pendingReceipts, href: "/admin/financeiro" }]
      : []),
  ].filter((a) => a.value > 0);

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Estatísticas"
        description="Visão geral da igreja em números: membros, famílias, ministérios, finanças e mais."
      />
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-neutral/70">
            Números agregados — sem listas de pessoas. Séries mostram os últimos {months} meses.
          </p>
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <Link
                key={p}
                href={`/admin/estatisticas?periodo=${p}`}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  p === months ? "bg-primary text-white" : "bg-white text-text-neutral/70"
                }`}
              >
                {p} meses
              </Link>
            ))}
          </div>
        </div>

        {stats.unavailable.length > 0 && (
          <p className="mt-4 rounded-xl bg-secondary/20 px-4 py-3 text-sm text-text-neutral">
            Não foi possível carregar: {stats.unavailable.join(", ")}. Esses números não aparecem
            abaixo (não são zero).
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Membros ativos" value={String(members.total)} hint="Cadastros validados" />
          <StatCard
            label="Idade média"
            value={members.avgAge !== null ? `${members.avgAge} anos` : "—"}
            hint={`${members.withBirthdate} de ${members.total} com nascimento informado`}
          />
          <StatCard
            label="Crianças cadastradas"
            value={String(children.total)}
            hint={
              children.avgPerFamily !== null
                ? `${children.avgPerFamily} por família (${children.families} famílias)`
                : "Nenhuma família com filhos cadastrados"
            }
          />
          <StatCard
            label="Aniversariantes da semana"
            value={String(members.birthdaysWeek)}
            hint="Membros que fazem aniversário nos próximos 7 dias"
          />
          {finance && (
            <>
              <StatCard label={`Entradas (${months} meses)`} value={brl(finance.income)} />
              <StatCard label={`Saídas (${months} meses)`} value={brl(finance.expense)} />
              <StatCard
                label="Saldo do período"
                value={brl(finance.income - finance.expense)}
                hint="Entradas menos saídas lançadas"
              />
            </>
          )}
          <StatCard
            label={`Visitantes (${months} meses)`}
            value={String(stats.visitors.total)}
            hint={`${stats.visitors.firstVisit} em primeira visita`}
          />
        </div>

        <StatSection title="Atenção" description="O que está esperando uma decisão da diretoria.">
          {alerts.length === 0 && members.pendingOld === 0 ? (
            <Empty text="Nada pendente no momento." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {alerts.map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center justify-between rounded-xl bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <span className="text-sm text-text-neutral">{a.label}</span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-sm font-bold text-primary">
                    {a.value}
                  </span>
                </Link>
              ))}
              {members.pendingOld > 0 && (
                <p className="rounded-xl bg-secondary/20 px-5 py-4 text-sm text-text-neutral sm:col-span-2">
                  {members.pendingOld} cadastro(s) de membro aguardam há mais de 7 dias.
                </p>
              )}
            </div>
          )}
        </StatSection>

        <StatSection title="Membros">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Novos membros aprovados por mês">
              <MonthBars series={[{ name: "Novos membros", bg: "bg-primary", points: members.newByMonth }]} />
            </ChartCard>
            <ChartCard title="Faixa etária">
              <BarList items={members.ageBuckets} />
            </ChartCard>
            <ChartCard title="Sexo">
              <Donut items={members.sex} />
              {members.sex.some((s) => s.label === "Não informado") && (
                <p className="mt-3 text-xs text-text-neutral/60">
                  &quot;Não informado&quot; são membros que ainda não preencheram o campo em Meu Cadastro.
                </p>
              )}
            </ChartCard>
            <ChartCard title="Estado civil">
              <Donut items={members.marital} />
            </ChartCard>
            <ChartCard title="Batismos por ano">
              <BarList items={members.baptismsByYear} />
            </ChartCard>
          </div>
        </StatSection>

        <StatSection title="Famílias e crianças">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Crianças por faixa etária">
              <BarList items={children.ageBuckets} />
            </ChartCard>
            <ChartCard title="Crianças por sexo">
              <Donut items={children.sex} />
            </ChartCard>
          </div>
        </StatSection>

        <StatSection
          title="Grupos e ministérios"
          description="Ministérios vêm do cadastro de voluntariado (Servir); salas da EBD, do cadastro de salas."
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Membros por grupo/célula">
              <BarList items={stats.groups} />
            </ChartCard>
            <ChartCard title="Alunos por sala da EBD">
              <BarList items={stats.ebdClasses} />
            </ChartCard>
            <ChartCard title="Voluntários por ministério">
              <BarList items={stats.ministries} />
            </ChartCard>
          </div>
        </StatSection>

        <StatSection title="Ministério diaconal">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Ativos" value={String(stats.deacons.ativo)} />
            <StatCard label="Diretoria" value={String(stats.deacons.board)} />
            <StatCard label="Afastados" value={String(stats.deacons.afastado)} />
            <StatCard label="Eméritos" value={String(stats.deacons.emerito)} />
          </div>
        </StatSection>

        {finance && (
          <StatSection title="Financeiro" description="Lançamentos registrados no painel Financeiro.">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ChartCard title="Entradas e saídas por mês">
                <MonthBars
                  format={brl}
                  series={[
                    { name: "Entradas", bg: "bg-emerald-600", points: finance.incomeByMonth },
                    { name: "Saídas", bg: "bg-secondary", points: finance.expenseByMonth },
                  ]}
                />
              </ChartCard>
              <ChartCard title="Entradas por categoria">
                <BarList items={finance.byCategory} format={brl} />
              </ChartCard>
            </div>
          </StatSection>
        )}

        <StatSection title="Visitantes e eventos">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Visitantes por mês">
              <MonthBars series={[{ name: "Visitantes", bg: "bg-sky-500", points: stats.visitors.byMonth }]} />
            </ChartCard>
            <ChartCard title="Eventos recentes: inscritos e presentes">
              {stats.events.length === 0 ? (
                <Empty />
              ) : (
                <ul className="flex flex-col gap-3 text-sm">
                  {stats.events.map((e) => (
                    <li key={e.title} className="flex items-baseline justify-between gap-3">
                      <span className="text-text-neutral">{e.title}</span>
                      <span className="shrink-0 font-semibold text-primary">
                        {e.registered} inscritos · {e.checkedIn} presentes
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </ChartCard>
          </div>
        </StatSection>
      </div>
    </div>
  );
}

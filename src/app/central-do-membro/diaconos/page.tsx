import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import Card from "@/components/ui/Card";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";
import { hasMissingConsent } from "@/lib/consentGate";

export const metadata: Metadata = {
  title: "Área dos Diáconos | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default async function AreaDosDiaconosPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");
  if (await hasMissingConsent(session.memberId)) {
    redirect("/central-do-membro/consentimento");
  }

  const [me] = await sql`
    select deacon_profiles.kind, deacon_profiles.status, deacon_profiles.consecration_date,
           deacon_profiles.is_board,
           deacon_profiles.area, deacon_profiles.notes, congregations.name as congregation_name
    from deacon_profiles
    left join congregations on congregations.id = deacon_profiles.congregation_id
    where deacon_profiles.member_id = ${session.memberId}
  `;
  if (!me || me.status !== "ativo") redirect("/central-do-membro/area");

  const [upcoming, roster] = await Promise.all([
    sql`
      select deacon_schedule.service_date::text as service_date, deacon_schedule.service_label,
             deacon_schedule.post, deacon_schedule.notes, deacon_schedule.member_id, members.name
      from deacon_schedule
      join members on members.id = deacon_schedule.member_id
      where deacon_schedule.service_date >= current_date
      order by deacon_schedule.service_date asc, deacon_schedule.service_label asc, members.name asc
    `,
    sql`
      select members.name, deacon_profiles.kind, deacon_profiles.area,
             congregations.name as congregation_name
      from deacon_profiles
      join members on members.id = deacon_profiles.member_id
      left join congregations on congregations.id = deacon_profiles.congregation_id
      where deacon_profiles.status = 'ativo'
      order by members.name asc
    `,
  ]);

  const mine = upcoming.filter((s) => s.member_id === session.memberId);

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Área dos Diáconos"
        description="Seus dados no ministério diaconal, a escala e o corpo de diáconos."
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />

        {me.is_board && (
          <Link
            href="/central-do-membro/diaconos/gerenciar"
            className="flex items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-white shadow-sm transition-colors hover:bg-primary-dark"
          >
            <span>
              <span className="block font-heading text-base font-bold">
                Gerenciar escala e atividades
              </span>
              <span className="block text-sm text-white/80">
                Diretoria diaconal: monte a escala do mês e ajuste atividades e tarefas.
              </span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0" />
          </Link>
        )}

        <section>
          <h2 className="mb-3 font-heading text-xl font-bold text-primary">Meus dados</h2>
          <Card className="p-5">
            <p className="font-semibold text-text-neutral">{me.kind}</p>
            <p className="mt-1 text-sm text-text-neutral/70">
              {[
                me.area,
                me.congregation_name ? `Congregação ${me.congregation_name}` : "Sede",
                me.consecration_date ? `Consagração: ${me.consecration_date}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {me.notes && <p className="mt-2 text-sm text-text-neutral/80">{me.notes}</p>}
            <p className="mt-3 text-xs text-text-neutral/50">
              Para corrigir esses dados, fale com a Secretaria.
            </p>
          </Card>
        </section>

        <section>
          <h2 className="mb-3 font-heading text-xl font-bold text-primary">Minha escala</h2>
          {mine.length === 0 ? (
            <p className="text-sm text-text-neutral/60">
              Você não está escalado para as próximas datas.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {mine.map((s) => (
                <Card key={`${s.service_date}-${s.service_label}`} className="p-4">
                  <p className="font-semibold text-text-neutral">
                    {formatDate(s.service_date)} · {s.service_label}
                  </p>
                  {(s.post || s.notes) && (
                    <p className="text-sm text-text-neutral/70">
                      {[s.post, s.notes].filter(Boolean).join(" — ")}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-heading text-xl font-bold text-primary">
            Escala dos próximos cultos
          </h2>
          {upcoming.length === 0 ? (
            <p className="text-sm text-text-neutral/60">Nenhuma escala publicada ainda.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.map((s, i) => (
                <Card key={`${s.service_date}-${s.service_label}-${i}`} className="p-4">
                  <p className="text-sm font-semibold text-primary">
                    {formatDate(s.service_date)} · {s.service_label}
                  </p>
                  <p className="text-text-neutral">
                    {s.name}
                    {s.post ? <span className="text-text-neutral/60"> · {s.post}</span> : null}
                    {s.notes ? <span className="text-text-neutral/60"> — {s.notes}</span> : null}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 font-heading text-xl font-bold text-primary">
            Corpo de diáconos ({roster.length})
          </h2>
          <Card className="divide-y divide-black/5 p-0">
            {roster.map((d, i) => (
              <div key={`${d.name}-${i}`} className="px-5 py-3">
                <p className="font-semibold text-text-neutral">{d.name}</p>
                <p className="text-xs text-text-neutral/60">
                  {[d.kind, d.area, d.congregation_name ? `Congregação ${d.congregation_name}` : "Sede"]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            ))}
          </Card>
        </section>
      </div>
    </div>
  );
}

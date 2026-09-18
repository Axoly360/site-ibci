import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Cake } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import CopyTextButton from "@/components/admin/CopyTextButton";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { parseBRDate } from "@/lib/masks";
import { startOfWeekSunday, addDays, datesInRange, findBirthdayOccurrence } from "@/lib/birthdays";

export const metadata: Metadata = {
  title: "Aniversariantes | Painel IBCI",
  robots: { index: false, follow: false },
};

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function presetRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  if (preset === "mes") {
    const inicioMes = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const fimMes = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0));
    return { from: toISO(inicioMes), to: toISO(fimMes) };
  }

  const inicioSemana =
    preset === "proxima-semana" ? addDays(startOfWeekSunday(today), 7) : startOfWeekSunday(today);
  return { from: toISO(inicioSemana), to: toISO(addDays(inicioSemana, 6)) };
}

function formatDiaMes(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
}

function formatDiaMesLongo(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", timeZone: "UTC" });
}

interface Aniversariante {
  id: string;
  name: string;
  ocorrencia: Date;
  idadeCompleta: number;
  tipo: string;
  responsavel: string | null;
}

export default async function AdminAniversariantesPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const params = await searchParams;
  const preset = params.preset || "semana";
  const range =
    params.from && params.to ? { from: params.from, to: params.to } : presetRange(preset);

  const fromDate = new Date(`${range.from}T00:00:00Z`);
  const toDate = new Date(`${range.to}T00:00:00Z`);
  const rangeDates =
    fromDate.getTime() <= toDate.getTime() ? datesInRange(fromDate, toDate) : [];

  // Duas fontes de aniversário: o próprio cadastro do membro validado, e os
  // familiares que ele registrou no Grupo Familiar (cônjuge, filhos etc.) —
  // ambos "cadastrados" na igreja, então ambos entram no boletim.
  const [membros, familiares] = await Promise.all([
    sql`
      select id, name, birthdate from members
      where is_validated_member = true and birthdate is not null and birthdate <> ''
    `,
    sql`
      select member_children.id, member_children.name, member_children.birthdate,
             member_children.relationship, members.name as member_name
      from member_children
      join members on members.id = member_children.member_id
      where member_children.birthdate is not null and member_children.birthdate <> ''
    `,
  ]);

  const aniversariantes: Aniversariante[] = [];

  for (const m of membros) {
    const nascimento = parseBRDate(m.birthdate);
    if (!nascimento) continue;
    const ocorrencia = findBirthdayOccurrence(nascimento, rangeDates);
    if (!ocorrencia) continue;
    aniversariantes.push({
      id: m.id,
      name: m.name,
      ocorrencia,
      idadeCompleta: ocorrencia.getUTCFullYear() - nascimento.getUTCFullYear(),
      tipo: "Membro",
      responsavel: null,
    });
  }

  for (const f of familiares) {
    const nascimento = parseBRDate(f.birthdate);
    if (!nascimento) continue;
    const ocorrencia = findBirthdayOccurrence(nascimento, rangeDates);
    if (!ocorrencia) continue;
    aniversariantes.push({
      id: f.id,
      name: f.name,
      ocorrencia,
      idadeCompleta: ocorrencia.getUTCFullYear() - nascimento.getUTCFullYear(),
      tipo: f.relationship,
      responsavel: f.member_name,
    });
  }

  aniversariantes.sort((a, b) => a.ocorrencia.getTime() - b.ocorrencia.getTime());

  const boletimTexto = [
    `🎂 Aniversariantes (${formatDiaMes(fromDate)} a ${formatDiaMes(toDate)})`,
    "",
    ...aniversariantes.map((a) => `• ${a.name} — ${formatDiaMes(a.ocorrencia)}`),
  ].join("\n");

  const presets = [
    { key: "semana", label: "Esta semana" },
    { key: "proxima-semana", label: "Próxima semana" },
    { key: "mes", label: "Este mês" },
  ];

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Aniversariantes"
        description="Membros e familiares cadastrados que fazem aniversário no período — pronto para o boletim."
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/membros"
          className="mb-6 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para Membros
        </Link>

        <Card className="space-y-4 p-6">
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Link
                key={p.key}
                href={`/admin/aniversariantes?preset=${p.key}`}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                  preset === p.key && !params.from
                    ? "bg-primary text-white"
                    : "border border-black/10 text-text-neutral/70 hover:border-primary/40"
                }`}
              >
                {p.label}
              </Link>
            ))}
          </div>

          <form className="flex flex-wrap items-end gap-3" method="get">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                De
              </label>
              <input
                type="date"
                name="from"
                defaultValue={range.from}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Até
              </label>
              <input
                type="date"
                name="to"
                defaultValue={range.to}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-secondary px-5 py-2 text-sm font-bold text-primary hover:bg-secondary-light"
            >
              Filtrar
            </button>
          </form>
        </Card>

        <Card className="mt-6 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-primary">
            <Cake className="h-5 w-5" />
            Aniversariantes ({aniversariantes.length})
          </h2>

          {aniversariantes.length === 0 ? (
            <p className="text-sm text-text-neutral/60">
              Nenhum aniversariante no período selecionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                    <th className="py-2 pr-4">Nome completo</th>
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Completa</th>
                    <th className="py-2 pr-4">Vínculo</th>
                  </tr>
                </thead>
                <tbody>
                  {aniversariantes.map((a) => (
                    <tr key={a.id} className="border-b border-black/5">
                      <td className="py-3 pr-4 font-semibold text-text-neutral">{a.name}</td>
                      <td className="py-3 pr-4 text-text-neutral/80">
                        {formatDiaMesLongo(a.ocorrencia)}
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/80">{a.idadeCompleta} anos</td>
                      <td className="py-3 pr-4 text-text-neutral/70">
                        {a.tipo}
                        {a.responsavel ? ` de ${a.responsavel}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {aniversariantes.length > 0 && (
          <Card className="mt-6 p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold text-primary">
                Texto para o boletim
              </h2>
              <CopyTextButton text={boletimTexto} />
            </div>
            <pre className="whitespace-pre-wrap rounded-xl bg-bg-light p-4 text-sm text-text-neutral">
              {boletimTexto}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}

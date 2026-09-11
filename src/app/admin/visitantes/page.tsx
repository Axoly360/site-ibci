import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { QrCode } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { VISITOR_EVENT_OPTIONS, visitorEventLabel } from "@/data/visitorEvents";

export const metadata: Metadata = {
  title: "Visitantes | Painel IBCI",
  robots: { index: false, follow: false },
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminVisitantesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; evento?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "visitantes")) redirect("/admin");

  const params = await searchParams;
  // Passa null (não string vazia) para os parâmetros ausentes: "''::date" é
  // um erro de cast no Postgres, enquanto "null::date" é sempre válido — e o
  // Postgres não garante avaliação preguiçosa do OR, então o cast de ambos os
  // lados pode rodar mesmo quando o filtro não foi informado.
  const from = params.from || null;
  const to = params.to || null;
  const eventoFiltro = params.evento || null;

  const eventosNoBanco = await sql`
    select distinct event_slug from visitor_registrations
    where event_slug is not null
    order by event_slug asc
  `;
  // Junta os presets fixos com quaisquer outros slugs que já existam no
  // banco (ex.: usados antes destes presets existirem), sem duplicar.
  const presetSlugs = new Set(VISITOR_EVENT_OPTIONS.map((e) => e.slug));
  const eventosDisponiveis = [
    ...VISITOR_EVENT_OPTIONS,
    ...eventosNoBanco
      .filter((e) => !presetSlugs.has(e.event_slug))
      .map((e) => ({ slug: e.event_slug, label: e.event_slug })),
  ];

  // "__geral__" significa "sem evento" (event_slug is null) — não dá pra
  // expressar isso com uma comparação de igualdade simples, então trata à
  // parte em vez de um único WHERE genérico.
  const visitantes =
    eventoFiltro === "__geral__"
      ? await sql`
          select id, name, whatsapp, sex, first_visit, visit_times, is_christian, church_name,
                 location, event_slug, created_at
          from visitor_registrations
          where event_slug is null
            and (${from}::date is null or created_at >= ${from}::date)
            and (${to}::date is null or created_at < (${to}::date + interval '1 day'))
          order by created_at desc
        `
      : await sql`
          select id, name, whatsapp, sex, first_visit, visit_times, is_christian, church_name,
                 location, event_slug, created_at
          from visitor_registrations
          where (${from}::date is null or created_at >= ${from}::date)
            and (${to}::date is null or created_at < (${to}::date + interval '1 day'))
            and (${eventoFiltro}::text is null or event_slug = ${eventoFiltro})
          order by created_at desc
        `;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Visitantes"
        description="Cadastros espontâneos para follow-up da recepção e ação social."
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/visitantes/qrcode"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
        >
          <QrCode className="h-4 w-4" />
          Gerar QR Code para imprimir
        </Link>

        <Card className="p-6">
          <form className="mb-6 flex flex-wrap items-end gap-3" method="get">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                De
              </label>
              <input
                type="date"
                name="from"
                defaultValue={from ?? ""}
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
                defaultValue={to ?? ""}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Evento
              </label>
              <select
                name="evento"
                defaultValue={eventoFiltro ?? ""}
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              >
                <option value="">Todos</option>
                <option value="__geral__">Visita geral (sem evento)</option>
                {eventosDisponiveis.map((e) => (
                  <option key={e.slug} value={e.slug}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-full bg-secondary px-5 py-2 text-sm font-bold text-primary hover:bg-secondary-light"
            >
              Filtrar
            </button>
          </form>

          <div className="mb-4 text-sm font-semibold text-text-neutral/70">
            {visitantes.length}{" "}
            {visitantes.length === 1 ? "visitante encontrado" : "visitantes encontrados"}
          </div>

          {visitantes.length === 0 ? (
            <p className="text-sm text-text-neutral/60">
              Nenhum visitante cadastrado no período selecionado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                    <th className="py-2 pr-4">Nome</th>
                    <th className="py-2 pr-4">WhatsApp</th>
                    <th className="py-2 pr-4">Visita</th>
                    <th className="py-2 pr-4">Igreja</th>
                    <th className="py-2 pr-4">Local</th>
                    <th className="py-2 pr-4">Evento</th>
                    <th className="py-2 pr-4">Cadastrado em</th>
                  </tr>
                </thead>
                <tbody>
                  {visitantes.map((v) => (
                    <tr key={v.id} className="border-b border-black/5">
                      <td className="py-3 pr-4 font-semibold text-text-neutral">{v.name}</td>
                      <td className="py-3 pr-4 text-text-neutral/80">{v.whatsapp || "—"}</td>
                      <td className="py-3 pr-4 text-text-neutral/80">
                        {v.first_visit
                          ? "Primeira vez"
                          : `Já visitou${v.visit_times ? ` (${v.visit_times}x)` : ""}`}
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/80">
                        {v.is_christian ? v.church_name || "Sim (não informou qual)" : "Não"}
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/80">{v.location || "—"}</td>
                      <td className="py-3 pr-4 text-text-neutral/80">
                        {v.event_slug ? visitorEventLabel(v.event_slug) : "Visita geral"}
                      </td>
                      <td className="py-3 pr-4 text-text-neutral/70">
                        {formatDate(v.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

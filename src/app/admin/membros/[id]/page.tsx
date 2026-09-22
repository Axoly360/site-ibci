import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import {
  Baby,
  Banknote,
  CalendarCheck,
  FileCheck2,
  FileText,
  HeartHandshake,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { parseBRDate } from "@/lib/masks";
import { resolvePrivateFileUrl } from "@/lib/privateFiles";

export const metadata: Metadata = {
  title: "Perfil do Membro | Painel IBCI",
  robots: { index: false, follow: false },
};

/** Só para timestamptz (created_at, requested_at etc.) — nunca para
 * birthdate/baptism_date/arrival_date, que já vêm salvos como "dd/mm/aaaa"
 * e devem ser exibidos direto (ver parseBRDate em @/lib/masks). */
function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("pt-BR");
}

function formatCurrency(value: string | number) {
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function calcAge(birthdate: string | null): number | null {
  const parsed = parseBRDate(birthdate);
  if (!parsed) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - parsed.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - parsed.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < parsed.getUTCDate())) {
    age -= 1;
  }
  return age;
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-primary">
        {icon}
        {title}
      </h2>
      {children}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
        {label}
      </p>
      <p className="text-text-neutral">{value || "—"}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    aprovado: "bg-primary/10 text-primary",
    pendente: "bg-amber-50 text-amber-700",
    recusado: "bg-red-50 text-red-600",
  };
  const labels: Record<string, string> = {
    aprovado: "Aprovado",
    pendente: "Pendente",
    recusado: "Recusado",
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-black/5 text-text-neutral/70"}`}
    >
      {labels[status] || status}
    </span>
  );
}

export default async function AdminMembroDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");
  // Resumo financeiro é sensível — só quem tem a permissão "financeiro"
  // (Administrador geral ou o setor Financeiro) deve ver comprovantes e
  // lançamentos do membro. Secretaria e outros setores não veem essa seção.
  const podeVerFinanceiro = hasPermission(session, "financeiro");

  const { id } = await params;

  const [member] = await sql`
    select id, name, email, member_number, is_validated_member, is_leadership, church_role,
           phone, cpf, birthdate, address, time_at_church, photo_url, baptism_date, arrival_date,
           marital_status, birthplace, profession, created_at
    from members
    where id = ${id}
  `;
  if (!member) notFound();
  member.photo_url = resolvePrivateFileUrl(member.photo_url);

  const [
    grupos,
    gruposPendentes,
    voluntariadoRows,
    comprovantes,
    lancamentos,
    agendamentos,
    inscricoesEventos,
    familiares,
    consentimentos,
    arquivos,
    historicoSolicitacoes,
  ] = await Promise.all([
    sql`
      select member_groups.id, member_groups.name, member_groups.leader_name,
             member_groups.meeting_day, member_groups.location, member_group_members.joined_at
      from member_group_members
      join member_groups on member_groups.id = member_group_members.group_id
      where member_group_members.member_id = ${id}
      order by member_groups.name asc
    `,
    sql`
      select group_join_requests.id, member_groups.name, group_join_requests.requested_at
      from group_join_requests
      join member_groups on member_groups.id = group_join_requests.group_id
      where group_join_requests.member_id = ${id} and group_join_requests.status = 'pendente'
      order by group_join_requests.requested_at asc
    `,
    sql`
      select ministries, note, updated_at
      from volunteer_registrations
      where member_id = ${id}
    `,
    podeVerFinanceiro
      ? sql`
          select id, type, category, amount, status, note, file_url, created_at
          from contribution_receipts
          where member_id = ${id}
          order by created_at desc
        `
      : Promise.resolve([]),
    podeVerFinanceiro
      ? sql`
          select financial_entries.id, financial_entries.type, financial_entries.category,
                 financial_entries.amount, financial_entries.entry_date, financial_entries.description,
                 financial_entries.receipt_url, congregations.name as congregation_name
          from financial_entries
          left join congregations on congregations.id = financial_entries.congregation_id
          where financial_entries.member_id = ${id}
          order by financial_entries.entry_date desc
        `
      : Promise.resolve([]),
    sql`
      select id, event_type, desired_date, message, status, requested_at, decided_at
      from booking_requests
      where member_id = ${id}
      order by requested_at desc
    `,
    sql`
      select registrations.id, registrations.created_at, registrations.event_slug,
             events.title, events.date_label
      from registrations
      left join events on events.slug = registrations.event_slug
      where registrations.member_id = ${id}
      order by registrations.created_at desc
    `,
    sql`
      select id, name, birthdate, sex, relationship from member_children
      where member_id = ${id}
      order by (relationship = 'Filho(a)') asc, name asc
    `,
    sql`
      select term_key, accepted_at from member_consents
      where member_id = ${id}
      order by accepted_at desc
    `,
    sql`
      select id, file_name, file_url, uploaded_at from member_files
      where member_id = ${id}
      order by uploaded_at desc
    `,
    sql`
      select id, status, requested_at, decided_at, note from membership_requests
      where member_id = ${id}
      order by requested_at desc
    `,
  ]);

  for (const c of comprovantes) c.file_url = resolvePrivateFileUrl(c.file_url);
  for (const f of arquivos) f.file_url = resolvePrivateFileUrl(f.file_url);

  const voluntariado = voluntariadoRows[0] as
    | { ministries: string[]; note: string | null; updated_at: string }
    | undefined;

  const totalEntradas = lancamentos
    .filter((l) => l.type === "entrada")
    .reduce((sum, l) => sum + Number(l.amount), 0);
  const totalSaidas = lancamentos
    .filter((l) => l.type === "saida")
    .reduce((sum, l) => sum + Number(l.amount), 0);
  const comprovantesPendentes = comprovantes.filter((c) => c.status === "pendente").length;

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner title="Perfil do Membro" description={member.name} />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/membros"
          className="mb-6 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para Membros
        </Link>

        <div className="flex flex-col gap-6">
          {/* Cabeçalho / cadastro */}
          <Card className="p-6 sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-primary/10 bg-black/5">
                {member.photo_url ? (
                  <Image
                    src={member.photo_url}
                    alt={member.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-text-neutral/30">
                    <UserRound className="h-10 w-10" />
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-heading text-2xl font-bold text-primary">{member.name}</h2>
                <p className="text-sm font-semibold text-text-neutral/60">
                  {member.is_leadership ? member.church_role || "Liderança" : "Membro"}
                  {" · Membro desde "}
                  {formatDate(member.created_at)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    IBCI{String(member.member_number).padStart(4, "0")}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      member.is_validated_member
                        ? "bg-primary/10 text-primary"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {member.is_validated_member ? "Validado" : "Não validado"}
                  </span>
                  {podeVerFinanceiro && comprovantesPendentes > 0 && (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      {comprovantesPendentes} comprovante(s) pendente(s)
                    </span>
                  )}
                </div>
              </div>
              {podeVerFinanceiro && (
                <Link
                  href={`/admin/financeiro/lancamentos?nome=${encodeURIComponent(member.name)}`}
                  className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary px-5 py-2.5 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-secondary-light"
                >
                  <Banknote className="h-4 w-4" />
                  Ver no Financeiro
                </Link>
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="E-mail" value={member.email} />
              <Field label="Telefone / WhatsApp" value={member.phone} />
              <Field label="CPF" value={member.cpf} />
              <Field label="Data de nascimento" value={member.birthdate} />
              <Field label="Estado civil" value={member.marital_status} />
              <Field label="Naturalidade" value={member.birthplace} />
              <Field label="Profissão" value={member.profession} />
              <Field label="Batismo" value={member.baptism_date} />
              <Field label="Chegada na IBCI" value={member.arrival_date} />
              <Field label="Há quanto tempo na IBCI" value={member.time_at_church} />
              <div className="sm:col-span-2 lg:col-span-3">
                <Field label="Endereço" value={member.address} />
              </div>
            </div>
          </Card>

          {/* Grupo Familiar */}
          <SectionCard icon={<Baby className="h-5 w-5" />} title="Grupo Familiar">
            {familiares.length === 0 ? (
              <p className="text-sm text-text-neutral/60">Nenhum familiar cadastrado.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {familiares.map((f) => {
                  const isChild = f.relationship === "Filho(a)";
                  const age = calcAge(f.birthdate);
                  return (
                    <div
                      key={f.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
                        isChild ? "border-sky-200 bg-sky-50/60" : "border-black/5"
                      }`}
                    >
                      <div>
                        <span className="font-semibold text-text-neutral">{f.name}</span>
                        {f.birthdate && (
                          <span className="text-text-neutral/60"> · {f.birthdate}</span>
                        )}
                        {age !== null && (
                          <span className="text-text-neutral/60"> · {age} anos</span>
                        )}
                        {f.sex && <span className="text-text-neutral/50"> · {f.sex}</span>}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                          isChild ? "bg-sky-100 text-sky-700" : "bg-black/5 text-text-neutral/70"
                        }`}
                      >
                        {f.relationship}
                        {isChild && age !== null && age <= 12 ? " · Ministério Infantil" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Grupos/células */}
          <SectionCard icon={<Users className="h-5 w-5" />} title="Grupos e células">
            {grupos.length === 0 && gruposPendentes.length === 0 ? (
              <p className="text-sm text-text-neutral/60">Não participa de nenhum grupo.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {grupos.map((g) => (
                  <Link
                    key={g.id}
                    href={`/admin/grupos/${g.id}`}
                    className="flex items-center justify-between rounded-xl border border-black/5 px-4 py-3 text-sm hover:bg-black/5"
                  >
                    <div>
                      <p className="font-semibold text-text-neutral">{g.name}</p>
                      <p className="text-text-neutral/60">
                        {[g.leader_name, g.meeting_day, g.location].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-text-neutral/50">
                      Desde {formatDate(g.joined_at)}
                    </span>
                  </Link>
                ))}
                {gruposPendentes.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm"
                  >
                    <p className="font-semibold text-text-neutral">{g.name}</p>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Pedido pendente
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Voluntariado */}
          <SectionCard icon={<HeartHandshake className="h-5 w-5" />} title="Voluntariado">
            {!voluntariado ? (
              <p className="text-sm text-text-neutral/60">
                Não fez cadastro de voluntariado.
              </p>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2">
                  {voluntariado.ministries.map((m) => (
                    <span
                      key={m}
                      className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                    >
                      {m}
                    </span>
                  ))}
                </div>
                {voluntariado.note && (
                  <p className="mt-3 text-sm text-text-neutral/70">{voluntariado.note}</p>
                )}
                <p className="mt-2 text-xs text-text-neutral/50">
                  Atualizado em {formatDate(voluntariado.updated_at)}
                </p>
              </div>
            )}
          </SectionCard>

          {/* Financeiro — só quem tem a permissão "financeiro" (Administrador
              geral ou setor Financeiro) vê esta seção. */}
          {podeVerFinanceiro && (
          <SectionCard icon={<Banknote className="h-5 w-5" />} title="Financeiro">
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-primary/5 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-text-neutral/50">Entradas</p>
                <p className="mt-1 font-heading text-lg font-bold text-primary">
                  {formatCurrency(totalEntradas)}
                </p>
              </div>
              <div className="rounded-xl bg-red-50 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-text-neutral/50">Saídas</p>
                <p className="mt-1 font-heading text-lg font-bold text-red-600">
                  {formatCurrency(totalSaidas)}
                </p>
              </div>
              <div className="rounded-xl bg-black/5 p-4 text-center">
                <p className="text-xs font-semibold uppercase text-text-neutral/50">
                  Comprovantes enviados
                </p>
                <p className="mt-1 font-heading text-lg font-bold text-text-neutral">
                  {comprovantes.length}
                </p>
              </div>
            </div>

            {lancamentos.length === 0 && comprovantes.length === 0 ? (
              <p className="text-sm text-text-neutral/60">
                Nenhum lançamento ou comprovante registrado.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {lancamentos.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
                      Lançamentos
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {lancamentos.map((l) => (
                        <div
                          key={l.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-black/5 px-3 py-2 text-sm"
                        >
                          <div>
                            <span
                              className={`font-semibold ${l.type === "entrada" ? "text-primary" : "text-red-600"}`}
                            >
                              {l.type === "entrada" ? "Entrada" : "Saída"}
                            </span>
                            <span className="text-text-neutral/70"> · {l.category}</span>
                            {l.congregation_name && (
                              <span className="text-text-neutral/50"> · {l.congregation_name}</span>
                            )}
                            <span className="text-text-neutral/50">
                              {" "}
                              · {formatDate(l.entry_date)}
                            </span>
                          </div>
                          <span className="shrink-0 font-semibold text-text-neutral">
                            {formatCurrency(l.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {comprovantes.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
                      Comprovantes enviados
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {comprovantes.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-black/5 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <span className="font-semibold text-text-neutral">
                              {c.type === "entrada" ? "Entrada" : "Saída"}
                            </span>
                            <span className="text-text-neutral/70"> · {c.category || "—"}</span>
                            <span className="text-text-neutral/50">
                              {" "}
                              · {formatDate(c.created_at)}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {c.amount && (
                              <span className="font-semibold text-text-neutral">
                                {formatCurrency(c.amount)}
                              </span>
                            )}
                            <StatusBadge status={c.status} />
                            {c.file_url && (
                              <a
                                href={c.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-secondary hover:underline"
                                aria-label="Ver comprovante"
                              >
                                <FileText className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
          )}

          {/* Eventos e agendamentos */}
          <SectionCard icon={<CalendarCheck className="h-5 w-5" />} title="Eventos e agendamentos">
            {inscricoesEventos.length === 0 && agendamentos.length === 0 ? (
              <p className="text-sm text-text-neutral/60">
                Nenhuma inscrição em evento ou agendamento.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {inscricoesEventos.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
                      Inscrições em eventos
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {inscricoesEventos.map((e) => (
                        <div
                          key={e.id}
                          className="rounded-lg border border-black/5 px-3 py-2 text-sm"
                        >
                          <span className="font-semibold text-text-neutral">
                            {e.title || e.event_slug}
                          </span>
                          {e.date_label && (
                            <span className="text-text-neutral/60"> · {e.date_label}</span>
                          )}
                          <span className="text-text-neutral/50">
                            {" "}
                            · inscrito em {formatDate(e.created_at)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {agendamentos.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
                      Solicitações de agendamento
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {agendamentos.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-black/5 px-3 py-2 text-sm"
                        >
                          <div>
                            <span className="font-semibold text-text-neutral">{a.event_type}</span>
                            {a.desired_date && (
                              <span className="text-text-neutral/60"> · {a.desired_date}</span>
                            )}
                          </div>
                          <StatusBadge status={a.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Documentos e consentimentos */}
          <SectionCard icon={<FileCheck2 className="h-5 w-5" />} title="Documentos e consentimentos">
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
                  Arquivos anexados pelo admin
                </p>
                {arquivos.length === 0 ? (
                  <p className="text-sm text-text-neutral/60">Nenhum arquivo anexado.</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {arquivos.map((f) => (
                      <a
                        key={f.id}
                        href={f.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-secondary hover:underline"
                      >
                        <FileText className="h-4 w-4 shrink-0" />
                        {f.file_name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
                  Termos aceitos (LGPD)
                </p>
                {consentimentos.length === 0 ? (
                  <p className="text-sm text-text-neutral/60">Nenhum termo aceito ainda.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {consentimentos.map((c) => (
                      <span
                        key={c.term_key}
                        className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                        title={`Aceito em ${formatDateTime(c.accepted_at)}`}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {c.term_key}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          {/* Histórico de cadastro de membro */}
          <SectionCard icon={<UserRound className="h-5 w-5" />} title="Histórico de cadastro">
            {historicoSolicitacoes.length === 0 ? (
              <p className="text-sm text-text-neutral/60">Sem histórico de solicitação.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {historicoSolicitacoes.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-black/5 px-3 py-2 text-sm"
                  >
                    <span className="text-text-neutral/70">
                      Solicitado em {formatDate(h.requested_at)}
                      {h.decided_at ? ` · decidido em ${formatDate(h.decided_at)}` : ""}
                    </span>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

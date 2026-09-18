import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import MembershipQueueManager from "@/components/admin/MembershipQueueManager";
import EscalaUploadPanel from "@/components/admin/EscalaUploadPanel";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Membros | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminMembrosPage({
  searchParams,
}: {
  searchParams: Promise<{ nome?: string; cpf?: string; from?: string; to?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const params = await searchParams;
  const nome = params.nome?.trim() || null;
  const cpf = params.cpf?.trim() || null;
  const from = params.from || null;
  const to = params.to || null;
  // "Membros validados" é o diretório pesquisável; pendentes/decididos
  // recentemente continuam mostrando a fila inteira, sem filtro, já que são
  // listas de trabalho pequenas (não uma busca).
  const filtroAtivo = Boolean(nome || cpf || from || to);

  const pendentes = await sql`
    select membership_requests.id, members.id as member_id, members.name, members.email,
           membership_requests.phone, membership_requests.cpf,
           membership_requests.birthdate, membership_requests.address,
           membership_requests.time_at_church, membership_requests.note,
           membership_requests.requested_at, membership_requests.status
    from membership_requests
    join members on members.id = membership_requests.member_id
    where membership_requests.status = 'pendente'
    order by membership_requests.requested_at asc
  `;

  const recentes = await sql`
    select membership_requests.id, members.id as member_id, members.name, members.email,
           membership_requests.phone, membership_requests.cpf,
           membership_requests.birthdate, membership_requests.address,
           membership_requests.time_at_church, membership_requests.note,
           membership_requests.requested_at, membership_requests.status
    from membership_requests
    join members on members.id = membership_requests.member_id
    where membership_requests.status != 'pendente'
    order by membership_requests.decided_at desc
    limit 10
  `;

  const validados = await sql`
    select id, name, email, cpf, member_number, is_leadership, church_role
    from members
    where is_validated_member = true
      and (${nome}::text is null or name ilike '%' || ${nome} || '%')
      and (${cpf}::text is null or cpf ilike '%' || ${cpf} || '%')
      and (${from}::date is null or created_at >= ${from}::date)
      and (${to}::date is null or created_at < (${to}::date + interval '1 day'))
    order by name asc
  `;

  const arquivos = await sql`
    select id, member_id, file_name, file_url, uploaded_at
    from member_files
    order by uploaded_at desc
  `;
  const arquivosPorMembro = new Map<string, typeof arquivos>();
  for (const arquivo of arquivos) {
    const lista = arquivosPorMembro.get(arquivo.member_id) ?? [];
    lista.push(arquivo);
    arquivosPorMembro.set(arquivo.member_id, lista);
  }
  const validadosComArquivos = validados.map((m) => ({
    ...m,
    files: arquivosPorMembro.get(m.id) ?? [],
  }));

  const escalaImageUrl = await getContent("escala.image_url", "/escala-setembro-2026.jpeg");

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Membros"
        description="Cadastros de membro aguardando a validação da diretoria."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <EscalaUploadPanel currentUrl={escalaImageUrl} />

        <Card className="mt-10 p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-primary">
            Buscar membro validado
          </h2>
          <form className="flex flex-wrap items-end gap-3" method="get">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Nome
              </label>
              <input
                type="text"
                name="nome"
                defaultValue={nome ?? ""}
                placeholder="Buscar por nome"
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                CPF
              </label>
              <input
                type="text"
                name="cpf"
                defaultValue={cpf ?? ""}
                placeholder="Buscar por CPF"
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Membro desde (de)
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
            <button
              type="submit"
              className="rounded-full bg-secondary px-5 py-2 text-sm font-bold text-primary hover:bg-secondary-light"
            >
              Filtrar
            </button>
            {filtroAtivo && (
              <Link
                href="/admin/membros"
                className="text-sm font-semibold text-text-neutral/60 hover:underline"
              >
                Limpar filtros
              </Link>
            )}
          </form>
          <p className="mt-3 text-xs text-text-neutral/50">
            A busca filtra apenas a lista de &quot;Membros validados&quot; abaixo. Para
            ver o perfil completo (grupos, financeiro, voluntariado etc.), clique em
            &quot;Ver perfil&quot; em qualquer membro.
          </p>
        </Card>

        <div className="mt-10">
          <MembershipQueueManager
            pendentes={pendentes}
            recentes={recentes}
            validados={validadosComArquivos}
            filtroAtivo={filtroAtivo}
          />
        </div>
      </div>
    </div>
  );
}

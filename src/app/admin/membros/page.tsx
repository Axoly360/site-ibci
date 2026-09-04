import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import MembershipQueueManager from "@/components/admin/MembershipQueueManager";
import EscalaUploadPanel from "@/components/admin/EscalaUploadPanel";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Membros | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminMembrosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const pendentes = await sql`
    select membership_requests.id, members.name, members.email,
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
    select membership_requests.id, members.name, members.email,
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
    select id, name, email, is_leadership, church_role from members
    where is_validated_member = true
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
        <div className="mt-10">
          <MembershipQueueManager
            pendentes={pendentes}
            recentes={recentes}
            validados={validadosComArquivos}
          />
        </div>
      </div>
    </div>
  );
}

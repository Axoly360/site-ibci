import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import ContentEditForm from "@/components/admin/ContentEditForm";
import AdminNav from "@/components/admin/AdminNav";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Painel IBCI",
  robots: { index: false, follow: false },
};

const ACESSO_RAPIDO_SUBTITLE_KEY = "home.acessoRapido.subtitle";
const ACESSO_RAPIDO_SUBTITLE_FALLBACK =
  "Tudo o que você precisa saber sobre a nossa igreja, em um só lugar.";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/entrar");
  }

  const podeEditarPaginas = hasPermission(session, "paginas");
  const subtitle = podeEditarPaginas
    ? await getContent(ACESSO_RAPIDO_SUBTITLE_KEY, ACESSO_RAPIDO_SUBTITLE_FALLBACK)
    : "";

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Painel IBCI"
        description={`Olá, ${session.name} — você está logado como ${session.role}.`}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {podeEditarPaginas ? (
          <>
            <ContentEditForm
              contentKey={ACESSO_RAPIDO_SUBTITLE_KEY}
              label='Subtítulo da seção "Acesso Rápido" (home)'
              initialValue={subtitle}
              path="/"
            />
            <p className="mt-6 text-center text-sm text-text-neutral/60">
              Este é um teste do primeiro texto editável. Mais textos, banners e
              eventos entram aqui conforme o painel avançar.
            </p>
          </>
        ) : (
          <p className="text-center text-text-neutral/70">
            Sua função ({session.role}) não inclui edição de páginas e textos.
          </p>
        )}
      </div>
    </div>
  );
}

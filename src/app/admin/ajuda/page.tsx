import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import HelpCenter from "@/components/help/HelpCenter";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getHelpArticles } from "@/data/helpArticles";

export const metadata: Metadata = {
  title: "Ajuda | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminAjudaPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");

  // Nunca filtrar só no client: um admin sem a permissão nunca recebe o
  // artigo, nem na resposta do servidor.
  const articles = getHelpArticles("admin").filter(
    (article) => !article.permission || hasPermission(session, article.permission)
  );

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Ajuda"
        description="Manuais de uso do painel, filtrados pelo que você tem acesso."
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <HelpCenter articles={articles} />
      </div>
    </div>
  );
}

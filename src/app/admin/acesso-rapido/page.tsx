import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import AccessCardsManager from "@/components/admin/AccessCardsManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getQuickAccessCards } from "@/lib/quickAccess";

export const metadata: Metadata = {
  title: "Acesso Rápido | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminAcessoRapidoPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "paginas")) redirect("/admin");

  const cards = await getQuickAccessCards();

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Acesso Rápido"
        description="Cards exibidos na seção Acesso Rápido, na home."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <AccessCardsManager cards={cards} />
      </div>
    </div>
  );
}

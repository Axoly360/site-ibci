import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import DocumentUploadPanel from "@/components/admin/DocumentUploadPanel";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Documentos | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminDocumentosPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "paginas")) redirect("/admin");

  const texts = await getAllContent();

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Documentos"
        description="Estatuto e Regimento Interno, exibidos em Estatuto IBCI."
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
        <DocumentUploadPanel
          docType="estatuto"
          label="Estatuto"
          currentUrl={texts["documentos.estatuto.url"] ?? null}
        />
        <DocumentUploadPanel
          docType="regimento"
          label="Regimento Interno"
          currentUrl={texts["documentos.regimento.url"] ?? null}
        />
      </div>
    </div>
  );
}

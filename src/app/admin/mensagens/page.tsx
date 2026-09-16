import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import SermonVideosManager from "@/components/admin/SermonVideosManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getSermonVideos } from "@/lib/sermonVideos";

export const metadata: Metadata = {
  title: "Últimas Mensagens | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminMensagensPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "paginas")) redirect("/admin");

  const videos = await getSermonVideos();

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Últimas Mensagens"
        description="Vídeos do YouTube exibidos na seção Últimas Mensagens, na home."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <SermonVideosManager videos={videos} />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import BannerManager from "@/components/admin/BannerManager";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getContentBlocks } from "@/lib/contentBlocks";
import { heroBanners } from "@/data/heroBanners";

export const metadata: Metadata = {
  title: "Banners | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminBannersPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "banners")) redirect("/admin");

  const blocks = await getContentBlocks();

  const heroSlots = heroBanners.map((banner) => ({
    key: banner.id,
    label: `Hero — ${banner.placeholderTitle ?? banner.id}`,
    hasMobileImage: true,
    currentImage: blocks[banner.id]?.image_url ?? banner.srcDesktop ?? null,
    currentImageMobile: blocks[banner.id]?.image_mobile_url ?? banner.srcMobile ?? null,
    currentTitle: blocks[banner.id]?.title ?? banner.alt ?? null,
    currentLink: blocks[banner.id]?.link_url ?? banner.href ?? null,
  }));

  const otherSlots = [
    {
      key: "highlight-pepe",
      label: "Destaque — Projeto PEPE",
      currentImage: blocks["highlight-pepe"]?.image_url ?? "/highlight-pepe.png",
      currentTitle: blocks["highlight-pepe"]?.title ?? "Projeto PEPE IBCI",
      currentLink: blocks["highlight-pepe"]?.link_url ?? "/para-voce/projeto-pepe",
    },
    {
      key: "highlight-evento-principal",
      label: "Destaque — Congregação Milagres",
      currentImage:
        blocks["highlight-evento-principal"]?.image_url ?? "/highlight-evento-principal.png",
      currentTitle:
        blocks["highlight-evento-principal"]?.title ?? "Congregação IBCI Milagres",
      currentLink:
        blocks["highlight-evento-principal"]?.link_url ?? "/a-igreja/nossa-congregacao",
    },
    {
      key: "banner-principal",
      label: "Banner Principal",
      currentImage: blocks["banner-principal"]?.image_url ?? "/banner-principal.png",
      currentTitle: blocks["banner-principal"]?.title ?? "Congresso de Casais",
      currentLink:
        blocks["banner-principal"]?.link_url ?? "/para-voce/eventos/congresso-de-casais",
    },
  ];

  const videoSlot = {
    key: "institutional-video",
    label: "Vídeo Institucional — Conheça a IBCI",
    hasVideo: true,
    currentVideo:
      blocks["institutional-video"]?.video_url ??
      "https://www.youtube.com/watch?v=6QYUSWm85gY",
  };

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Banners"
        description="Troque imagens, textos, links e o vídeo institucional da home."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-3 font-heading text-xl font-bold text-primary">
              Hero (carrossel do topo)
            </h2>
            <div className="flex flex-col gap-6">
              {heroSlots.map((slot) => (
                <BannerManager key={slot.key} slot={slot} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-heading text-xl font-bold text-primary">
              Destaques e Banner Principal
            </h2>
            <div className="flex flex-col gap-6">
              {otherSlots.map((slot) => (
                <BannerManager key={slot.key} slot={slot} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 font-heading text-xl font-bold text-primary">Vídeo</h2>
            <BannerManager slot={videoSlot} />
          </div>
        </div>
      </div>
    </div>
  );
}

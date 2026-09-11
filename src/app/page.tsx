import HeroSection from "@/components/home/HeroSection";
import QuickAccessSection from "@/components/home/QuickAccessSection";
import HighlightBannersSection from "@/components/home/HighlightBannersSection";
import LatestSermonSection from "@/components/home/LatestSermonSection";
import EventsOfMonthSection from "@/components/home/EventsOfMonthSection";
import MainBannerSection from "@/components/home/MainBannerSection";
import WeeklyScheduleSection from "@/components/home/WeeklyScheduleSection";
import InstitutionalVideoSection from "@/components/home/InstitutionalVideoSection";
import { getAllContent } from "@/lib/content";
import { getContentBlocks } from "@/lib/contentBlocks";
import { heroBanners } from "@/data/heroBanners";
import {
  HOME_SECTION_ORDER_KEY,
  parseHomeSectionOrder,
  type HomeSectionKey,
} from "@/lib/homeSections";
import type { ReactNode } from "react";

export default async function Home() {
  const [texts, blocks] = await Promise.all([getAllContent(), getContentBlocks()]);

  const mergedHeroBanners = heroBanners.map((banner) => {
    const override = blocks[banner.id];
    if (!override) return banner;
    return {
      ...banner,
      srcDesktop: override.image_url ?? banner.srcDesktop,
      srcMobile: override.image_mobile_url ?? banner.srcMobile,
      alt: override.title ?? banner.alt,
      href: override.link_url ?? banner.href,
    };
  });

  const pepe = {
    image: blocks["highlight-pepe"]?.image_url ?? "/highlight-pepe.png",
    alt: blocks["highlight-pepe"]?.title ?? "Projeto PEPE IBCI",
    href: blocks["highlight-pepe"]?.link_url ?? "/para-voce/projeto-pepe",
  };
  const eventoPrincipal = {
    image:
      blocks["highlight-evento-principal"]?.image_url ?? "/highlight-evento-principal.png",
    alt: blocks["highlight-evento-principal"]?.title ?? "Congregação IBCI Milagres",
    href: blocks["highlight-evento-principal"]?.link_url ?? "/a-igreja/nossa-congregacao",
  };
  const mainBanner = {
    image: blocks["banner-principal"]?.image_url ?? "/banner-principal.png",
    alt:
      blocks["banner-principal"]?.title ??
      "Congresso de Casais — 12 e 13 de setembro, das 10h às 12h, no Hotel Porto da Serra, Gravatá. Inscrições com Maurício e Gineide. Investimento R$ 350,00 por casal.",
    href: blocks["banner-principal"]?.link_url ?? "/para-voce/eventos/congresso-de-casais",
  };
  const institutionalVideoUrl =
    blocks["institutional-video"]?.video_url ??
    "https://www.youtube.com/watch?v=6QYUSWm85gY";

  // As 3 seções só de imagem (Hero, Destaques, Banner Principal — geridas em
  // /admin/banners) ficam fixas nestes mesmos intervalos; só a ordem das 5
  // seções de texto abaixo é configurável em /admin/textos.
  const sectionNodes: Record<HomeSectionKey, ReactNode> = {
    acessoRapido: (
      <QuickAccessSection
        key="acessoRapido"
        title={texts["home.acessoRapido.title"]}
        subtitle={texts["home.acessoRapido.subtitle"]}
      />
    ),
    ultimasMensagens: (
      <LatestSermonSection
        key="ultimasMensagens"
        title={texts["home.ultimasMensagens.title"]}
        subtitle={texts["home.ultimasMensagens.subtitle"]}
      />
    ),
    eventosDoMes: (
      <EventsOfMonthSection
        key="eventosDoMes"
        title={texts["home.eventosDoMes.title"]}
        subtitle={texts["home.eventosDoMes.subtitle"]}
      />
    ),
    programacaoSemana: (
      <WeeklyScheduleSection
        key="programacaoSemana"
        title={texts["home.programacaoSemana.title"]}
        subtitle={texts["home.programacaoSemana.subtitle"]}
      />
    ),
    conhecaIbci: (
      <InstitutionalVideoSection
        key="conhecaIbci"
        title={texts["home.conhecaIbci.title"]}
        subtitle={texts["home.conhecaIbci.subtitle"]}
        videoUrl={institutionalVideoUrl}
      />
    ),
  };

  const order = parseHomeSectionOrder(texts[HOME_SECTION_ORDER_KEY]);
  const [slot1, slot2, slot3, slot4, slot5] = order.map((key) => sectionNodes[key]);

  return (
    <>
      <HeroSection banners={mergedHeroBanners} />
      {slot1}
      <HighlightBannersSection pepe={pepe} eventoPrincipal={eventoPrincipal} />
      {slot2}
      {slot3}
      <MainBannerSection {...mainBanner} />
      {slot4}
      {slot5}
    </>
  );
}

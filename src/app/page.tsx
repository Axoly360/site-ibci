import HeroSection from "@/components/home/HeroSection";
import QuickAccessSection from "@/components/home/QuickAccessSection";
import HighlightBannersSection from "@/components/home/HighlightBannersSection";
import LatestSermonSection from "@/components/home/LatestSermonSection";
import EventsOfMonthSection from "@/components/home/EventsOfMonthSection";
import MainBannerSection from "@/components/home/MainBannerSection";
import WeeklyScheduleSection from "@/components/home/WeeklyScheduleSection";
import InstitutionalVideoSection from "@/components/home/InstitutionalVideoSection";
import { getContent } from "@/lib/content";
import { getContentBlocks } from "@/lib/contentBlocks";
import { heroBanners } from "@/data/heroBanners";

const ACESSO_RAPIDO_SUBTITLE_FALLBACK =
  "Tudo o que você precisa saber sobre a nossa igreja, em um só lugar.";

export default async function Home() {
  const [acessoRapidoSubtitle, blocks] = await Promise.all([
    getContent("home.acessoRapido.subtitle", ACESSO_RAPIDO_SUBTITLE_FALLBACK),
    getContentBlocks(),
  ]);

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

  return (
    <>
      <HeroSection banners={mergedHeroBanners} />
      <QuickAccessSection subtitle={acessoRapidoSubtitle} />
      <HighlightBannersSection pepe={pepe} eventoPrincipal={eventoPrincipal} />
      <LatestSermonSection />
      <EventsOfMonthSection />
      <MainBannerSection {...mainBanner} />
      <WeeklyScheduleSection />
      <InstitutionalVideoSection videoUrl={institutionalVideoUrl} />
    </>
  );
}

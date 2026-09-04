import HeroSection from "@/components/home/HeroSection";
import QuickAccessSection from "@/components/home/QuickAccessSection";
import HighlightBannersSection from "@/components/home/HighlightBannersSection";
import LatestSermonSection from "@/components/home/LatestSermonSection";
import EventsOfMonthSection from "@/components/home/EventsOfMonthSection";
import MainBannerSection from "@/components/home/MainBannerSection";
import WeeklyScheduleSection from "@/components/home/WeeklyScheduleSection";
import InstitutionalVideoSection from "@/components/home/InstitutionalVideoSection";
import { getContent } from "@/lib/content";

const ACESSO_RAPIDO_SUBTITLE_FALLBACK =
  "Tudo o que você precisa saber sobre a nossa igreja, em um só lugar.";

export default async function Home() {
  const acessoRapidoSubtitle = await getContent(
    "home.acessoRapido.subtitle",
    ACESSO_RAPIDO_SUBTITLE_FALLBACK
  );

  return (
    <>
      <HeroSection />
      <QuickAccessSection subtitle={acessoRapidoSubtitle} />
      <HighlightBannersSection />
      <LatestSermonSection />
      <EventsOfMonthSection />
      <MainBannerSection />
      <WeeklyScheduleSection />
      <InstitutionalVideoSection />
    </>
  );
}

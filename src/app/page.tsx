import HeroSection from "@/components/home/HeroSection";
import QuickAccessSection from "@/components/home/QuickAccessSection";
import HighlightBannersSection from "@/components/home/HighlightBannersSection";
import LatestSermonSection from "@/components/home/LatestSermonSection";
import MainBannerSection from "@/components/home/MainBannerSection";
import WeeklyScheduleSection from "@/components/home/WeeklyScheduleSection";
import InstitutionalVideoSection from "@/components/home/InstitutionalVideoSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <QuickAccessSection />
      <HighlightBannersSection />
      <LatestSermonSection />
      <MainBannerSection />
      <WeeklyScheduleSection />
      <InstitutionalVideoSection />
    </>
  );
}

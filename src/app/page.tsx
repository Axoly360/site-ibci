import HeroSection from "@/components/home/HeroSection";
import QuickAccessSection from "@/components/home/QuickAccessSection";
import LatestSermonSection from "@/components/home/LatestSermonSection";
import WeeklyScheduleSection from "@/components/home/WeeklyScheduleSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <QuickAccessSection />
      <LatestSermonSection />
      <WeeklyScheduleSection />
    </>
  );
}

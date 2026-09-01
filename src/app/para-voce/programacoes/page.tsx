import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import WeeklyScheduleSection from "@/components/home/WeeklyScheduleSection";

export const metadata: Metadata = {
  title: "Programações | IBCI - Igreja Batista Central do Ibura",
  description: "Programação semanal da Igreja Batista Central do Ibura.",
};

export default function ProgramacoesPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Programações" />
      <WeeklyScheduleSection />
    </div>
  );
}

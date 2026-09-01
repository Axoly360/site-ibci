import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import LatestSermonSection from "@/components/home/LatestSermonSection";

export const metadata: Metadata = {
  title: "Mensagens | IBCI - Igreja Batista Central do Ibura",
  description: "Assista às mensagens da Igreja Batista Central do Ibura.",
};

export default function MensagensPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Mensagens" />
      <LatestSermonSection />
    </div>
  );
}

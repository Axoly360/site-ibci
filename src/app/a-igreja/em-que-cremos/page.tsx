import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import FaithAccordion from "@/components/about/FaithAccordion";

export const metadata: Metadata = {
  title: "Em que Cremos | IBCI - Igreja Batista Central do Ibura",
  description:
    "Conheça a declaração de fé da Igreja Batista Central do Ibura, alicerçada na tradição batista.",
};

export default function EmQueCremosPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Em que Cremos"
        description="Nossa declaração de fé, alicerçada na tradição batista."
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <FaithAccordion />
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Galeria de Fotos | IBCI - Igreja Batista Central do Ibura",
  description: "Galeria de fotos da história da Igreja Batista Central do Ibura.",
};

export default function GaleriaDeFotosPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Galeria de Fotos"
        description="As principais imagens da história da IBCI, desde sua fundação."
      />
      <ComingSoon label="a galeria de fotos da IBCI" />
    </div>
  );
}

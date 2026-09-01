import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Ministério de Família | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério de Família da Igreja Batista Central do Ibura.",
};

export default function MinisterioFamiliaPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Ministério de Família" />
      <ComingSoon label="o conteúdo do Ministério de Família" />
    </div>
  );
}

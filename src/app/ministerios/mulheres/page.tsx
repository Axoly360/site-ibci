import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Ministério de Mulheres | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério de Mulheres da Igreja Batista Central do Ibura.",
};

export default function MinisterioMulheresPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Ministério de Mulheres" />
      <ComingSoon label="o conteúdo do Ministério de Mulheres" />
    </div>
  );
}

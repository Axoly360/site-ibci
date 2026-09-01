import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Ministério de Jovens | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério de Jovens da Igreja Batista Central do Ibura.",
};

export default function MinisterioJovensPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Ministério de Jovens" />
      <ComingSoon label="o conteúdo do Ministério de Jovens" />
    </div>
  );
}

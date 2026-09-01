import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Ministério de Homens | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério de Homens da Igreja Batista Central do Ibura.",
};

export default function MinisterioHomensPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Ministério de Homens" />
      <ComingSoon label="o conteúdo do Ministério de Homens" />
    </div>
  );
}

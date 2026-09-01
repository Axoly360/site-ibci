import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Ministério Infantil | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério Infantil da Igreja Batista Central do Ibura.",
};

export default function MinisterioInfantilPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Ministério Infantil" />
      <ComingSoon label="o conteúdo do Ministério Infantil" />
    </div>
  );
}

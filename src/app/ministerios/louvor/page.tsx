import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Ministério de Louvor | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério de Louvor da Igreja Batista Central do Ibura.",
};

export default function MinisterioLouvorPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Ministério de Louvor" />
      <ComingSoon label="o conteúdo do Ministério de Louvor" />
    </div>
  );
}

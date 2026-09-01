import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Projeto PEPE | IBCI - Igreja Batista Central do Ibura",
  description: "Projeto PEPE da Igreja Batista Central do Ibura.",
};

export default function ProjetoPepePage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Projeto PEPE" />
      <ComingSoon label="o Projeto PEPE" />
    </div>
  );
}

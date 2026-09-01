import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Cursos | IBCI - Igreja Batista Central do Ibura",
  description: "Cursos da Igreja Batista Central do Ibura.",
};

export default function CursosPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Cursos" />
      <ComingSoon label="os cursos disponíveis" />
    </div>
  );
}

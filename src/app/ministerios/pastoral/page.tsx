import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Ministério Pastoral | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério Pastoral da Igreja Batista Central do Ibura.",
};

export default function MinisterioPastoralPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Ministério Pastoral" />
      <ComingSoon label="o conteúdo do Ministério Pastoral" />
    </div>
  );
}

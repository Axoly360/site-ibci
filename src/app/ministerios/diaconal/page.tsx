import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Ministério Diaconal | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério Diaconal da Igreja Batista Central do Ibura.",
};

export default function MinisterioDiaconalPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Ministério Diaconal" />
      <ComingSoon label="o conteúdo do Ministério Diaconal" />
    </div>
  );
}

import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Estatuto IBCI | IBCI - Igreja Batista Central do Ibura",
  description: "Estatuto da Igreja Batista Central do Ibura.",
};

export default function EstatutoIbciPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Estatuto IBCI" />
      <ComingSoon label="o Estatuto IBCI" />
    </div>
  );
}

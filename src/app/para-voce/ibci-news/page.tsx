import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "IBCI News | IBCI - Igreja Batista Central do Ibura",
  description: "Notícias e comunicados da Igreja Batista Central do Ibura.",
};

export default function IbciNewsPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="IBCI News" />
      <ComingSoon label="o IBCI News" />
    </div>
  );
}

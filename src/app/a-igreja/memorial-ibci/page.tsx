import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Memorial IBCI | IBCI - Igreja Batista Central do Ibura",
  description: "Memorial da Igreja Batista Central do Ibura.",
};

export default function MemorialIbciPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Memorial IBCI" />
      <ComingSoon label="o Memorial IBCI" />
    </div>
  );
}

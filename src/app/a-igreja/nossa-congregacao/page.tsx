import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Nossa Congregação | IBCI - Igreja Batista Central do Ibura",
  description: "Conheça a congregação da Igreja Batista Central do Ibura.",
};

export default function NossaCongregacaoPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Nossa Congregação" />
      <ComingSoon label="as informações sobre a nossa congregação" />
    </div>
  );
}

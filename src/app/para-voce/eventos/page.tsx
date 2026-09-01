import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import ComingSoon from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Eventos | IBCI - Igreja Batista Central do Ibura",
  description: "Eventos da Igreja Batista Central do Ibura.",
};

export default function EventosPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Eventos" />
      <ComingSoon label="a agenda de eventos" />
    </div>
  );
}

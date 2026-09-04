import type { Metadata } from "next";
import { UserRoundCheck } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Ministério Pastoral | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério Pastoral da Igreja Batista Central do Ibura.",
};

export default function MinisterioPastoralPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministério Pastoral"
        description="Cuidado espiritual e acompanhamento da vida cristã da igreja."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRoundCheck className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Cuidado Pastoral
          </h2>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            O Ministério Pastoral cuida do cuidado espiritual da igreja:
            aconselhamento, visitas, oração e acompanhamento da vida cristã de
            cada membro, sob a liderança do corpo pastoral da IBCI.
          </p>
        </Card>
      </div>
    </div>
  );
}

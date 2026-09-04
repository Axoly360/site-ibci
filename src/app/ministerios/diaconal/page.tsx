import type { Metadata } from "next";
import { HandHeart } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Ministério Diaconal | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério Diaconal da Igreja Batista Central do Ibura.",
};

export default function MinisterioDiaconalPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministério Diaconal"
        description="Serviço prático e cuidado com a igreja."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HandHeart className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Serviço e Cuidado
          </h2>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            O Ministério Diaconal apoia a igreja no serviço prático e no
            cuidado com os membros — desde a organização dos cultos até o
            suporte a famílias em momentos de necessidade.
          </p>
        </Card>
      </div>
    </div>
  );
}

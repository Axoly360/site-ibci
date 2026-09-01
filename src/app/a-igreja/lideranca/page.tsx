import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Liderança | IBCI - Igreja Batista Central do Ibura",
  description: "Conheça a liderança pastoral da Igreja Batista Central do Ibura.",
};

export default function LiderancaPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Liderança"
        description="Conheça quem conduz o rebanho da Igreja Batista Central do Ibura."
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="h-8 w-8" />
          </span>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Liderança Pastoral
            </span>
            <h3 className="font-heading text-xl font-bold text-primary">
              {churchInfo.seniorPastor}
            </h3>
            <p className="mt-1 text-sm text-text-neutral/80">
              Pastor Presidente da Igreja Batista Central do Ibura, conduzindo
              o rebanho com fidelidade à Palavra e cuidado pastoral pela
              comunidade do Ibura.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

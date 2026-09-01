import type { Metadata } from "next";
import { BookOpenCheck, Compass, Gem } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Missão, Valores e Visão | IBCI - Igreja Batista Central do Ibura",
  description:
    "Os pilares que orientam a Igreja Batista Central do Ibura: missão, visão e valores.",
};

const pillars = [
  {
    icon: BookOpenCheck,
    title: "Missão",
    description:
      "Glorificar a Deus, pregar o Evangelho de Jesus Cristo e discipular pessoas no bairro do Ibura e até os confins da terra.",
  },
  {
    icon: Compass,
    title: "Visão",
    description:
      "Ser uma comunidade acolhedora, firmada na Palavra, relevante para o seu bairro e comprometida com a transformação de vidas.",
  },
  {
    icon: Gem,
    title: "Valores",
    description:
      "Centralidade da Bíblia, Oração, Comunhão Fraterna, Ação Social e Excelência no Serviço ao Senhor.",
  },
];

export default function MissaoValoresVisaoPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Missão, Valores e Visão"
        description="Os pilares que orientam tudo o que fazemos como igreja."
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Card
                key={pillar.title}
                className="flex flex-col items-center gap-3 p-6 text-center"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-heading text-lg font-semibold text-primary">
                  {pillar.title}
                </h3>
                <p className="text-sm leading-relaxed text-text-neutral/80">
                  {pillar.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { BookOpenCheck, Compass, Gem, Church, MessageCircle, ArrowRight, UserRound } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import FaithAccordion from "@/components/about/FaithAccordion";

export const metadata: Metadata = {
  title: "A Igreja | IBCI - Igreja Batista Central do Ibura",
  description:
    "Conheça a história, missão, visão e a declaração de fé da Igreja Batista Central do Ibura no Recife/PE.",
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

export default function QuemSomosPage() {
  return (
    <div className="bg-bg-light">
      {/* Page Banner */}
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Nossa História e Fé
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Conheça a trajetória, a missão e os valores da Igreja Batista
            Central do Ibura.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
        {/* Nossa Trajetória no Ibura */}
        <section>
          <Card className="grid items-center gap-8 p-8 md:grid-cols-3 md:p-12">
            <div className="space-y-4 md:col-span-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary">
                <Church className="h-4 w-4" />
                Presente no bairro do Ibura
              </span>
              <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
                Nossa Trajetória no Ibura
              </h2>
              <p className="leading-relaxed text-text-neutral/80">
                A Igreja Batista Central do Ibura (IBCI) nasceu no coração do
                bairro com o propósito claro de ser um farol da graça divina
                na comunidade. Ao longo de sua trajetória, a IBCI tem se
                dedicado à proclamação fiel do Evangelho, ao fortalecimento
                das famílias e ao acolhimento dos moradores da região.
              </p>
              <p className="leading-relaxed text-text-neutral/80">
                Filiada à Convenção Batista Brasileira (CBB) e à Convenção
                Batista Pernambucana (CBPE), nossa igreja preserva os
                princípios históricos batistas: a centralidade da Palavra de
                Deus, a autonomia da igreja local e o compromisso
                inegociável com a obra missionária.
              </p>
            </div>

            <div className="space-y-3 rounded-xl border border-primary/10 bg-primary/5 p-6 text-center">
              <h3 className="font-heading text-xl font-bold text-primary">
                Comunidade &amp; Fé
              </h3>
              <p className="text-sm text-text-neutral/80">
                Um ambiente seguro e acolhedor para você e sua família
                crescerem no conhecimento de Cristo.
              </p>
              <div className="pt-2">
                <span className="block text-xs font-semibold uppercase tracking-wider text-primary">
                  Localização
                </span>
                <span className="text-sm font-medium text-text-neutral">
                  {churchInfo.address.neighborhood}, {churchInfo.address.city}{" "}
                  - {churchInfo.address.state}
                </span>
              </div>
            </div>
          </Card>
        </section>

        {/* Liderança Pastoral */}
        <section>
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
                Pastor Presidente da Igreja Batista Central do Ibura,
                conduzindo o rebanho com fidelidade à Palavra e cuidado
                pastoral pela comunidade do Ibura.
              </p>
            </div>
          </Card>
        </section>

        {/* Missão, Visão e Valores */}
        <section id="ministerios">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              Missão, Visão e Valores
            </h2>
            <p className="mt-3 text-text-neutral/80">
              Os pilares que orientam tudo o que fazemos como igreja.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
        </section>

        {/* Em Que Cremos */}
        <section>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
              Em Que Cremos
            </h2>
            <p className="mt-3 text-text-neutral/80">
              Nossa declaração de fé, alicerçada na tradição batista.
            </p>
          </div>

          <div className="mt-10">
            <FaithAccordion />
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="bg-primary px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Venha nos conhecer pessoalmente
          </h2>
          <p className="max-w-xl text-white/80">
            Nossa porta está aberta para você. Participe do nosso próximo
            culto ou fale conosco pelo WhatsApp — será um prazer recebê-lo.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button href="/#cultos" variant="primary" size="lg">
              Próximo Culto
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button href={churchInfo.social.whatsapp} external variant="outline" size="lg">
              <MessageCircle className="h-5 w-5" />
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

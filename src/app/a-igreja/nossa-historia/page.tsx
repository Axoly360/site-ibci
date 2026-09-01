import type { Metadata } from "next";
import { Church } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Nossa História | IBCI - Igreja Batista Central do Ibura",
  description:
    "Conheça a trajetória da Igreja Batista Central do Ibura no bairro do Ibura, Recife-PE.",
};

export default function NossaHistoriaPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Nossa História"
        description="Conheça a trajetória da Igreja Batista Central do Ibura."
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
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
              bairro com o propósito claro de ser um farol da graça divina na
              comunidade. Ao longo de sua trajetória, a IBCI tem se dedicado à
              proclamação fiel do Evangelho, ao fortalecimento das famílias e
              ao acolhimento dos moradores da região.
            </p>
            <p className="leading-relaxed text-text-neutral/80">
              Filiada à Convenção Batista Brasileira (CBB) e à Convenção
              Batista Pernambucana (CBPE), nossa igreja preserva os
              princípios históricos batistas: a centralidade da Palavra de
              Deus, a autonomia da igreja local e o compromisso inegociável
              com a obra missionária.
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
                {churchInfo.address.neighborhood}, {churchInfo.address.city} -{" "}
                {churchInfo.address.state}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

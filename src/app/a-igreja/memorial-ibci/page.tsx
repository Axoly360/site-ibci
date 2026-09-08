import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Memorial IBCI | IBCI - Igreja Batista Central do Ibura",
  description: "Memorial dos pastores presidentes da Igreja Batista Central do Ibura.",
};

interface PastorMemorial {
  name: string;
  highlight: string;
  tenure: string;
  history: string;
}

const pastores: PastorMemorial[] = [
  {
    name: "Victor Nelson Vaner",
    highlight: "Pastor Fundador",
    tenure: "Em breve",
    history: "Em breve.",
  },
  {
    name: "Glenn Eliatt Hickey",
    highlight: "Pastor Emérito",
    tenure: "Em breve",
    history: "Em breve.",
  },
];

export default function MemorialIbciPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Memorial IBCI"
        description="Galeria dos pastores presidentes que já conduziram a IBCI desde sua fundação."
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {pastores.map((pastor) => (
            <Card key={pastor.name} className="flex flex-col items-center gap-3 p-8 text-center">
              <span className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="h-11 w-11" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                {pastor.highlight}
              </span>
              <h3 className="font-heading text-xl font-bold text-primary">{pastor.name}</h3>
              <p className="text-xs font-semibold text-text-neutral/50">
                Tempo de exercício: {pastor.tenure}
              </p>
              <p className="text-sm leading-relaxed text-text-neutral/80">{pastor.history}</p>
            </Card>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-text-neutral/60">
          Demais pastores presidentes da história da IBCI serão adicionados em breve.
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import Card from "@/components/ui/Card";
import PageBanner from "@/components/layout/PageBanner";

export const metadata: Metadata = {
  title: "Diretoria Estatutária | IBCI - Igreja Batista Central do Ibura",
  description:
    "Conheça a Diretoria Estatutária 2026 da Igreja Batista Central do Ibura.",
};

const diretoria = [
  { role: "Presidente", name: "Pr. Márcio Severino" },
  { role: "Moderadora", name: "Ana Paula Bispo" },
  { role: "Vice-Moderador", name: "Dc. Edson Galindo" },
  { role: "Pastor Auxiliar de Evangelismo", name: "João Diniz" },
  { role: "Pastor Auxiliar da Juventude", name: "Marluz Ferraz" },
];

export default function DiretoriaEstatutariaPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Diretoria Estatutária"
        description="Diretoria Estatutária 2026 da Igreja Batista Central do Ibura."
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {diretoria.map((membro) => (
            <Card key={membro.role} className="flex items-center gap-4 p-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="h-7 w-7" />
              </span>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
                  {membro.role}
                </span>
                <h3 className="font-heading text-lg font-bold text-primary">
                  {membro.name}
                </h3>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

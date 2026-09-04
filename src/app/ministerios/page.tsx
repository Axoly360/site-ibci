import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import HubGrid from "@/components/layout/HubGrid";

export const metadata: Metadata = {
  title: "Ministérios | IBCI - Igreja Batista Central do Ibura",
  description: "Conheça os ministérios da Igreja Batista Central do Ibura.",
};

const items = [
  {
    title: "Pastoral",
    href: "/ministerios/pastoral",
    description: "Cuidado espiritual e acompanhamento da vida cristã da igreja.",
  },
  {
    title: "Diaconal",
    href: "/ministerios/diaconal",
    description: "Serviço prático e cuidado com a igreja.",
  },
  {
    title: "Louvor",
    href: "/ministerios/louvor",
    description: "Adoração e música a serviço da igreja.",
  },
  {
    title: "Infantil",
    href: "/ministerios/infantil",
    description: "Educação cristã e cuidado com as crianças da igreja.",
  },
  {
    title: "Jovens",
    href: "/ministerios/jovens",
    description: "Comunhão e crescimento espiritual da juventude da IBCI.",
  },
  {
    title: "Mulheres",
    href: "/ministerios/mulheres",
    description: "Comunhão, estudo e apoio mútuo entre as mulheres da igreja.",
  },
  {
    title: "Homens",
    href: "/ministerios/homens",
    description: "Liderança espiritual, discipulado e comunhão entre os homens.",
  },
  {
    title: "Educação Cristã",
    href: "/ministerios/educacao-crista",
    description: "Escola Bíblica Dominical e formação cristã.",
  },
  {
    title: "Ação Social",
    href: "/ministerios/acao-social",
    description: "Cestas básicas, apoio a famílias e arrecadações.",
  },
  {
    title: "Família",
    href: "/ministerios/familia",
    description: "Fortalecendo os lares à luz dos princípios bíblicos.",
  },
];

const diretoria = ["Presidente", "Vice-Presidente", "Secretário(a)", "Tesoureiro(a)"];

export default function MinisteriosPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministérios"
        description="Conheça as frentes de serviço e comunhão da nossa igreja."
      />
      <HubGrid items={items} />

      <div className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            Diretoria
          </h2>
          <p className="mt-3 text-text-neutral/80">
            Responsáveis pela administração da igreja.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {diretoria.map((cargo) => (
            <div
              key={cargo}
              className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary/20 bg-white p-6 text-center"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserRound className="h-9 w-9" />
              </span>
              <p className="font-heading text-sm font-semibold text-primary">{cargo}</p>
              <p className="text-xs text-text-neutral/50">Foto em breve</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

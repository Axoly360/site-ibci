import type { Metadata } from "next";
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

export default function MinisteriosPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministérios"
        description="Conheça as frentes de serviço e comunhão da nossa igreja."
      />
      <HubGrid items={items} />
    </div>
  );
}

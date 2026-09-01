import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import HubGrid from "@/components/layout/HubGrid";

export const metadata: Metadata = {
  title: "Ministérios | IBCI - Igreja Batista Central do Ibura",
  description: "Conheça os ministérios da Igreja Batista Central do Ibura.",
};

const items = [
  { title: "Pastoral", href: "/ministerios/pastoral", description: "Em breve." },
  { title: "Diaconal", href: "/ministerios/diaconal", description: "Em breve." },
  { title: "Louvor", href: "/ministerios/louvor", description: "Em breve." },
  { title: "Infantil", href: "/ministerios/infantil", description: "Em breve." },
  { title: "Jovens", href: "/ministerios/jovens", description: "Em breve." },
  { title: "Mulheres", href: "/ministerios/mulheres", description: "Em breve." },
  { title: "Homens", href: "/ministerios/homens", description: "Em breve." },
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
  { title: "Família", href: "/ministerios/familia", description: "Em breve." },
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

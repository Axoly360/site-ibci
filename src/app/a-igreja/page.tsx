import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import HubGrid from "@/components/layout/HubGrid";

export const metadata: Metadata = {
  title: "A Igreja | IBCI - Igreja Batista Central do Ibura",
  description:
    "Conheça a história, a liderança, a fé e a congregação da Igreja Batista Central do Ibura.",
};

const items = [
  {
    title: "Nossa História",
    href: "/a-igreja/nossa-historia",
    description: "Nossa trajetória no bairro do Ibura.",
  },
  {
    title: "Em que Cremos",
    href: "/a-igreja/em-que-cremos",
    description: "Nossa declaração de fé, alicerçada na tradição batista.",
  },
  {
    title: "Liderança",
    href: "/a-igreja/lideranca",
    description: "Conheça quem conduz o rebanho da IBCI.",
  },
  {
    title: "Missão, Valores e Visão",
    href: "/a-igreja/missao-valores-e-visao",
    description: "Os pilares que orientam tudo o que fazemos como igreja.",
  },
  {
    title: "Nossa Congregação",
    href: "/a-igreja/nossa-congregacao",
    description: "Em breve.",
  },
  {
    title: "Memorial IBCI",
    href: "/a-igreja/memorial-ibci",
    description: "Em breve.",
  },
];

export default function AIgrejaPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="A Igreja"
        description="Conheça a trajetória, a missão e os valores da Igreja Batista Central do Ibura."
      />
      <HubGrid items={items} />
    </div>
  );
}

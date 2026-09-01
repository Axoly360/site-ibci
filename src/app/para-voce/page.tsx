import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import HubGrid from "@/components/layout/HubGrid";

export const metadata: Metadata = {
  title: "Para você | IBCI - Igreja Batista Central do Ibura",
  description:
    "Serviços e conteúdos práticos da Igreja Batista Central do Ibura para você.",
};

const items = [
  {
    title: "Dízimos e Ofertas",
    href: "/para-voce/dizimos-e-ofertas",
    description: "Contribua com a obra de Deus via PIX.",
  },
  { title: "Servir", href: "/para-voce/servir", description: "Faça parte de um dos nossos ministérios." },
  { title: "Eventos", href: "/para-voce/eventos", description: "Em breve." },
  {
    title: "Pedidos de Oração",
    href: "/para-voce/pedidos-de-oracao",
    description: "Compartilhe seu pedido com a nossa equipe.",
  },
  {
    title: "Mensagens",
    href: "/para-voce/mensagens",
    description: "Assista à transmissão mais recente da nossa igreja.",
  },
  { title: "Cursos", href: "/para-voce/cursos", description: "Em breve." },
  { title: "IBCI News", href: "/para-voce/ibci-news", description: "Em breve." },
  { title: "Projeto PEPE", href: "/para-voce/projeto-pepe", description: "Em breve." },
  {
    title: "Programações",
    href: "/para-voce/programacoes",
    description: "Participe dos nossos encontros semanais.",
  },
  { title: "Fale Conosco", href: "/contato#formulario", description: "Envie uma mensagem para a igreja." },
  { title: "Privacidade", href: "/para-voce/privacidade", description: "Como tratamos suas informações." },
];

export default function ParaVocePage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Para você"
        description="Serviços e conteúdos práticos para facilitar sua participação na IBCI."
      />
      <HubGrid items={items} />
    </div>
  );
}

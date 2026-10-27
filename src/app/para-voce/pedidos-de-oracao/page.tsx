import type { Metadata } from "next";
import Ibi from "@/components/brand/Ibi";
import { churchInfo } from "@/data/churchInfo";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Pedidos de Oração | IBCI - Igreja Batista Central do Ibura",
  description:
    "Compartilhe seu pedido de oração com a equipe de intercessão da Igreja Batista Central do Ibura.",
};

export default function PedidosDeOracaoPage() {
  const waLink = `https://wa.me/${churchInfo.social.whatsappNumber}?text=${encodeURIComponent(
    "Olá! Gostaria de compartilhar um pedido de oração."
  )}`;

  return (
    <div className="bg-bg-light">
      <PageBanner title="Pedidos de Oração" />

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-center gap-4 p-10 text-center">
          <Ibi pose="orar" size={130} animado />
          <h2 className="font-heading text-xl font-bold text-primary">
            Pedido de Oração
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-text-neutral/80">
            Está passando por um momento difícil? Compartilhe seu pedido de
            oração diretamente com a nossa equipe de intercessão.
          </p>
          <Button href={waLink} external variant="secondary">
            Enviar pedido no WhatsApp
          </Button>
        </Card>
      </div>
    </div>
  );
}

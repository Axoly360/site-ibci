import type { Metadata } from "next";
import { churchInfo } from "@/data/churchInfo";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Privacidade | IBCI - Igreja Batista Central do Ibura",
  description: "Como a Igreja Batista Central do Ibura trata suas informações.",
};

export default function PrivacidadePage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Privacidade" />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="space-y-4 p-8">
          <p className="text-sm leading-relaxed text-text-neutral/80">
            Hoje o site da IBCI não armazena dados pessoais em servidor
            próprio: os formulários de contato e pedido de oração abrem uma
            conversa direta no WhatsApp, e você decide se envia a mensagem.
            Não coletamos nem guardamos essas informações fora do seu próprio
            WhatsApp.
          </p>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            Dúvidas sobre privacidade podem ser enviadas para{" "}
            <a
              href={`mailto:${churchInfo.contact.email}`}
              className="font-semibold text-secondary"
            >
              {churchInfo.contact.email}
            </a>
            .
          </p>
        </Card>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import PageBanner from "@/components/layout/PageBanner";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Servir | IBCI - Igreja Batista Central do Ibura",
  description: "Faça parte de um dos ministérios da Igreja Batista Central do Ibura.",
};

export default function ServirPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Servir" />

      <section className="bg-primary px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Quer servir com a gente?
          </h2>
          <p className="max-w-xl text-white/80">
            Se você deseja fazer parte de um dos nossos ministérios e servir
            ao Senhor com seus dons, fale com a nossa equipe de atendimento e
            venha ser voluntário.
          </p>
          <Button href={churchInfo.social.whatsapp} external variant="primary" size="lg">
            <MessageCircle className="h-5 w-5" />
            Quero Ser Voluntário
          </Button>
        </div>
      </section>
    </div>
  );
}

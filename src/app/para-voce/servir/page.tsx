import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { MINISTRIES, MINISTRY_LINKS } from "@/lib/ministries";

export const metadata: Metadata = {
  title: "Servir | IBCI - Igreja Batista Central do Ibura",
  description: "Conheça os ministérios e projetos onde você pode servir na Igreja Batista Central do Ibura.",
};

export default function ServirPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Servir"
        description="Conheça os ministérios e projetos onde você pode ser voluntário na IBCI."
      />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MINISTRIES.map((ministry) => {
            const link = MINISTRY_LINKS[ministry];
            return (
              <Card key={ministry} className="flex flex-col gap-3 p-6">
                <h2 className="font-heading text-lg font-semibold text-primary">
                  {ministry}
                </h2>
                {link ? (
                  <Link
                    href={link}
                    className="mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
                  >
                    Saiba mais
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <p className="mt-auto text-sm text-text-neutral/60">
                    Fale com a gente para saber mais.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <section className="bg-primary px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Quer servir com a gente?
          </h2>
          <p className="max-w-xl text-white/80">
            Se você já é membro, cadastre-se como voluntário na Central do
            Membro. Se ainda não tem conta ou quer tirar dúvidas antes, fale
            com a nossa equipe de atendimento.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/central-do-membro/servir" variant="primary" size="lg">
              Cadastrar Voluntariado
            </Button>
            <Button href={churchInfo.social.whatsapp} external variant="outline" size="lg">
              <MessageCircle className="h-5 w-5" />
              Falar no WhatsApp
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

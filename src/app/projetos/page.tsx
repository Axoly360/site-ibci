import type { Metadata } from "next";
import { HandHeart, BookOpen, Globe, Users, MessageCircle } from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Nossos Projetos | IBCI - Igreja Batista Central do Ibura",
  description:
    "Conheça as frentes de ação social, evangelismo e formação da Igreja Batista Central do Ibura no bairro do Ibura, Recife-PE.",
};

const projects = [
  {
    icon: HandHeart,
    title: "Ação Social & Solidariedade",
    description:
      "Distribuição de cestas básicas, apoio a famílias em vulnerabilidade e arrecadação de agasalhos e alimentos para a comunidade do Ibura.",
  },
  {
    icon: BookOpen,
    title: "Escola Bíblica Dominical (EBD)",
    description:
      "Formação cristã para todas as idades — crianças, jovens e adultos — todos os domingos às 09h, com estudo bíblico em classes.",
  },
  {
    icon: Globe,
    title: "Evangelismo & Missões",
    description:
      "Impactos evangelísticos nos bairros vizinhos e apoio a obras missionárias, levando o Evangelho além dos muros da igreja.",
  },
  {
    icon: Users,
    title: "Ministério Infantil & Juventude",
    description:
      "Atividades contínuas de ensino, comunhão e integração para crianças e jovens, formando a próxima geração na fé.",
  },
];

export default function ProjetosPage() {
  return (
    <div className="bg-bg-light">
      {/* Page Banner */}
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Nossos Projetos
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Fé em ação: conheça e apoie as iniciativas sociais e
            evangelísticas da IBCI no Ibura.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {projects.map((project) => {
            const Icon = project.icon;
            return (
              <Card
                key={project.title}
                className="flex flex-col items-start gap-4 p-8"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="font-heading text-xl font-semibold text-primary">
                  {project.title}
                </h2>
                <p className="text-sm leading-relaxed text-text-neutral/80">
                  {project.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Voluntariado */}
      <section className="bg-primary px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <h2 className="font-heading text-2xl font-bold sm:text-3xl">
            Quer servir com a gente?
          </h2>
          <p className="max-w-xl text-white/80">
            Se você deseja fazer parte de um desses ministérios e servir ao
            Senhor com seus dons, fale com a nossa equipe de atendimento e
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

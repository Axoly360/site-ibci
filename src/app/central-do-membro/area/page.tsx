import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Heart,
  CalendarClock,
  Gift,
  UserRoundCheck,
  FileText,
  ArrowRight,
  CalendarDays,
} from "lucide-react";
import { churchInfo } from "@/data/churchInfo";
import Card from "@/components/ui/Card";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Área do Membro | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

function waLink(message: string) {
  return `https://wa.me/${churchInfo.social.whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;
}

const baseShortcuts = [
  {
    icon: Heart,
    title: "Pedido de Oração",
    description:
      "Compartilhe seu pedido de oração diretamente com a nossa equipe de intercessão.",
    cta: "Enviar pedido no WhatsApp",
    href: waLink("Olá! Gostaria de compartilhar um pedido de oração."),
    external: true,
  },
  {
    icon: CalendarClock,
    title: "Escala de Cultos & Avisos",
    description:
      "Veja a programação da semana — cultos, EBD e encontros — e fique por dentro dos avisos da liderança.",
    cta: "Ver programação",
    href: "/#cultos",
    external: false,
  },
  {
    icon: Gift,
    title: "Dízimos e Ofertas",
    description:
      "Acesse a chave PIX da igreja e contribua de forma rápida e segura com a obra de Deus.",
    cta: "Ir para Contribuições",
    href: "/para-voce/dizimos-e-ofertas",
    external: false,
  },
  {
    icon: UserRoundCheck,
    title: "Solicitação de Visita Pastoral",
    description: `Agende uma visita do ${churchInfo.seniorPastor} ou de um membro da equipe pastoral para você e sua família.`,
    cta: "Solicitar visita",
    href: waLink(
      `Olá! Gostaria de solicitar uma visita pastoral do ${churchInfo.seniorPastor} ou da equipe.`
    ),
    external: true,
  },
  {
    icon: FileText,
    title: "Estudos & Materiais",
    description:
      "Roteiros de estudo da semana e boletim informativo da igreja. Em breve disponíveis para consulta e download.",
    cta: "Em breve",
    href: null,
    external: false,
  },
];

export default async function AreaDoMembroPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member, is_leadership, church_role
    from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");

  const shortcuts = member.is_leadership
    ? [
        {
          icon: CalendarDays,
          title: "Escala de Serviços",
          description: `Escala mensal de cultos — acesso restrito a lideranças (${member.church_role || "liderança"}).`,
          cta: "Ver escala do mês",
          href: "/central-do-membro/escala",
          external: false,
        },
        ...baseShortcuts,
      ]
    : baseShortcuts;

  return (
    <div className="bg-bg-light">
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Área do Membro
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Olá, {session.name}! Atalhos e serviços práticos para facilitar sua
            participação e comunhão na IBCI.
          </p>
          <form action="/api/auth/sair" method="POST" className="mt-6">
            <input type="hidden" name="next" value="/central-do-membro" />
            <button
              type="submit"
              className="rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-secondary-light"
            >
              Sair
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            const content = (
              <Card className="flex h-full flex-col items-start gap-4 p-6">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h2 className="font-heading text-lg font-semibold text-primary">
                  {shortcut.title}
                </h2>
                <p className="flex-1 text-sm leading-relaxed text-text-neutral/80">
                  {shortcut.description}
                </p>
                <span
                  className={`inline-flex items-center gap-1 text-sm font-semibold ${
                    shortcut.href ? "text-secondary" : "text-text-neutral/50"
                  }`}
                >
                  {shortcut.cta}
                  {shortcut.href && <ArrowRight className="h-4 w-4" />}
                </span>
              </Card>
            );

            if (!shortcut.href) {
              return (
                <div key={shortcut.title} className="h-full cursor-not-allowed opacity-80">
                  {content}
                </div>
              );
            }

            return (
              <a
                key={shortcut.title}
                href={shortcut.href}
                target={shortcut.external ? "_blank" : undefined}
                rel={shortcut.external ? "noopener noreferrer" : undefined}
                className="block h-full"
              >
                {content}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

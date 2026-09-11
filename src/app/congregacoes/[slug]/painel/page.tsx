import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Send, Building2, ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { getCongregationSession } from "@/lib/congregation-session";

export const metadata: Metadata = {
  title: "Painel da Congregação | IBCI",
  robots: { index: false, follow: false },
};

export default async function CongregacaoPainelPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getCongregationSession();
  if (!session || session.congregationSlug !== slug) {
    redirect(`/congregacoes/${slug}/entrar`);
  }

  const shortcuts = [
    {
      icon: Send,
      title: "Solicitações",
      description: "Peça verba, material, autorização de evento ou visita pastoral à central.",
      cta: "Ver solicitações",
      href: `/congregacoes/${slug}/solicitacoes`,
    },
    {
      icon: Building2,
      title: "Prestação de Contas",
      description: "Registre as entradas e saídas da congregação, com comprovante.",
      cta: "Ver financeiro",
      href: `/congregacoes/${slug}/financeiro`,
    },
  ];

  return (
    <div className="bg-bg-light">
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            {session.congregationName}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Olá, {session.name}! Área do responsável pela congregação.
          </p>
          <form action={`/api/congregacoes/${slug}/sair`} method="POST" className="mt-6">
            <input type="hidden" name="next" value={`/congregacoes/${slug}/entrar`} />
            <button
              type="submit"
              className="rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-secondary-light"
            >
              Sair
            </button>
          </form>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {shortcuts.map((shortcut) => {
            const Icon = shortcut.icon;
            return (
              <Link key={shortcut.title} href={shortcut.href} className="block h-full">
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
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-secondary">
                    {shortcut.cta}
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

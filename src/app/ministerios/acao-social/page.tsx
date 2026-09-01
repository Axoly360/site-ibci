import type { Metadata } from "next";
import Link from "next/link";
import { HandHeart, ArrowRight } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Ação Social | IBCI - Igreja Batista Central do Ibura",
  description:
    "Ação social e solidariedade da Igreja Batista Central do Ibura no bairro do Ibura.",
};

export default function AcaoSocialPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Ação Social" />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HandHeart className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Ação Social &amp; Solidariedade
          </h2>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            Distribuição de cestas básicas, apoio a famílias em
            vulnerabilidade e arrecadação de agasalhos e alimentos para a
            comunidade do Ibura.
          </p>
          <Link
            href="/projetos"
            className="inline-flex items-center gap-1 text-sm font-semibold text-secondary"
          >
            Ver todos os projetos da IBCI
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </div>
  );
}

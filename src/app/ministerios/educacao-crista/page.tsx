import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Educação Cristã | IBCI - Igreja Batista Central do Ibura",
  description:
    "Escola Bíblica Dominical e formação cristã da Igreja Batista Central do Ibura.",
};

export default function EducacaoCristaPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner title="Educação Cristã" />

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Escola Bíblica Dominical (EBD)
          </h2>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            Formação cristã para todas as idades — crianças, jovens e
            adultos — todos os domingos às 10h, com estudo bíblico em
            classes.
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

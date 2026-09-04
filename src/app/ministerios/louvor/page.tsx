import type { Metadata } from "next";
import { PlayCircle } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Ministério de Louvor | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério de Louvor da Igreja Batista Central do Ibura.",
};

export default function MinisterioLouvorPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministério de Louvor"
        description="Adoração e música a serviço da igreja."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PlayCircle className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Adoração em Música
          </h2>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            O Ministério de Louvor conduz a igreja em adoração através da
            música, preparando corações para a Palavra em cada culto e
            momento de comunhão.
          </p>
        </Card>
      </div>
    </div>
  );
}

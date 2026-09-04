import type { Metadata } from "next";
import { Heart } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Ministério de Família | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério de Família da Igreja Batista Central do Ibura.",
};

export default function MinisterioFamiliaPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministério de Família"
        description="Fortalecendo os lares à luz dos princípios bíblicos."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Heart className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Lares Firmados na Palavra
          </h2>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            O Ministério de Família apoia casais e famílias da igreja com
            orientação, comunhão e atividades que fortalecem os laços
            familiares à luz dos princípios bíblicos.
          </p>
        </Card>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { Gift } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Ministério Infantil | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério Infantil da Igreja Batista Central do Ibura.",
};

export default function MinisterioInfantilPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministério Infantil"
        description="Educação cristã e cuidado com as crianças da igreja."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Gift className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Crescendo na Fé desde Cedo
          </h2>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            O Ministério Infantil cuida da educação cristã das crianças da
            igreja, com atividades bíblicas, lúdicas e acolhedoras durante os
            cultos e encontros da IBCI.
          </p>
        </Card>
      </div>
    </div>
  );
}

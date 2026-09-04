import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Ministério de Homens | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério de Homens da Igreja Batista Central do Ibura.",
};

export default function MinisterioHomensPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministério de Homens"
        description="Liderança espiritual, discipulado e comunhão entre os homens da igreja."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Homens de Propósito
          </h2>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            O Ministério de Homens fortalece a comunhão entre os homens da
            igreja, incentivando liderança espiritual, discipulado e
            responsabilidade na família e na comunidade de fé.
          </p>
        </Card>
      </div>
    </div>
  );
}

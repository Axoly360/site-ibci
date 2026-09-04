import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Ministério de Jovens | IBCI - Igreja Batista Central do Ibura",
  description: "Ministério de Jovens da Igreja Batista Central do Ibura.",
};

export default function MinisterioJovensPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ministério de Jovens"
        description="Comunhão e crescimento espiritual da juventude da IBCI."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="flex flex-col items-start gap-4 p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-6 w-6" />
          </span>
          <h2 className="font-heading text-xl font-semibold text-primary">
            Fé desde Jovem
          </h2>
          <p className="text-sm leading-relaxed text-text-neutral/80">
            O Ministério de Jovens reúne os adolescentes e jovens da IBCI em
            momentos de comunhão, estudo bíblico e crescimento espiritual,
            fortalecendo a fé desde cedo.
          </p>
        </Card>
      </div>
    </div>
  );
}

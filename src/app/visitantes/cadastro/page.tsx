import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import VisitanteCadastroForm from "@/components/visitantes/VisitanteCadastroForm";

export const metadata: Metadata = {
  title: "Cadastro de Visitante | IBCI - Igreja Batista Central do Ibura",
  description: "Ficha de cadastro para visitantes da Igreja Batista Central do Ibura.",
};

export default async function VisitanteCadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ evento?: string }>;
}) {
  const { evento } = await searchParams;

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Seja bem-vindo(a)!"
        description="Conte pra gente um pouco sobre você — é rapidinho."
      />
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <VisitanteCadastroForm eventSlug={evento ?? ""} />
      </div>
    </div>
  );
}

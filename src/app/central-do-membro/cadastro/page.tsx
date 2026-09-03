import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import MembershipRequestForm from "@/components/membros/MembershipRequestForm";

export const metadata: Metadata = {
  title: "Cadastro de Membro | IBCI - Igreja Batista Central do Ibura",
  description:
    "Solicite seu cadastro de membro da Igreja Batista Central do Ibura.",
};

export default function CadastroMembroPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Cadastro de Membro"
        description="Preencha seus dados abaixo. Seu cadastro passa pela validação da diretoria antes de virar membro."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <MembershipRequestForm />
      </div>
    </div>
  );
}

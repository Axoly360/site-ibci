import type { Metadata } from "next";
import Link from "next/link";
import PageBanner from "@/components/layout/PageBanner";
import EsqueciSenhaForm from "@/components/auth/EsqueciSenhaForm";

export const metadata: Metadata = {
  title: "Esqueci minha senha | IBCI",
  robots: { index: false, follow: false },
};

export default async function EsqueciSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const scope = tipo === "admin" ? "admin" : "membro";
  const voltarHref = scope === "admin" ? "/admin/entrar" : "/central-do-membro";

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Esqueci minha senha"
        description="Informe seu e-mail e enviaremos um link para você criar uma nova senha."
      />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        <EsqueciSenhaForm scope={scope} />
        <Link
          href={voltarHref}
          className="mt-6 block text-center text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para o login
        </Link>
      </div>
    </div>
  );
}

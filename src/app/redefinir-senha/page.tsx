import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import RedefinirSenhaForm from "@/components/auth/RedefinirSenhaForm";

export const metadata: Metadata = {
  title: "Redefinir senha | IBCI",
  robots: { index: false, follow: false },
};

export default async function RedefinirSenhaPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="bg-bg-light">
      <PageBanner title="Redefinir senha" description="Escolha uma nova senha para sua conta." />
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
        {token ? (
          <RedefinirSenhaForm token={token} />
        ) : (
          <p className="text-center text-sm text-red-600">
            Link inválido — falta o código de redefinição. Solicite um novo link.
          </p>
        )}
      </div>
    </div>
  );
}

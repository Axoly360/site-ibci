import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import LoginForm from "@/components/eventos/LoginForm";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Central do Membro | IBCI - Igreja Batista Central do Ibura",
  description: "Entre com seu e-mail ou cadastre-se para acessar a Central do Membro.",
};

export default async function CentralDoMembroPage() {
  const session = await getSession();

  if (session) {
    const [member] = await sql`
      select is_validated_member from members where id = ${session.memberId}
    `;
    if (member?.is_validated_member) {
      redirect("/central-do-membro/area");
    }
  }

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Central do Membro"
        description="Entre com seu e-mail — sem senha — para acessar a área do membro."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {session ? (
          <p className="mx-auto max-w-md text-center text-text-neutral/80">
            Seu cadastro de membro ainda está em análise pela diretoria. Assim
            que for validado, esta página passa a mostrar sua área de membro
            automaticamente.
          </p>
        ) : (
          <>
            <LoginForm session={null} next="/central-do-membro/area" />
            <p className="mt-8 text-center text-sm text-text-neutral/70">
              Ainda não é membro?{" "}
              <Link
                href="/central-do-membro/cadastro"
                className="inline-flex items-center gap-1 font-semibold text-secondary hover:underline"
              >
                Faça seu cadastro
                <ArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

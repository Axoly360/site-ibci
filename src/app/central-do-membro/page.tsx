import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Lock, Building2 } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import MemberLoginForm from "@/components/membros/MemberLoginForm";
import Card from "@/components/ui/Card";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

function AdminAccessCard() {
  return (
    <Link href="/admin/entrar" className="mt-10 block">
      <Card className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold text-primary">
            É administrador?
          </h2>
          <p className="text-sm text-text-neutral/70">
            Acesse o painel administrativo com seu e-mail e senha.
          </p>
        </div>
        <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-secondary" />
      </Card>
    </Link>
  );
}

function CongregationAccessCard() {
  return (
    <Link href="/congregacoes/vila-dos-milagres/entrar" className="mt-4 block">
      <Card className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-heading text-base font-semibold text-primary">
            É responsável de uma congregação?
          </h2>
          <p className="text-sm text-text-neutral/70">
            Acesse a área da Vila dos Milagres com seu e-mail e senha.
          </p>
        </div>
        <ArrowRight className="ml-auto h-5 w-5 shrink-0 text-secondary" />
      </Card>
    </Link>
  );
}

export const metadata: Metadata = {
  title: "Central do Membro | IBCI - Igreja Batista Central do Ibura",
  description: "Entre com e-mail e senha ou cadastre-se para acessar a Central do Membro.",
};

function SairButton() {
  return (
    <form action="/api/auth/sair" method="POST" className="mt-6 text-center">
      <input type="hidden" name="next" value="/central-do-membro" />
      <button
        type="submit"
        className="rounded-full bg-secondary px-6 py-2.5 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-secondary-light"
      >
        Sair
      </button>
    </form>
  );
}

export default async function CentralDoMembroPage() {
  const session = await getSession();

  if (session) {
    const [member] = await sql`
      select is_validated_member from members where id = ${session.memberId}
    `;
    if (member?.is_validated_member) {
      redirect("/central-do-membro/area");
    }

    const [latestRequest] = await sql`
      select status from membership_requests
      where member_id = ${session.memberId}
      order by requested_at desc
      limit 1
    `;

    return (
      <div className="bg-bg-light">
        <PageBanner
          title="Central do Membro"
          description={`Você está logado como ${session.email}.`}
        />
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          {latestRequest?.status === "pendente" && (
            <p className="mx-auto max-w-md text-center text-text-neutral/80">
              Seu cadastro de membro ainda está em análise pela diretoria.
              Assim que for validado, esta página passa a mostrar sua área de
              membro automaticamente.
            </p>
          )}
          {latestRequest?.status === "recusado" && (
            <div className="mx-auto max-w-md text-center text-text-neutral/80">
              <p>Seu cadastro de membro não foi aprovado desta vez.</p>
              <Link
                href="/central-do-membro/cadastro"
                className="mt-3 inline-flex items-center gap-1 font-semibold text-secondary hover:underline"
              >
                Enviar um novo cadastro
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          {!latestRequest && (
            <div className="mx-auto max-w-md text-center text-text-neutral/80">
              <p>Você ainda não solicitou seu cadastro de membro.</p>
              <Link
                href="/central-do-membro/cadastro"
                className="mt-3 inline-flex items-center gap-1 font-semibold text-secondary hover:underline"
              >
                Fazer cadastro
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
          <SairButton />
          <AdminAccessCard />
          <CongregationAccessCard />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Central do Membro"
        description="Entre com e-mail e senha para acessar a área do membro."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <MemberLoginForm />
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
        <AdminAccessCard />
        <CongregationAccessCard />
      </div>
    </div>
  );
}

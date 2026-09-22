import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Lock, Building2, XCircle } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import MemberLoginForm from "@/components/membros/MemberLoginForm";
import MemberProfileSummary from "@/components/membros/MemberProfileSummary";
import MemberGroupsCard from "@/components/membros/MemberGroupsCard";
import DashboardCategoryTiles from "@/components/membros/DashboardCategoryTiles";
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
      select member_number, is_validated_member, is_leadership, church_role, name, email, phone,
             photo_url, marital_status, birthplace, profession, birthdate,
             baptism_date, time_at_church
      from members where id = ${session.memberId}
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

    const groups = await sql`
      select mg.id, mg.name, mg.leader_name, mg.meeting_day, mg.location
      from member_group_members mgm
      join member_groups mg on mg.id = mgm.group_id
      where mgm.member_id = ${session.memberId}
      order by mg.name asc
    `;

    return (
      <div className="bg-bg-light">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-secondary/90 p-5 text-primary shadow-sm">
            <XCircle className="mt-0.5 h-6 w-6 shrink-0" />
            <p className="text-sm leading-relaxed">
              {latestRequest?.status === "pendente" ? (
                <>
                  <strong>{session.name}</strong>, seu cadastro de membro está em análise
                  pela diretoria. Assim que for validado, você terá acesso completo à área
                  de membro.
                </>
              ) : latestRequest?.status === "recusado" ? (
                <>
                  <strong>{session.name}</strong>, seu cadastro de membro não foi aprovado
                  desta vez. Você pode enviar novos dados.{" "}
                  <Link href="/central-do-membro/seja-membro" className="font-bold underline">
                    Clique aqui
                  </Link>
                  .
                </>
              ) : latestRequest?.status === "aprovado" ? (
                <>
                  <strong>{session.name}</strong>, seu acesso de membro foi revogado pela
                  diretoria. Fale com a secretaria da IBCI se achar que isso foi um engano.
                </>
              ) : (
                <>
                  <strong>{session.name}</strong>, você ainda não é um membro da IBCI.
                  Preencha seus dados por completo para que a diretoria entre em contato
                  com você. Caso queira saber como se tornar um membro da IBCI,{" "}
                  <Link href="/central-do-membro/seja-membro" className="font-bold underline">
                    clique aqui
                  </Link>
                  .
                </>
              )}
            </p>
          </div>

          <MemberProfileSummary member={{ id: session.memberId, ...member }} />
          <MemberGroupsCard groups={groups} />
          <DashboardCategoryTiles isLeadership={member.is_leadership} />

          <SairButton />
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

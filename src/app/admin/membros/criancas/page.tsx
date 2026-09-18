import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Baby } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import Card from "@/components/ui/Card";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Ministério Infantil | Painel IBCI",
  robots: { index: false, follow: false },
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

function calcAge(birthdate: string | null): number | null {
  if (!birthdate) return null;
  const parsed = new Date(birthdate);
  if (Number.isNaN(parsed.getTime())) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - parsed.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - parsed.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < parsed.getUTCDate())) {
    age -= 1;
  }
  return age;
}

export default async function AdminCriancasPage({
  searchParams,
}: {
  searchParams: Promise<{ nome?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "membros")) redirect("/admin");

  const params = await searchParams;
  const nome = params.nome?.trim() || null;

  const IDADE_MAXIMA = 12;

  // Toda criança cadastrada pelos membros no "Grupo Familiar"
  // (relationship = 'Filho(a)'), com o responsável e contato, para o
  // Ministério Infantil saber quantas crianças a igreja tem e como
  // contatar a família. O cálculo de idade é em JS (calcAge), então o
  // corte por idade também é feito depois da consulta, não no SQL.
  const filhosCadastrados = await sql`
    select member_children.id, member_children.name, member_children.birthdate,
           member_children.sex, members.id as member_id, members.name as member_name,
           members.phone as member_phone
    from member_children
    join members on members.id = member_children.member_id
    where member_children.relationship = 'Filho(a)'
      and (${nome}::text is null or member_children.name ilike '%' || ${nome} || '%' or members.name ilike '%' || ${nome} || '%')
    order by member_children.birthdate asc nulls last, member_children.name asc
  `;

  // Sem data de nascimento a idade é desconhecida — mantém na lista (não dá
  // pra afirmar que passou da idade do Ministério Infantil) em vez de
  // esconder a criança por falta de dado.
  const criancas = filhosCadastrados.filter((c) => {
    const age = calcAge(c.birthdate);
    return age === null || age <= IDADE_MAXIMA;
  });

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Ministério Infantil"
        description="Crianças de até 12 anos cadastradas pelos membros no Grupo Familiar, com o responsável e o contato para a igreja organizar as atividades infantis."
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/admin/membros"
          className="mb-6 inline-block text-sm font-semibold text-secondary hover:underline"
        >
          ← Voltar para Membros
        </Link>

        <Card className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-heading text-lg font-semibold text-primary">
              <Baby className="h-5 w-5" />
              Crianças até {IDADE_MAXIMA} anos ({criancas.length})
            </h2>
            <form className="flex items-end gap-2" method="get">
              <input
                type="text"
                name="nome"
                defaultValue={nome ?? ""}
                placeholder="Buscar por nome (criança ou responsável)"
                className="rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-secondary px-4 py-2 text-sm font-bold text-primary hover:bg-secondary-light"
              >
                Buscar
              </button>
              {nome && (
                <Link
                  href="/admin/membros/criancas"
                  className="text-sm font-semibold text-text-neutral/60 hover:underline"
                >
                  Limpar
                </Link>
              )}
            </form>
          </div>

          {criancas.length === 0 ? (
            <p className="text-sm text-text-neutral/60">
              {nome
                ? "Nenhuma criança encontrada para essa busca."
                : "Nenhuma criança cadastrada ainda."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
                    <th className="py-2 pr-4">Criança</th>
                    <th className="py-2 pr-4">Idade</th>
                    <th className="py-2 pr-4">Nascimento</th>
                    <th className="py-2 pr-4">Sexo</th>
                    <th className="py-2 pr-4">Responsável</th>
                    <th className="py-2 pr-4">Contato</th>
                  </tr>
                </thead>
                <tbody>
                  {criancas.map((c) => {
                    const age = calcAge(c.birthdate);
                    return (
                      <tr key={c.id} className="border-b border-black/5">
                        <td className="py-3 pr-4 font-semibold text-text-neutral">{c.name}</td>
                        <td className="py-3 pr-4 text-text-neutral/80">
                          {age !== null ? `${age} anos` : "—"}
                        </td>
                        <td className="py-3 pr-4 text-text-neutral/70">
                          {formatDate(c.birthdate)}
                        </td>
                        <td className="py-3 pr-4 text-text-neutral/70">{c.sex || "—"}</td>
                        <td className="py-3 pr-4 text-text-neutral/80">
                          <Link
                            href={`/admin/membros/${c.member_id}`}
                            className="font-semibold text-secondary hover:underline"
                          >
                            {c.member_name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-text-neutral/70">
                          {c.member_phone || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Centro de Formação | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function MatriculasPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Centro de Formação"
        description="Suas matrículas em cursos e turmas da IBCI."
      />
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Aluno/Responsável</th>
                <th className="px-4 py-3 font-semibold">Turma/Produto</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Data de Início</th>
                <th className="px-4 py-3 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-text-neutral/60">
                  Nenhuma matrícula encontrada
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
        <p className="mt-4 text-center text-sm text-text-neutral/60">
          Em breve: inscrição em cursos e turmas de formação da IBCI.
        </p>
      </div>
    </div>
  );
}

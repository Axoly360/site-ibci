import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import Card from "@/components/ui/Card";
import { getBoardOrgs } from "@/lib/orgAccess";

export const metadata: Metadata = {
  title: "Área da Diretoria | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function AreaDaDiretoriaPage() {
  const board = await getBoardOrgs();
  if (!board) redirect("/central-do-membro/area");
  if (board.orgs.length === 1) redirect(`/central-do-membro/diretoria/${board.orgs[0].id}`);

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Área da Diretoria"
        description="Escolha a organização que você dirige."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />
        <div className="flex flex-col gap-4">
          {board.orgs.map((org) => (
            <Link key={org.id} href={`/central-do-membro/diretoria/${org.id}`}>
              <Card className="flex items-center justify-between gap-4 p-6">
                <div>
                  <p className="font-heading text-lg font-semibold text-primary">{org.short_name}</p>
                  <p className="text-sm text-text-neutral/70">{org.name}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-primary" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

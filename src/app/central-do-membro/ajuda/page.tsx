import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import HelpCenter from "@/components/help/HelpCenter";
import { getSession } from "@/lib/session";
import { getHelpArticles } from "@/data/helpArticles";

export const metadata: Metadata = {
  title: "Ajuda | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function AjudaMembroPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const articles = getHelpArticles("membro");

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ajuda"
        description="Como usar a Central do Membro."
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />
        <HelpCenter articles={articles} />
      </div>
    </div>
  );
}

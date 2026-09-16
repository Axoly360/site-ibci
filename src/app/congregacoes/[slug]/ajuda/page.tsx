import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import HelpCenter from "@/components/help/HelpCenter";
import { getCongregationSession } from "@/lib/congregation-session";
import { getHelpArticles } from "@/data/helpArticles";

export const metadata: Metadata = {
  title: "Ajuda | Congregação IBCI",
  robots: { index: false, follow: false },
};

export default async function AjudaCongregacaoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getCongregationSession();
  if (!session || session.congregationSlug !== slug) {
    redirect(`/congregacoes/${slug}/entrar`);
  }

  const articles = getHelpArticles("congregacao");

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Ajuda"
        description={`Como usar o portal da ${session.congregationName}.`}
      />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <HelpCenter articles={articles} />
      </div>
    </div>
  );
}

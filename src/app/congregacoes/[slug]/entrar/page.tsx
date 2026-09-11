import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import LoginCongregacaoForm from "@/components/congregacoes/LoginCongregacaoForm";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Acesso da Congregação | IBCI",
  robots: { index: false, follow: false },
};

export default async function CongregacaoEntrarPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [congregation] = await sql`select name from congregations where slug = ${slug}`;
  if (!congregation) notFound();

  return (
    <div className="bg-bg-light">
      <PageBanner
        title={congregation.name}
        description="Acesso restrito ao responsável da congregação."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <LoginCongregacaoForm slug={slug} />
      </div>
    </div>
  );
}

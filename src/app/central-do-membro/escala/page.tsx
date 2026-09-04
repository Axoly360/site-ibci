import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";
import { getContent } from "@/lib/content";
import PageBanner from "@/components/layout/PageBanner";

export const metadata: Metadata = {
  title: "Escala de Serviços | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function EscalaDeServicosPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member, is_leadership
    from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member || !member?.is_leadership) {
    redirect("/central-do-membro/area");
  }

  const imageUrl = await getContent("escala.image_url", "/escala-setembro-2026.jpeg");

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Escala de Serviços"
        description="Acesso restrito a Pastores, Diáconos, Professores e Líderes."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative mx-auto aspect-[1024/1536] w-full max-w-xl overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={imageUrl}
            alt="Escala de serviços do mês"
            fill
            unoptimized={imageUrl.startsWith("http")}
            sizes="(min-width: 640px) 576px, 100vw"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}

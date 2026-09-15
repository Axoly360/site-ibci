import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import TornarMembroForm from "@/components/membros/TornarMembroForm";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";

export const metadata: Metadata = {
  title: "Seja um Membro | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function SejaMembroPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select name, is_validated_member from members where id = ${session.memberId}
  `;
  if (member?.is_validated_member) redirect("/central-do-membro/area");

  return (
    <div className="bg-primary px-4 py-16 sm:py-24">
      <div className="mx-auto mb-8 flex justify-center">
        <Image src="/logo-ibci.svg" alt="Logo IBCI" width={160} height={64} />
      </div>
      <TornarMembroForm initialName={member?.name ?? ""} />
    </div>
  );
}

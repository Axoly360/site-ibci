import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import BackToMemberArea from "@/components/membros/BackToMemberArea";
import ConsentTermsList, { type ConsentTermView } from "@/components/membros/ConsentTermsList";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";
import { getAllContent } from "@/lib/content";
import { CONSENT_TERMS } from "@/lib/consentTerms";

export const metadata: Metadata = {
  title: "Consentimento | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function ConsentimentoPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");

  const [texts, consents] = await Promise.all([
    getAllContent(),
    sql`
      select term_key, accepted_at from member_consents
      where member_id = ${session.memberId}
    `,
  ]);

  const acceptedByKey = new Map(
    consents.map((c: { term_key: string; accepted_at: string }) => [c.term_key, c.accepted_at])
  );

  const terms: ConsentTermView[] = CONSENT_TERMS.map((term) => ({
    key: term.key,
    title: texts[term.titleContentKey] ?? term.defaultTitle,
    body: texts[term.bodyContentKey] ?? "",
    acceptedAt: acceptedByKey.get(term.key) ?? null,
  }));
  const hasPending = terms.some((t) => !t.acceptedAt);

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Consentimento"
        description="Leia e registre seu aceite aos termos da igreja, conforme a LGPD."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <BackToMemberArea />
        {hasPending && (
          <div className="mb-6 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Você precisa aceitar os termos abaixo para continuar usando a Central do
              Membro.
            </span>
          </div>
        )}
        <ConsentTermsList terms={terms} />
      </div>
    </div>
  );
}

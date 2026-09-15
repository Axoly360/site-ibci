import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import Card from "@/components/ui/Card";
import VolunteerForm from "@/components/membros/VolunteerForm";
import { getSession } from "@/lib/session";
import { sql } from "@/lib/db";
import { CONSENT_TERMS } from "@/lib/consentTerms";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Servir | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function ServirCadastroPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  const [member] = await sql`
    select is_validated_member from members where id = ${session.memberId}
  `;
  if (!member?.is_validated_member) redirect("/central-do-membro");

  const [accepted, texts, [existing], congregations] = await Promise.all([
    sql`select term_key from member_consents where member_id = ${session.memberId}`,
    getAllContent(),
    sql`
      select ministries, note, congregation_id from volunteer_registrations
      where member_id = ${session.memberId}
    `,
    sql`select id, name from congregations order by name asc`,
  ]);

  const acceptedKeys = new Set(accepted.map((a: { term_key: string }) => a.term_key));
  const missingTerms = CONSENT_TERMS.filter((term) => !acceptedKeys.has(term.key));

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Servir"
        description="Conte pra gente onde você já serve ou gostaria de servir na IBCI."
      />
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        {missingTerms.length > 0 ? (
          <Card className="flex flex-col gap-3 p-6">
            <p className="flex items-center gap-2 font-heading text-lg font-semibold text-primary">
              <ShieldCheck className="h-5 w-5 shrink-0 text-secondary" />
              Antes de se voluntariar, aceite os termos abaixo
            </p>
            <ul className="list-inside list-disc text-sm text-text-neutral/80">
              {missingTerms.map((term) => (
                <li key={term.key}>{texts[term.titleContentKey] ?? term.defaultTitle}</li>
              ))}
            </ul>
            <Link
              href="/central-do-membro/consentimento"
              className="mt-2 inline-flex w-fit items-center gap-1.5 font-semibold text-secondary hover:underline"
            >
              Ir para Consentimento
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Card>
        ) : (
          <Card className="p-6">
            <VolunteerForm
              congregations={congregations}
              initialCongregationId={existing?.congregation_id ?? ""}
              initialMinistries={existing?.ministries ?? []}
              initialNote={existing?.note ?? ""}
            />
          </Card>
        )}
      </div>
    </div>
  );
}

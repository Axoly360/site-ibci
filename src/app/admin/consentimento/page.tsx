import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import ConsentTermForm from "@/components/admin/ConsentTermForm";
import { getAdminSession, hasPermission } from "@/lib/admin-session";
import { getAllContent } from "@/lib/content";
import { CONSENT_TERMS } from "@/lib/consentTerms";

export const metadata: Metadata = {
  title: "Consentimento | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function AdminConsentimentoPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");
  if (!hasPermission(session, "documentos")) redirect("/admin");

  const texts = await getAllContent();

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Consentimento"
        description="Textos dos termos LGPD que o membro visualiza e aceita na Central do Membro."
      />
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6 lg:px-8">
        {CONSENT_TERMS.map((term) => (
          <ConsentTermForm
            key={term.key}
            titleKey={term.titleContentKey}
            bodyKey={term.bodyContentKey}
            initialTitle={texts[term.titleContentKey] ?? term.defaultTitle}
            initialBody={texts[term.bodyContentKey] ?? ""}
          />
        ))}
      </div>
    </div>
  );
}

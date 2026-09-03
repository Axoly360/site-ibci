import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PageBanner from "@/components/layout/PageBanner";
import AdminNav from "@/components/admin/AdminNav";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import { getAdminSession } from "@/lib/admin-session";

export const metadata: Metadata = {
  title: "Minha conta | Painel IBCI",
  robots: { index: false, follow: false },
};

export default async function ContaPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/entrar");

  return (
    <div className="bg-bg-light">
      <AdminNav session={session} />
      <PageBanner
        title="Minha conta"
        description={`${session.name} (${session.email}) — ${session.role}`}
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <ChangePasswordForm />
      </div>
    </div>
  );
}

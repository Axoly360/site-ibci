import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import LoginAdminForm from "@/components/admin/LoginAdminForm";

export const metadata: Metadata = {
  title: "Entrar | Painel IBCI",
  robots: { index: false, follow: false },
};

export default function AdminEntrarPage() {
  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Painel IBCI"
        description="Acesso restrito à administração do site."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <LoginAdminForm />
      </div>
    </div>
  );
}

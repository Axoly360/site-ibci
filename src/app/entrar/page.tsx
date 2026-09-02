import type { Metadata } from "next";
import PageBanner from "@/components/layout/PageBanner";
import LoginForm from "@/components/eventos/LoginForm";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Entrar | IBCI - Igreja Batista Central do Ibura",
  description: "Entre ou cadastre-se para se inscrever nos eventos da IBCI.",
};

export default async function EntrarPage() {
  const session = await getSession();

  return (
    <div className="bg-bg-light">
      <PageBanner
        title="Entrar"
        description="Use seu e-mail para entrar ou criar sua conta — sem senha."
      />
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <LoginForm session={session} />
      </div>
    </div>
  );
}

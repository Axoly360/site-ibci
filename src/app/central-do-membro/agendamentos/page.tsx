import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import BookingRequestForm from "@/components/membros/BookingRequestForm";

export const metadata: Metadata = {
  title: "Agendamentos | IBCI - Igreja Batista Central do Ibura",
  robots: { index: false, follow: false },
};

export default async function AgendamentosPage() {
  const session = await getSession();
  if (!session) redirect("/central-do-membro");

  return (
    <div className="bg-bg-light">
      <section className="bg-primary px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">
            Agendamentos
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
            Solicite a disponibilidade para casamentos, cultos de ação de
            graças e outros eventos especiais.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <BookingRequestForm />
      </div>
    </div>
  );
}

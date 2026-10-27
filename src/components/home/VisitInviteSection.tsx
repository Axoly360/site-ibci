import Ibi from "@/components/brand/Ibi";
import Button from "@/components/ui/Button";

/** Convite de boas-vindas ao visitante, com o Ibi acenando. */
export default function VisitInviteSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-6 rounded-3xl border border-hairline bg-nevoa px-6 py-10 text-center sm:flex-row sm:text-left md:px-12">
        <Ibi pose="acenar" size={160} animado className="shrink-0" />
        <div className="flex-1">
          <h2 className="font-heading text-2xl font-bold text-primary sm:text-3xl">
            Oi, eu sou o Ibi! Domingo tem lugar para você.
          </h2>
          <p className="mt-2 text-text-neutral/80">
            Venha como você está. Conte um pouco sobre você e nossa equipe de
            acolhimento entra em contato.
          </p>
          <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row">
            <Button href="/visitantes/cadastro" variant="primary">
              Quero visitar
            </Button>
            <Button href="/para-voce/programacoes" variant="ghost">
              Ver programação
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

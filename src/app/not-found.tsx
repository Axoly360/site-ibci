import type { Metadata } from "next";
import { Home, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Página não encontrada | IBCI",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-bg-light px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <p className="font-heading text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-primary sm:text-3xl">
          Essa página não existe
        </h1>
        <p className="mt-3 text-sm text-text-neutral/70">
          O link pode ter mudado ou a página não existe mais. Volte para a
          home ou fale com a gente se precisar de ajuda.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/" size="md">
            <Home className="h-4 w-4" />
            Voltar para a home
          </Button>
          <Button href="/contato" variant="ghost" size="md" className="border-2 border-primary/20">
            <MessageCircle className="h-4 w-4" />
            Falar com a igreja
          </Button>
        </div>
      </div>
    </div>
  );
}

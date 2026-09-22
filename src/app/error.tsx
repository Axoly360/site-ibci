"use client";

import { useEffect } from "react";
import { Home, RotateCcw } from "lucide-react";
import Button from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro não tratado na página:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-bg-light px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <p className="font-heading text-6xl font-bold text-primary">Ops!</p>
        <h1 className="mt-4 font-heading text-2xl font-bold text-primary sm:text-3xl">
          Algo deu errado
        </h1>
        <p className="mt-3 text-sm text-text-neutral/70">
          Não conseguimos carregar essa página agora. Tente de novo — se o
          problema continuar, fale com a secretaria da IBCI.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button onClick={reset} size="md">
            <RotateCcw className="h-4 w-4" />
            Tentar de novo
          </Button>
          <Button href="/" variant="ghost" size="md" className="border-2 border-primary/20">
            <Home className="h-4 w-4" />
            Voltar para a home
          </Button>
        </div>
      </div>
    </div>
  );
}

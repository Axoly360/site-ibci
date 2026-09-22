"use client";

import { useEffect } from "react";

/**
 * Só entra em ação se o erro acontecer no próprio layout raiz (fora do que
 * error.tsx já cobre) — precisa renderizar <html>/<body> porque substitui o
 * layout inteiro nesse caso. Sem isso, um erro nesse nível cairia na tela
 * de erro genérica do Next, sem a identidade visual do site.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro não tratado no layout raiz:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen items-center justify-center bg-[#F5F2EA] px-4 font-sans">
        <div className="mx-auto max-w-md text-center">
          <p className="text-6xl font-bold text-[#123B2C]">Ops!</p>
          <h1 className="mt-4 text-2xl font-bold text-[#123B2C] sm:text-3xl">
            Algo deu errado
          </h1>
          <p className="mt-3 text-sm text-[#123B2C]/70">
            Não conseguimos carregar o site agora. Tente de novo em alguns
            instantes.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-full bg-[#D4AF37] px-6 py-3 text-sm font-bold text-[#123B2C]"
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}

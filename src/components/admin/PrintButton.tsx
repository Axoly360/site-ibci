"use client";

import { FileText } from "lucide-react";

export default function PrintButton({ label = "Exportar PDF" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="Abre a impressão do navegador: escolha “Salvar como PDF” como destino"
      className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-secondary-light"
    >
      <FileText className="h-4 w-4" />
      {label}
    </button>
  );
}

"use client";

import { useState } from "react";
import { Copy, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";

export default function ContributionSummary({
  memberName,
  year,
  total,
  count,
}: {
  memberName: string;
  year: number;
  total: number;
  count: number;
}) {
  const [copied, setCopied] = useState(false);

  const totalLabel = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const summaryText = `Resumo de contribuições - ${year}
Igreja Batista Central do Ibura
Membro: ${memberName}
Total contribuído em ${year}: ${totalLabel}
Número de lançamentos: ${count}

Este resumo é gerado com base nas contribuições registradas em nome do membro
pela tesouraria da igreja e pode ser usado como referência para declaração de
imposto de renda.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard indisponível — sem ação, o texto continua visível para cópia manual.
    }
  };

  const handleDownload = () => {
    const blob = new Blob([summaryText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumo-contribuicoes-${year}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="space-y-4 p-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Resumo anual — {year}
        </span>
        <p className="mt-1 font-heading text-2xl font-bold text-primary">{totalLabel}</p>
        <p className="text-sm text-text-neutral/60">
          {count} {count === 1 ? "contribuição registrada" : "contribuições registradas"}
        </p>
      </div>
      <p className="text-xs text-text-neutral/50">
        Pode ser usado como referência para a sua declaração de imposto de
        renda.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
        >
          {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado!" : "Copiar resumo"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
        >
          Baixar resumo (.txt)
        </button>
      </div>
    </Card>
  );
}

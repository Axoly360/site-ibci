"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CongregationBudgetForm({
  slug,
  currentBudget,
}: {
  slug: string;
  currentBudget: number | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentBudget ? String(currentBudget) : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    setError("");
    setDone(false);
    const numericValue = Number(value.replace(",", "."));
    if (!Number.isFinite(numericValue) || numericValue < 0) {
      setError("Informe um valor válido.");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/admin/congregacoes/${slug}/orcamento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ annualBudget: numericValue }),
    });
    setLoading(false);

    if (res.ok) {
      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 2500);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  return (
    <Card className="mb-6 p-6">
      <h2 className="mb-1 font-heading text-lg font-semibold text-primary">
        Orçamento Anual
      </h2>
      <p className="mb-3 text-sm text-text-neutral/60">
        {currentBudget != null
          ? `Orçamento atual: ${formatCurrency(currentBudget)}`
          : "Ainda não definido para esta congregação."}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0,00"
          className="w-40 rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
        <Button onClick={handleSave} size="sm" disabled={loading}>
          <Save className="h-4 w-4" />
          {loading ? "Salvando..." : "Salvar"}
        </Button>
        {done && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Salvo
          </span>
        )}
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </Card>
  );
}

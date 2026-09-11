"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const CATEGORIES = ["Verba", "Material", "Evento", "Visita Pastoral", "Outro"];

export default function SolicitacaoForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [estimatedAmount, setEstimatedAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setDone(false);
    if (!description.trim()) {
      setError("Descreva a solicitação.");
      return;
    }

    setLoading(true);
    const res = await fetch(`/api/congregacoes/${slug}/solicitacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        description,
        estimatedAmount: estimatedAmount ? Number(estimatedAmount.replace(",", ".")) : "",
      }),
    });
    setLoading(false);

    if (res.ok) {
      setDescription("");
      setEstimatedAmount("");
      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 3000);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar a solicitação.");
    }
  };

  return (
    <Card className="space-y-4 p-6">
      <h2 className="font-heading text-lg font-semibold text-primary">
        Nova Solicitação
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-text-neutral"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Valor estimado (opcional)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={estimatedAmount}
            onChange={(e) => setEstimatedAmount(e.target.value)}
            placeholder="0,00"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-text-neutral"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-text-neutral">
          Descrição
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Explique o que está sendo solicitado à central..."
          className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-text-neutral"
        />
      </div>

      <Button onClick={handleSubmit} size="sm" disabled={loading}>
        <Send className="h-4 w-4" />
        {loading ? "Enviando..." : "Enviar solicitação"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Solicitação enviada
        </p>
      )}
    </Card>
  );
}

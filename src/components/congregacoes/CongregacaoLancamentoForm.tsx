"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const CATEGORIES = ["Dízimo", "Oferta", "Doação avulsa", "Despesa", "Outro"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CongregacaoLancamentoForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [type, setType] = useState<"entrada" | "saida">("entrada");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [entryDate, setEntryDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setDone(false);

    const numericAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Informe um valor válido.");
      return;
    }
    if (!entryDate) {
      setError("Informe a data.");
      return;
    }

    const formData = new FormData();
    formData.set("type", type);
    formData.set("category", category);
    formData.set("amount", String(numericAmount));
    formData.set("entryDate", entryDate);
    formData.set("description", description);
    const file = fileInputRef.current?.files?.[0];
    if (file) formData.set("file", file);

    setLoading(true);
    const res = await fetch(`/api/congregacoes/${slug}/financeiro`, {
      method: "POST",
      body: formData,
    });
    setLoading(false);

    if (res.ok) {
      setAmount("");
      setDescription("");
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setDone(true);
      router.refresh();
      setTimeout(() => setDone(false), 3000);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? `Não foi possível lançar (${res.status}).`);
    }
  };

  return (
    <Card className="space-y-4 p-6">
      <h2 className="font-heading text-lg font-semibold text-primary">
        Novo Lançamento
      </h2>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setType("entrada")}
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
            type === "entrada"
              ? "border-primary bg-primary text-white"
              : "border-black/10 text-text-neutral/70"
          }`}
        >
          Entrada
        </button>
        <button
          type="button"
          onClick={() => setType("saida")}
          className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
            type === "saida"
              ? "border-red-600 bg-red-600 text-white"
              : "border-black/10 text-text-neutral/70"
          }`}
        >
          Saída
        </button>
      </div>

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
            Valor (R$)
          </label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-text-neutral"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Data
          </label>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-text-neutral"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Comprovante (opcional)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-left text-sm text-secondary hover:bg-primary/5"
          >
            <FileText className="h-4 w-4 shrink-0" />
            {fileName || "Escolher arquivo"}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-text-neutral">
          Descrição (opcional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: dízimo do culto de domingo, conta de energia, etc."
          className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-text-neutral"
        />
      </div>

      <Button onClick={handleSubmit} size="sm" disabled={loading}>
        <Send className="h-4 w-4" />
        {loading ? "Lançando..." : "Lançar"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Lançamento registrado
        </p>
      )}
    </Card>
  );
}

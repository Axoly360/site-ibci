"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Receipt {
  id: string;
  file_name: string;
  file_url: string;
  category: string | null;
  amount: string | null;
  status: string;
  created_at: string;
}

const CATEGORIES = ["Dízimos", "Oferta de Amor", "Oferta Missões", "Saídas"];
const SENDER_TYPES = ["Membro", "Congregado", "Visitante", "Funcionário", "Prestador de Serviços"];

function defaultTypeFor(category: string): "entrada" | "saida" {
  return category === "Saídas" ? "saida" : "entrada";
}

const STATUS_LABEL: Record<string, string> = {
  pendente: "Aguardando análise",
  aprovado: "Aprovado",
};

function formatCurrency(value: string | null) {
  if (!value) return "";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ReceiptUploadPanel() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [senderType, setSenderType] = useState(SENDER_TYPES[0]);
  const [type, setType] = useState<"entrada" | "saida">("entrada");
  const [amount, setAmount] = useState("");
  const [receipts, setReceipts] = useState<Receipt[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const loadReceipts = () => {
    fetch("/api/membros/comprovantes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setReceipts(data?.receipts ?? []))
      .catch(() => setReceipts([]));
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0];
    setError("");
    setDone(false);
    if (!file) {
      setError("Escolha um arquivo antes de enviar.");
      return;
    }
    const numericAmount = Number(amount.replace(",", "."));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Informe o valor do comprovante.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("senderType", senderType);
    formData.append("type", type);
    formData.append("amount", String(numericAmount));

    const res = await fetch("/api/membros/comprovantes", { method: "POST", body: formData });
    setLoading(false);
    if (res.ok) {
      if (inputRef.current) inputRef.current.value = "";
      setFileName("");
      setAmount("");
      setDone(true);
      loadReceipts();
      setTimeout(() => setDone(false), 3000);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? `Não foi possível enviar o arquivo (${res.status}).`);
    }
  };

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h3 className="font-heading text-lg font-bold text-primary">
          Enviar Comprovante
        </h3>
        <p className="mt-1 text-sm text-text-neutral/70">
          Já é membro validado? Envie o comprovante da sua contribuição em
          PDF, PNG ou JPEG.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setType(defaultTypeFor(e.target.value));
            }}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
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
            Quem enviou
          </label>
          <select
            value={senderType}
            onChange={(e) => setSenderType(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            {SENDER_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Tipo
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("entrada")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
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
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                type === "saida"
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-black/10 text-text-neutral/70"
              }`}
            >
              Saída
            </button>
          </div>
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
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:underline"
        >
          <FileText className="h-4 w-4" />
          {fileName || "Escolher arquivo"}
        </button>
        <Button onClick={handleUpload} size="sm" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Enviando..." : "Enviar comprovante"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {done && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Comprovante enviado com sucesso
        </p>
      )}

      {receipts && receipts.length > 0 && (
        <div className="space-y-2 border-t border-black/10 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
            Seus comprovantes enviados
          </span>
          <ul className="space-y-1.5">
            {receipts.map((receipt) => (
              <li key={receipt.id} className="flex flex-wrap items-center justify-between gap-2">
                <a
                  href={receipt.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-secondary hover:underline"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  {receipt.category || receipt.file_name}
                  {receipt.amount && ` — ${formatCurrency(receipt.amount)}`}
                </a>
                <span className="text-xs font-semibold text-text-neutral/60">
                  {STATUS_LABEL[receipt.status] ?? receipt.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

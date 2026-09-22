"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";

const CATEGORIES = ["Dízimo", "Oferta", "Doação avulsa", "Despesa", "Outro"];
const REQUESTED_BY_OPTIONS = ["Pastor", "Tesouraria", "Secretaria", "Zelador"];

export interface LancamentoParaEditar {
  id: string;
  type: "entrada" | "saida";
  category: string;
  amount: string | number;
  entry_date: string;
  description: string | null;
  requested_by: string | null;
}

export default function LancamentoActions({ entry }: { entry: LancamentoParaEditar }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Excluir este lançamento? Se ele veio de um comprovante ou prestação de contas, essa origem volta a ficar pendente para ser corrigida e lançada de novo."
      )
    ) {
      return;
    }
    setDeleting(true);
    const res = await fetch(`/api/admin/financeiro/lancamentos/${entry.id}`, {
      method: "DELETE",
    });
    setDeleting(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error ?? "Não foi possível excluir.");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex items-center gap-1 text-xs font-semibold text-secondary hover:underline"
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {deleting ? "Excluindo..." : "Excluir"}
      </button>

      {editing && (
        <EditModal entry={entry} onClose={() => setEditing(false)} onSaved={() => router.refresh()} />
      )}
    </div>
  );
}

function EditModal({
  entry,
  onClose,
  onSaved,
}: {
  entry: LancamentoParaEditar;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [type, setType] = useState<"entrada" | "saida">(entry.type);
  const [category, setCategory] = useState(entry.category);
  const [amount, setAmount] = useState(String(entry.amount));
  const [entryDate, setEntryDate] = useState(entry.entry_date);
  const [description, setDescription] = useState(entry.description ?? "");
  const [requestedBy, setRequestedBy] = useState(entry.requested_by ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categoryOptions = CATEGORIES.includes(category) ? CATEGORIES : [...CATEGORIES, category];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/admin/financeiro/lancamentos/${entry.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        category,
        amount: Number(amount.replace(",", ".")),
        entryDate,
        description,
        requestedBy,
      }),
    });
    setLoading(false);
    if (res.ok) {
      onSaved();
      onClose();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold text-primary">
            Corrigir lançamento
          </h3>
          <button type="button" onClick={onClose} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("entrada")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
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
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold ${
                type === "saida"
                  ? "border-red-600 bg-red-600 text-white"
                  : "border-black/10 text-text-neutral/70"
              }`}
            >
              Saída
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            >
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Valor (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Data
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {type === "saida" && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
                Quem solicitou (opcional)
              </label>
              <select
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
              >
                <option value="">Não informado</option>
                {REQUESTED_BY_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-neutral/70">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="mt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-semibold text-text-neutral/60"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface MemberOption {
  id: string;
  name: string;
  email: string;
}

const CATEGORIES = [
  "Dízimo",
  "Oferta",
  "Doação avulsa",
  "Despesa",
  "Outro",
];

const REQUESTED_BY_OPTIONS = ["Pastor", "Tesouraria", "Secretaria", "Zelador"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function LancamentoForm({ members }: { members: MemberOption[] }) {
  const router = useRouter();
  const [type, setType] = useState<"entrada" | "saida">("entrada");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [amount, setAmount] = useState("");
  const [entryDate, setEntryDate] = useState(todayISO());
  const [description, setDescription] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [requestedBy, setRequestedBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const filteredMembers = useMemo(() => {
    if (!memberQuery.trim()) return [];
    const query = memberQuery.trim().toLowerCase();
    return members
      .filter(
        (m) => m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query)
      )
      .slice(0, 8);
  }, [members, memberQuery]);

  const selectedMember = members.find((m) => m.id === memberId) ?? null;

  const handleSubmit = async () => {
    setError("");
    setDone(false);

    const numericAmount = Number(amount.replace(",", "."));
    if (!category) {
      setError("Escolha uma categoria.");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Informe um valor válido.");
      return;
    }
    if (!entryDate) {
      setError("Informe a data.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/financeiro/lancamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        category,
        amount: numericAmount,
        entryDate,
        description,
        memberId,
        requestedBy,
      }),
    });
    setLoading(false);

    if (res.ok) {
      setAmount("");
      setDescription("");
      setMemberId(null);
      setMemberQuery("");
      setRequestedBy("");
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
          onClick={() => {
            setType("entrada");
            setRequestedBy("");
          }}
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
          onClick={() => {
            setType("saida");
            setMemberId(null);
            setMemberQuery("");
          }}
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

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Data
          </label>
          <input
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        {type === "saida" ? (
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Quem solicitou (opcional)
            </label>
            <select
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            >
              <option value="">Não informado</option>
              {REQUESTED_BY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="relative">
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Membro (opcional)
            </label>
            {selectedMember ? (
              <div className="flex items-center justify-between rounded-lg border border-black/10 px-3 py-2 text-sm">
                <span>{selectedMember.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setMemberId(null);
                    setMemberQuery("");
                  }}
                  className="text-xs font-semibold text-secondary hover:underline"
                >
                  Trocar
                </button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={memberQuery}
                  onChange={(e) => setMemberQuery(e.target.value)}
                  placeholder="Buscar por nome ou e-mail..."
                  className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                />
                {filteredMembers.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full rounded-lg border border-black/10 bg-white shadow-lg">
                    {filteredMembers.map((m) => (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setMemberId(m.id);
                            setMemberQuery("");
                          }}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-primary/5"
                        >
                          <div className="font-semibold text-text-neutral">{m.name}</div>
                          <div className="text-xs text-text-neutral/60">{m.email}</div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-text-neutral">
          Descrição (opcional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: dízimo em envelope, conta de energia, etc."
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
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

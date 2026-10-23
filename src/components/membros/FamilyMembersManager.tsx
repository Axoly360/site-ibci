"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, UserPlus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatDateBR } from "@/lib/masks";
import { RELATIONSHIP_OPTIONS } from "@/lib/family";

export interface FamilyMember {
  id: string;
  name: string;
  birthdate: string | null;
  sex: string | null;
  relationship: string;
}

export interface EbdClassOption {
  id: string;
  name: string;
  audience: string | null;
}

export interface EbdStatus {
  enrolled: string[];
  pending: string[];
}

export default function FamilyMembersManager({
  familiares,
  ebdClasses = [],
  ebdByFamiliar = {},
}: {
  familiares: FamilyMember[];
  ebdClasses?: EbdClassOption[];
  ebdByFamiliar?: Record<string, EbdStatus>;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [sex, setSex] = useState("");
  const [relationship, setRelationship] = useState<string>(RELATIONSHIP_OPTIONS[1]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/membros/familia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthdate, sex, relationship }),
    });
    setLoading(false);
    if (res.ok) {
      setName("");
      setBirthdate("");
      setSex("");
      setRelationship(RELATIONSHIP_OPTIONS[1]);
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível cadastrar o familiar.");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remover este cadastro?")) return;
    const res = await fetch(`/api/membros/familia/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <h2 className="font-heading text-lg font-semibold text-primary">
          Adicionar familiar
        </h2>
        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3">
          <input
            required
            placeholder="Nome completo do familiar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {RELATIONSHIP_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              placeholder="Nascimento (dd/mm/aaaa)"
              inputMode="numeric"
              maxLength={10}
              value={birthdate}
              onChange={(e) => setBirthdate(formatDateBR(e.target.value))}
              className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Sexo</option>
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>
          <Button type="submit" disabled={loading}>
            <UserPlus className="h-4 w-4" />
            {loading ? "Salvando..." : "Adicionar familiar"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {familiares.length === 0 ? (
          <p className="text-sm text-text-neutral/60">
            Nenhum familiar cadastrado ainda.
          </p>
        ) : (
          familiares.map((familiar) =>
            editingId === familiar.id ? (
              <EditFamilyMemberCard
                key={familiar.id}
                familiar={familiar}
                onCancel={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            ) : (
              <Card key={familiar.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-text-neutral">{familiar.name}</p>
                  <p className="text-sm text-text-neutral/60">
                    {[familiar.relationship, familiar.birthdate, familiar.sex]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                  <EbdPicker
                    childId={familiar.id}
                    classes={ebdClasses}
                    status={ebdByFamiliar[familiar.id]}
                  />
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setEditingId(familiar.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(familiar.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </button>
                </div>
              </Card>
            )
          )
        )}
      </div>
    </div>
  );
}

function EbdPicker({
  childId,
  classes,
  status,
}: {
  childId: string;
  classes: EbdClassOption[];
  status?: EbdStatus;
}) {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enrolled = status?.enrolled ?? [];
  const pending = status?.pending ?? [];

  const handleRequest = async () => {
    if (!classId) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/membros/ebd/${classId}/solicitar-familiar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId }),
    });
    setLoading(false);
    if (res.ok) {
      setClassId("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar o pedido.");
    }
  };

  if (classes.length === 0 && enrolled.length === 0 && pending.length === 0) return null;

  return (
    <div className="mt-2 flex flex-col gap-1.5 text-xs">
      {enrolled.length > 0 && (
        <p className="font-semibold text-primary">EBD: {enrolled.join(", ")}</p>
      )}
      {pending.length > 0 && (
        <p className="font-semibold text-secondary">
          EBD: aguardando aprovação ({pending.join(", ")})
        </p>
      )}
      {classes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            aria-label="Sala da EBD"
            className="rounded-lg border border-black/10 bg-bg-light px-2.5 py-1.5 text-xs outline-none focus:border-primary"
          >
            <option value="">Escolher sala da EBD</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.audience ? ` — ${c.audience}` : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleRequest}
            disabled={!classId || loading}
            className="rounded-full bg-primary px-3 py-1.5 font-bold text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Enviando..." : "Pedir sala"}
          </button>
        </div>
      )}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}

function EditFamilyMemberCard({
  familiar,
  onCancel,
  onSaved,
}: {
  familiar: FamilyMember;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(familiar.name);
  const [birthdate, setBirthdate] = useState(familiar.birthdate ?? "");
  const [sex, setSex] = useState(familiar.sex ?? "");
  const [relationship, setRelationship] = useState(familiar.relationship);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/membros/familia/${familiar.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthdate, sex, relationship }),
    });
    setLoading(false);
    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-sm font-semibold text-primary">
            Editar familiar
          </h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome completo"
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <select
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {RELATIONSHIP_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            placeholder="Nascimento (dd/mm/aaaa)"
            inputMode="numeric"
            maxLength={10}
            value={birthdate}
            onChange={(e) => setBirthdate(formatDateBR(e.target.value))}
            className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Sexo</option>
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
          <button type="button" onClick={onCancel} className="text-sm font-semibold text-text-neutral/60">
            Cancelar
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Card>
  );
}

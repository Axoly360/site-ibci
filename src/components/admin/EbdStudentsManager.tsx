"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, UserPlus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface EbdStudent {
  id: string;
  name: string;
  kind: string;
  parent_name: string | null;
}

export interface EbdJoinRequest {
  id: string;
  name: string;
  email: string;
  requested_at: string;
}

export interface EbdPerson {
  id: string;
  name: string;
  parent_name?: string | null;
}

export default function EbdStudentsManager({
  classId,
  students,
  pendingRequests,
  availableMembers,
  availableChildren,
}: {
  classId: string;
  students: EbdStudent[];
  pendingRequests: EbdJoinRequest[];
  availableMembers: EbdPerson[];
  availableChildren: EbdPerson[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const handleDecision = async (requestId: string, decision: "aprovado" | "recusado") => {
    setDecidingId(requestId);
    const res = await fetch(`/api/admin/ebd/${classId}/solicitacoes/${requestId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setDecidingId(null);
    if (res.ok) router.refresh();
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selected) return;
    const [kind, personId] = selected.split(":");
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/ebd/${classId}/alunos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, personId }),
    });
    setLoading(false);
    if (res.ok) {
      setSelected("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível adicionar o aluno.");
    }
  };

  const handleRemove = async (enrollmentId: string) => {
    const res = await fetch(`/api/admin/ebd/${classId}/alunos/${enrollmentId}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {pendingRequests.length > 0 && (
        <Card className="p-6">
          <h2 className="font-heading text-lg font-semibold text-primary">
            Solicitações pendentes
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-secondary/30 bg-secondary/5 p-4"
              >
                <div>
                  <p className="font-semibold text-text-neutral">{r.name}</p>
                  <p className="text-sm text-text-neutral/60">
                    {r.email} · solicitado em {new Date(r.requested_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleDecision(r.id, "aprovado")}
                    disabled={decidingId === r.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aprovar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecision(r.id, "recusado")}
                    disabled={decidingId === r.id}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-heading text-lg font-semibold text-primary">Adicionar aluno</h2>
        <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full flex-1 rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Selecione um membro ou uma criança</option>
            <optgroup label="Membros">
              {availableMembers.map((m) => (
                <option key={m.id} value={`member:${m.id}`}>
                  {m.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Crianças (filhos cadastrados)">
              {availableChildren.map((c) => (
                <option key={c.id} value={`child:${c.id}`}>
                  {c.name}
                  {c.parent_name ? ` — filho(a) de ${c.parent_name}` : ""}
                </option>
              ))}
            </optgroup>
          </select>
          <Button type="submit" disabled={loading || !selected}>
            <UserPlus className="h-4 w-4" />
            {loading ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>

      <div className="flex flex-col gap-3">
        {students.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhum aluno nesta sala ainda.</p>
        ) : (
          students.map((s) => (
            <Card key={s.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-text-neutral">{s.name}</p>
                <p className="text-sm text-text-neutral/60">
                  {s.kind}
                  {s.parent_name ? ` · filho(a) de ${s.parent_name}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(s.id)}
                className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Trash2, UserPlus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface GroupMember {
  id: string;
  name: string;
  email: string;
}

export interface GroupJoinRequest {
  id: string;
  member_id: string;
  name: string;
  email: string;
  requested_at: string;
}

export default function GroupMembersManager({
  groupId,
  members,
  availableMembers,
  pendingRequests,
}: {
  groupId: string;
  members: GroupMember[];
  availableMembers: GroupMember[];
  pendingRequests: GroupJoinRequest[];
}) {
  const router = useRouter();
  const [memberId, setMemberId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const handleDecision = async (requestId: string, decision: "aprovado" | "recusado") => {
    setDecidingId(requestId);
    const res = await fetch(`/api/admin/grupos/${groupId}/solicitacoes/${requestId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setDecidingId(null);
    if (res.ok) router.refresh();
  };

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!memberId) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/grupos/${groupId}/membros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId }),
    });
    setLoading(false);
    if (res.ok) {
      setMemberId("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível adicionar o membro.");
    }
  };

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/admin/grupos/${groupId}/membros/${id}`, {
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
                    {r.email} · solicitado em{" "}
                    {new Date(r.requested_at).toLocaleDateString("pt-BR")}
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
        <h2 className="font-heading text-lg font-semibold text-primary">
          Adicionar membro ao grupo
        </h2>
        <form onSubmit={handleAdd} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full flex-1 rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Selecione um membro validado</option>
            {availableMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.email}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={loading || !memberId}>
            <UserPlus className="h-4 w-4" />
            {loading ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>

      <div className="flex flex-col gap-3">
        {members.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhum membro neste grupo ainda.</p>
        ) : (
          members.map((m) => (
            <Card key={m.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-text-neutral">{m.name}</p>
                <p className="text-sm text-text-neutral/60">{m.email}</p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(m.id)}
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

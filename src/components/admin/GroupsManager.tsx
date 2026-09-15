"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, Trash2, Users, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface Group {
  id: string;
  name: string;
  leader_name: string | null;
  meeting_day: string | null;
  location: string | null;
  description: string | null;
  member_count: number;
}

interface GroupFields {
  name: string;
  leaderName: string;
  meetingDay: string;
  location: string;
  description: string;
}

const emptyFields: GroupFields = {
  name: "",
  leaderName: "",
  meetingDay: "",
  location: "",
  description: "",
};

function GroupFieldsInputs({
  fields,
  onChange,
}: {
  fields: GroupFields;
  onChange: (fields: GroupFields) => void;
}) {
  return (
    <>
      <input
        required
        placeholder="Nome do grupo/célula"
        value={fields.name}
        onChange={(e) => onChange({ ...fields, name: e.target.value })}
        className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          placeholder="Líder"
          value={fields.leaderName}
          onChange={(e) => onChange({ ...fields, leaderName: e.target.value })}
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          placeholder="Dia de reunião (ex.: Quintas, 19h30)"
          value={fields.meetingDay}
          onChange={(e) => onChange({ ...fields, meetingDay: e.target.value })}
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <input
        placeholder="Local (bairro/endereço)"
        value={fields.location}
        onChange={(e) => onChange({ ...fields, location: e.target.value })}
        className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <textarea
        placeholder="Descrição (opcional)"
        value={fields.description}
        onChange={(e) => onChange({ ...fields, description: e.target.value })}
        rows={2}
        className="w-full resize-none rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </>
  );
}

export default function GroupsManager({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [fields, setFields] = useState<GroupFields>(emptyFields);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/grupos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fields.name,
        leaderName: fields.leaderName,
        meetingDay: fields.meetingDay,
        location: fields.location,
        description: fields.description,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setFields(emptyFields);
      setCreating(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar o grupo.");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remover este grupo? Os membros serão desvinculados.")) return;
    const res = await fetch(`/api/admin/grupos/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-primary">Novo grupo</h2>
            <button type="button" onClick={() => setCreating(false)} className="text-text-neutral/50 hover:text-text-neutral">
              <X className="h-4 w-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <GroupFieldsInputs fields={fields} onChange={setFields} />
            <Button type="submit" disabled={loading}>
              <Plus className="h-4 w-4" />
              {loading ? "Criando..." : "Criar grupo"}
            </Button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        </Card>
      ) : (
        <Button onClick={() => setCreating(true)} size="sm">
          <Plus className="h-4 w-4" />
          Novo grupo
        </Button>
      )}

      <div className="flex flex-col gap-3">
        {groups.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhum grupo cadastrado ainda.</p>
        ) : (
          groups.map((group) =>
            editingId === group.id ? (
              <EditGroupCard
                key={group.id}
                group={group}
                onCancel={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            ) : (
              <Card key={group.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-text-neutral">{group.name}</p>
                  <p className="text-sm text-text-neutral/60">
                    {[group.leader_name, group.meeting_day, group.location]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
                    <Users className="h-3.5 w-3.5" />
                    {group.member_count} {group.member_count === 1 ? "membro" : "membros"}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <Link
                    href={`/admin/grupos/${group.id}`}
                    className="text-sm font-semibold text-secondary hover:underline"
                  >
                    Ver membros
                  </Link>
                  <button
                    type="button"
                    onClick={() => setEditingId(group.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(group.id)}
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

function EditGroupCard({
  group,
  onCancel,
  onSaved,
}: {
  group: Group;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [fields, setFields] = useState<GroupFields>({
    name: group.name,
    leaderName: group.leader_name ?? "",
    meetingDay: group.meeting_day ?? "",
    location: group.location ?? "",
    description: group.description ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/grupos/${group.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
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
          <h3 className="font-heading text-sm font-semibold text-primary">Editar grupo</h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-4 w-4" />
          </button>
        </div>
        <GroupFieldsInputs fields={fields} onChange={setFields} />
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

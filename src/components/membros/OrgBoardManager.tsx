"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, Trash2, UserPlus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface BoardPerson {
  id: string;
  name: string;
  email?: string;
}

export interface BoardEvent {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  location: string | null;
  description: string | null;
  is_past: boolean;
}

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function br(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function OrgBoardManager({
  orgId,
  pending,
  members,
  available,
  events,
}: {
  orgId: string;
  pending: BoardPerson[];
  members: BoardPerson[];
  available: BoardPerson[];
  events: BoardEvent[];
}) {
  const router = useRouter();
  const base = `/api/diretoria/${orgId}`;

  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const decide = async (memberId: string, decision: "aprovar" | "recusar") => {
    setBusyId(memberId);
    const res = await fetch(`${base}/integrantes/${memberId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setBusyId(null);
    if (res.ok) router.refresh();
  };

  const removeMember = async (p: BoardPerson) => {
    if (!confirm(`Remover ${p.name} desta organização?`)) return;
    const res = await fetch(`${base}/integrantes/${p.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const [addId, setAddId] = useState("");
  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!addId) return;
    setError("");
    const res = await fetch(`${base}/integrantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: addId }),
    });
    if (res.ok) {
      setAddId("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível adicionar.");
    }
  };

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreateEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(`${base}/agenda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date, time, location, description }),
    });
    setSaving(false);
    if (res.ok) {
      setTitle("");
      setDate("");
      setTime("");
      setLocation("");
      setDescription("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar o compromisso.");
    }
  };

  const removeEvent = async (ev: BoardEvent) => {
    if (!confirm(`Remover "${ev.title}" da agenda?`)) return;
    const res = await fetch(`${base}/agenda/${ev.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-10">
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 font-heading text-lg font-semibold text-primary">
            Pedidos para participar ({pending.length})
          </h2>
          <div className="flex flex-col gap-3">
            {pending.map((p) => (
              <Card key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-text-neutral">{p.name}</p>
                  {p.email && <p className="text-sm text-text-neutral/60">{p.email}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => decide(p.id, "aprovar")}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aprovar
                  </button>
                  <button
                    type="button"
                    disabled={busyId === p.id}
                    onClick={() => decide(p.id, "recusar")}
                    className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold text-primary">
          Agenda
        </h2>
        <Card className="mb-4 p-5">
          <form onSubmit={handleCreateEvent} className="flex flex-col gap-3">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-primary">
              <Plus className="h-4 w-4" />
              Novo compromisso
            </h3>
            <input
              required
              maxLength={120}
              placeholder="Título (ex.: Reunião mensal)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Horário (ex.: 19h30)"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputClass}
              />
              <input
                placeholder="Local"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
              />
            </div>
            <textarea
              rows={2}
              placeholder="Detalhes (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} resize-none`}
            />
            <div>
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? "Salvando..." : "Adicionar à agenda"}
              </Button>
            </div>
          </form>
        </Card>

        {events.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhum compromisso na agenda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {events.map((ev) => (
              <Card
                key={ev.id}
                className={`flex items-center justify-between gap-4 p-4 ${ev.is_past ? "opacity-60" : ""}`}
              >
                <div>
                  <p className="font-semibold text-text-neutral">{ev.title}</p>
                  <p className="text-sm text-text-neutral/70">
                    {[br(ev.event_date), ev.event_time, ev.location].filter(Boolean).join(" · ")}
                    {ev.is_past ? " · já passou" : ""}
                  </p>
                  {ev.description && (
                    <p className="mt-1 text-sm text-text-neutral/80">{ev.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeEvent(ev)}
                  aria-label="Remover compromisso"
                  className="shrink-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold text-primary">
          Integrantes ({members.length})
        </h2>
        <Card className="mb-4 p-5">
          <form onSubmit={handleAdd} className="flex flex-col gap-3 sm:flex-row">
            <select value={addId} onChange={(e) => setAddId(e.target.value)} className={inputClass}>
              <option value="">Adicionar um membro validado</option>
              {available.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" disabled={!addId}>
              <UserPlus className="h-4 w-4" />
              Adicionar
            </Button>
          </form>
        </Card>

        {members.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhum integrante ainda.</p>
        ) : (
          <Card className="divide-y divide-black/5 p-0">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <p className="font-semibold text-text-neutral">{m.name}</p>
                <button
                  type="button"
                  onClick={() => removeMember(m)}
                  aria-label={`Remover ${m.name}`}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
}

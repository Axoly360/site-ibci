"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Pencil, Plus, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface ScheduleItemRow {
  id: string;
  day: string;
  title: string;
  time: string;
  description: string;
}

export default function ScheduleManager({ items }: { items: ScheduleItemRow[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!confirm("Remover este item da programação?")) return;
    const res = await fetch(`/api/admin/programacao/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      {creating ? (
        <ScheduleFormCard
          onCancel={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            router.refresh();
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex w-fit items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Plus className="h-4 w-4" />
          Novo item na programação
        </button>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-text-neutral/60">Nenhum item cadastrado ainda.</p>
      ) : (
        items.map((item) =>
          editingId === item.id ? (
            <ScheduleFormCard
              key={item.id}
              item={item}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                router.refresh();
              }}
            />
          ) : (
            <Card key={item.id} className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-text-neutral">{item.title}</p>
                  <p className="text-sm text-text-neutral/60">
                    {item.day} · {item.time}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(item.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
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
  );
}

function ScheduleFormCard({
  item,
  onCancel,
  onSaved,
}: {
  item?: ScheduleItemRow;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(item);
  const [day, setDay] = useState(item?.day ?? "");
  const [title, setTitle] = useState(item?.title ?? "");
  const [time, setTime] = useState(item?.time ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(
      isEditing ? `/api/admin/programacao/${item!.id}` : "/api/admin/programacao",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, title, time, description }),
      }
    );
    setLoading(false);

    if (res.ok) {
      onSaved();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-primary">
            {isEditing ? "Editar item" : "Novo item"}
          </h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Dia da semana
            </label>
            <input
              required
              value={day}
              onChange={(e) => setDay(e.target.value)}
              placeholder="Ex.: Quarta-feira"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Horário</label>
            <input
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Ex.: 19h00"
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">Título</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Culto de Oração"
            className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">Descrição</label>
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="mt-2 flex items-center gap-3">
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

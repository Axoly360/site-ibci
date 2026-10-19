"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface BoardEntry {
  id: string;
  serviceDate: string;
  activity: string;
  task: string | null;
  memberName: string;
  notes: string | null;
}

export interface CatalogItem {
  id: string;
  name: string;
}

export interface BoardDeacon {
  memberId: string;
  name: string;
}

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function DeaconBoardManager({
  month,
  entries,
  activities,
  tasks,
  deacons,
}: {
  month: string;
  entries: BoardEntry[];
  activities: CatalogItem[];
  tasks: CatalogItem[];
  deacons: BoardDeacon[];
}) {
  const router = useRouter();
  const [serviceDate, setServiceDate] = useState(`${month}-01`);
  const [activity, setActivity] = useState("");
  const [task, setTask] = useState("");
  const [memberId, setMemberId] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/diaconos/escala", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceDate, activity, task, memberId, notes }),
    });
    setLoading(false);
    if (res.ok) {
      setTask("");
      setMemberId("");
      setNotes("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remover este item da escala?")) return;
    const res = await fetch(`/api/diaconos/escala/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const grouped = entries.reduce<Record<string, BoardEntry[]>>((acc, entry) => {
    (acc[entry.serviceDate] ||= []).push(entry);
    return acc;
  }, {});

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <h3 className="flex items-center gap-1.5 font-heading text-lg font-semibold text-primary">
            <Plus className="h-5 w-5" />
            Escalar diácono
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">Data</label>
              <input
                required
                type="date"
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">
                Atividade
              </label>
              <select
                required
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">Tarefa</label>
              <select value={task} onChange={(e) => setTask(e.target.value)} className={inputClass}>
                <option value="">Sem tarefa específica</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">Diácono</label>
              <select
                required
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className={inputClass}
              >
                <option value="">Selecione</option>
                {deacons.map((d) => (
                  <option key={d.memberId} value={d.memberId}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Observação (opcional)
            </label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex.: local, horário ou quem será visitado"
              className={inputClass}
            />
          </div>
          <div>
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Salvando..." : "Adicionar à escala"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </Card>

      {entries.length === 0 ? (
        <p className="text-sm text-text-neutral/60">Nenhum item escalado neste mês ainda.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-secondary">
                {formatDate(date)}
              </h3>
              <div className="flex flex-col gap-2">
                {items.map((item) => (
                  <Card key={item.id} className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-semibold text-text-neutral">
                        {item.activity}
                        {item.task ? (
                          <span className="font-normal text-text-neutral/70"> · {item.task}</span>
                        ) : null}
                      </p>
                      <p className="text-sm text-text-neutral/70">
                        {item.memberName}
                        {item.notes ? ` — ${item.notes}` : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CatalogEditor kind="atividade" title="Atividades" items={activities} />
        <CatalogEditor kind="tarefa" title="Tarefas" items={tasks} />
      </div>
    </div>
  );
}

function CatalogEditor({
  kind,
  title,
  items,
}: {
  kind: "atividade" | "tarefa";
  title: string;
  items: CatalogItem[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/diaconos/catalogo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, name }),
    });
    if (res.ok) {
      setName("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível adicionar.");
    }
  };

  const handleRemove = async (item: CatalogItem) => {
    if (!confirm(`Remover "${item.name}" da lista? Itens já escalados são mantidos.`)) return;
    const res = await fetch(`/api/diaconos/catalogo/${item.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <Card className="p-5">
      <h3 className="mb-3 font-heading text-lg font-semibold text-primary">{title}</h3>
      <ul className="mb-3 flex flex-col gap-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-text-neutral">{item.name}</span>
            <button
              type="button"
              onClick={() => handleRemove(item)}
              aria-label={`Remover ${item.name}`}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={kind === "atividade" ? "Nova atividade" : "Nova tarefa"}
          className={inputClass}
        />
        <Button type="submit" size="sm">
          Adicionar
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface AttendanceRow {
  id: string;
  service_date: string;
  service_label: string;
  total: number;
  visitors: number | null;
  notes: string | null;
}

const SUGGESTIONS = [
  "Culto de domingo - manhã",
  "Culto de domingo - noite",
  "Culto de quarta-feira",
  "Culto especial",
];

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function br(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function PresencaManager({
  rows,
  today,
}: {
  rows: AttendanceRow[];
  today: string;
}) {
  const router = useRouter();
  const [date, setDate] = useState(today);
  const [label, setLabel] = useState("");
  const [total, setTotal] = useState("");
  const [visitors, setVisitors] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    const res = await fetch("/api/admin/presenca", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, label, total, visitors, notes }),
    });
    setLoading(false);
    if (res.ok) {
      setTotal("");
      setVisitors("");
      setNotes("");
      setSaved(true);
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  const edit = (r: AttendanceRow) => {
    setDate(r.service_date);
    setLabel(r.service_label);
    setTotal(String(r.total));
    setVisitors(r.visitors === null ? "" : String(r.visitors));
    setNotes(r.notes ?? "");
    setSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (r: AttendanceRow) => {
    if (!confirm(`Remover o lançamento de ${r.service_label} em ${br(r.service_date)}?`)) return;
    const res = await fetch(`/api/admin/presenca/${r.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const recent = rows.slice(0, 8);
  const recentAvg = recent.length
    ? Math.round((recent.reduce((s, r) => s + r.total, 0) / recent.length) * 10) / 10
    : null;

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <h2 className="flex items-center gap-1.5 font-heading text-lg font-semibold text-primary">
            <Plus className="h-5 w-5" />
            Lançar presença
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">Data</label>
              <input
                required
                type="date"
                max={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">Culto</label>
              <input
                required
                list="presenca-cultos"
                maxLength={80}
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Escolha ou digite"
                className={inputClass}
              />
              <datalist id="presenca-cultos">
                {SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">
                Total de presentes <span className="text-red-600">*</span>
              </label>
              <input
                required
                type="number"
                inputMode="numeric"
                min={0}
                max={100000}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                placeholder="Inclui os visitantes"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">
                Visitantes (opcional)
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={visitors}
                onChange={(e) => setVisitors(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <input
            maxLength={200}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observação (opcional)"
            className={inputClass}
          />
          <p className="text-xs text-text-neutral/60">
            Lançar de novo o mesmo culto na mesma data atualiza o número já registrado.
          </p>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Salvando..." : "Salvar presença"}
            </Button>
            {saved && <span className="text-sm font-semibold text-primary">Salvo</span>}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </Card>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-lg font-semibold text-primary">Lançamentos recentes</h2>
          {recentAvg !== null && (
            <p className="text-sm text-text-neutral/70">
              Média dos últimos {recent.length} lançamentos:{" "}
              <strong className="text-primary">{recentAvg}</strong> presentes
            </p>
          )}
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhuma presença lançada ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((r) => (
              <Card key={r.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-text-neutral">
                    {r.service_label}{" "}
                    <span className="text-sm font-normal text-text-neutral/60">
                      · {br(r.service_date)}
                    </span>
                  </p>
                  <p className="text-sm text-text-neutral/70">
                    <strong className="text-primary">{r.total}</strong> presentes
                    {r.visitors !== null ? ` · ${r.visitors} visitantes` : ""}
                    {r.notes ? ` · ${r.notes}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() => edit(r)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(r)}
                    aria-label="Remover lançamento"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export interface DeaconRow {
  memberId: string;
  name: string;
  email: string;
  phone: string | null;
  kind: string;
  status: string;
  consecrationDate: string | null;
  area: string | null;
  congregationId: string | null;
  congregationName: string | null;
  notes: string | null;
  isBoard: boolean;
}

export interface DeaconScheduleRow {
  id: string;
  serviceDate: string;
  serviceLabel: string;
  memberName: string;
  post: string | null;
}

export interface CongregationOption {
  id: string;
  name: string;
}

const STATUS_LABEL: Record<string, string> = {
  solicitado: "Solicitado",
  ativo: "Ativo",
  afastado: "Afastado",
  emerito: "Emérito",
};

const AREAS = [
  "Recepção",
  "Mesa da Ceia",
  "Visitação",
  "Patrimônio",
  "Ação social",
  "Ordem do culto",
];

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

type Tab = "solicitacoes" | "diaconos" | "escala";

export default function DeaconManager({
  requests,
  deacons,
  schedule,
  congregations,
}: {
  requests: DeaconRow[];
  deacons: DeaconRow[];
  schedule: DeaconScheduleRow[];
  congregations: CongregationOption[];
}) {
  const [tab, setTab] = useState<Tab>(requests.length > 0 ? "solicitacoes" : "diaconos");

  const tabs: { key: Tab; label: string }[] = [
    { key: "solicitacoes", label: `Solicitações (${requests.length})` },
    { key: "diaconos", label: `Diáconos (${deacons.length})` },
    { key: "escala", label: "Escala" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              tab === t.key ? "bg-primary text-white" : "bg-white text-text-neutral/70"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "solicitacoes" && (
        <DeaconList
          rows={requests}
          congregations={congregations}
          empty="Nenhuma solicitação pendente."
          requestMode
        />
      )}
      {tab === "diaconos" && (
        <DeaconList
          rows={deacons}
          congregations={congregations}
          empty="Nenhum diácono confirmado ainda."
        />
      )}
      {tab === "escala" && (
        <ScheduleTab schedule={schedule} activeDeacons={deacons.filter((d) => d.status === "ativo")} />
      )}
    </div>
  );
}

function DeaconList({
  rows,
  congregations,
  empty,
  requestMode = false,
}: {
  rows: DeaconRow[];
  congregations: CongregationOption[];
  empty: string;
  requestMode?: boolean;
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleRefuse = async (row: DeaconRow) => {
    if (!confirm(`Recusar a solicitação de ${row.name}?`)) return;
    const res = await fetch(`/api/admin/diaconos/${row.memberId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  if (rows.length === 0) {
    return <p className="text-sm text-text-neutral/60">{empty}</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) =>
        editingId === row.memberId ? (
          <DeaconForm
            key={row.memberId}
            row={row}
            congregations={congregations}
            requestMode={requestMode}
            onCancel={() => setEditingId(null)}
            onSaved={() => {
              setEditingId(null);
              router.refresh();
            }}
          />
        ) : (
          <Card key={row.memberId} className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold text-text-neutral">
                {row.name}{" "}
                <span className="text-xs font-semibold text-primary">
                  {row.kind} · {STATUS_LABEL[row.status] ?? row.status}
                  {row.isBoard ? " · Diretoria" : ""}
                </span>
              </p>
              <p className="text-sm text-text-neutral/60">
                {[row.email, row.phone].filter(Boolean).join(" · ")}
              </p>
              {!requestMode && (
                <p className="mt-1 text-xs text-text-neutral/70">
                  {[
                    row.area,
                    row.congregationName ? `Congregação ${row.congregationName}` : "Sede",
                    row.consecrationDate ? `Consagrado em ${row.consecrationDate}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}
              {row.notes && !requestMode && (
                <p className="mt-1 text-xs text-text-neutral/60">{row.notes}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <button
                type="button"
                onClick={() => setEditingId(row.memberId)}
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
              >
                <Pencil className="h-4 w-4" />
                {requestMode ? "Analisar" : "Editar"}
              </button>
              <button
                type="button"
                onClick={() => handleRefuse(row)}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                {requestMode ? "Recusar" : "Remover"}
              </button>
            </div>
          </Card>
        )
      )}
    </div>
  );
}

function DeaconForm({
  row,
  congregations,
  requestMode,
  onCancel,
  onSaved,
}: {
  row: DeaconRow;
  congregations: CongregationOption[];
  requestMode: boolean;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [kind, setKind] = useState(row.kind);
  const [status, setStatus] = useState(requestMode ? "ativo" : row.status);
  const [consecrationDate, setConsecrationDate] = useState(row.consecrationDate ?? "");
  const [area, setArea] = useState(row.area ?? "");
  const [congregationId, setCongregationId] = useState(row.congregationId ?? "");
  const [notes, setNotes] = useState(row.notes ?? "");
  const [isBoard, setIsBoard] = useState(row.isBoard);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch(`/api/admin/diaconos/${row.memberId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, status, consecrationDate, area, congregationId, notes, isBoard }),
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
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold text-primary">{row.name}</h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Função</label>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
              <option value="Diácono">Diácono</option>
              <option value="Diaconisa">Diaconisa</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Situação</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              {requestMode && <option value="solicitado">Manter como solicitado</option>}
              <option value="ativo">Ativo</option>
              <option value="afastado">Afastado</option>
              <option value="emerito">Emérito</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Data de consagração
            </label>
            <input
              value={consecrationDate}
              onChange={(e) => setConsecrationDate(e.target.value)}
              placeholder="dd/mm/aaaa"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">
              Área de atuação
            </label>
            <input
              list="deacon-areas"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className={inputClass}
            />
            <datalist id="deacon-areas">
              {AREAS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Congregação / setor
          </label>
          <select
            value={congregationId}
            onChange={(e) => setCongregationId(e.target.value)}
            className={inputClass}
          >
            <option value="">Sede</option>
            {congregations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">Observações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        <label className="flex items-start gap-2 text-sm text-text-neutral">
          <input
            type="checkbox"
            checked={isBoard}
            onChange={(e) => setIsBoard(e.target.checked)}
            disabled={status !== "ativo"}
            className="mt-0.5"
          />
          <span>
            <strong>Diretoria diaconal</strong> — pode montar a escala e as atividades pela Área
            dos Diáconos (só para diáconos ativos).
          </span>
        </label>

        <div className="mt-2 flex items-center gap-3">
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Salvando..." : requestMode ? "Confirmar" : "Salvar"}
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

function ScheduleTab({
  schedule,
  activeDeacons,
}: {
  schedule: DeaconScheduleRow[];
  activeDeacons: DeaconRow[];
}) {
  const router = useRouter();
  const [serviceDate, setServiceDate] = useState("");
  const [serviceLabel, setServiceLabel] = useState("");
  const [memberId, setMemberId] = useState("");
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/admin/diaconos/escala", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceDate, serviceLabel, memberId, post }),
    });
    setLoading(false);
    if (res.ok) {
      setPost("");
      setMemberId("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remover este diácono da escala?")) return;
    const res = await fetch(`/api/admin/diaconos/escala/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-6">
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
              <label className="mb-1 block text-sm font-semibold text-text-neutral">Culto</label>
              <input
                required
                value={serviceLabel}
                onChange={(e) => setServiceLabel(e.target.value)}
                placeholder="Ex.: Culto de Domingo - 18h"
                className={inputClass}
              />
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
                {activeDeacons.map((d) => (
                  <option key={d.memberId} value={d.memberId}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">
                Posto / função
              </label>
              <input
                value={post}
                onChange={(e) => setPost(e.target.value)}
                placeholder="Ex.: Recepção"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? "Salvando..." : "Adicionar à escala"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </Card>

      {schedule.length === 0 ? (
        <p className="text-sm text-text-neutral/60">Nenhum diácono escalado para as próximas datas.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {schedule.map((s) => (
            <Card key={s.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold text-text-neutral">{s.memberName}</p>
                <p className="text-sm text-text-neutral/60">
                  {formatDate(s.serviceDate)} · {s.serviceLabel}
                  {s.post ? ` · ${s.post}` : ""}
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
          ))}
        </div>
      )}
    </div>
  );
}

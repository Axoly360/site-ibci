"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export interface Organization {
  id: string;
  name: string;
  short_name: string;
}

export interface OfficeRow {
  id: string;
  member_name: string;
  organization_id: string;
  org_short: string;
  office: string;
  start_date: string;
  end_date: string | null;
  active: boolean;
}

export interface MemberOption {
  id: string;
  name: string;
}

const inputClass =
  "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function br(iso: string | null) {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function mandate(o: OfficeRow) {
  return `desde ${br(o.start_date)}${o.end_date ? ` até ${br(o.end_date)}` : " · sem data de fim"}`;
}

export default function OfficesManager({
  organizations,
  offices,
  members,
}: {
  organizations: Organization[];
  offices: OfficeRow[];
  members: MemberOption[];
}) {
  const router = useRouter();

  const active = offices.filter((o) => o.active);
  const history = offices.filter((o) => !o.active);

  const handleRemove = async (o: OfficeRow) => {
    if (!confirm(`Remover ${o.office} de ${o.member_name} (${o.org_short})?`)) return;
    const res = await fetch(`/api/admin/diretorias/${o.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold text-primary">Diretoria atual</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {organizations.map((org) => {
            const current = active.filter((o) => o.organization_id === org.id);
            return (
              <Card key={org.id} className="p-5">
                <p className="font-heading font-semibold text-primary">
                  {org.short_name}{" "}
                  <span className="text-sm font-normal text-text-neutral/60">— {org.name}</span>
                </p>
                {current.length === 0 ? (
                  <p className="mt-2 text-sm text-text-neutral/60">Sem diretoria em exercício.</p>
                ) : (
                  <ul className="mt-2 flex flex-col gap-2">
                    {current.map((o) => (
                      <OfficeItem key={o.id} office={o} onRemove={() => handleRemove(o)} />
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      <AssignForm organizations={organizations} members={members} />

      <section>
        <h2 className="mb-3 font-heading text-lg font-semibold text-primary">
          Histórico e mandatos futuros
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhum mandato encerrado ou futuro.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((o) => (
              <Card key={o.id} className="p-4">
                <ul>
                  <OfficeItem office={o} onRemove={() => handleRemove(o)} showOrg />
                </ul>
              </Card>
            ))}
          </div>
        )}
      </section>

      <OrganizationsEditor organizations={organizations} />
    </div>
  );
}

function OfficeItem({
  office,
  onRemove,
  showOrg = false,
}: {
  office: OfficeRow;
  onRemove: () => void;
  showOrg?: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [start, setStart] = useState(office.start_date);
  const [end, setEnd] = useState(office.end_date ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/diretorias/${office.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startDate: start, endDate: end }),
    });
    setLoading(false);
    if (res.ok) {
      setEditing(false);
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  return (
    <li className="text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-text-neutral">
            {office.office}
            {showOrg ? ` · ${office.org_short}` : ""}: {office.member_name}
          </p>
          <p className="text-xs text-text-neutral/60">{mandate(office)}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            {editing ? <X className="h-3.5 w-3.5" /> : <Pencil className="h-3.5 w-3.5" />}
            {editing ? "Fechar" : "Datas"}
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remover cargo"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      {editing && (
        <form onSubmit={handleSave} className="mt-2 flex flex-wrap items-end gap-2">
          <div>
            <label className="mb-0.5 block text-xs font-semibold text-text-neutral">Início</label>
            <input
              required
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-0.5 block text-xs font-semibold text-text-neutral">Fim</label>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
          </div>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
          {error && <p className="w-full text-xs text-red-600">{error}</p>}
        </form>
      )}
    </li>
  );
}

function AssignForm({
  organizations,
  members,
}: {
  organizations: Organization[];
  members: MemberOption[];
}) {
  const router = useRouter();
  const [memberId, setMemberId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [office, setOffice] = useState("Presidente");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/diretorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId, organizationId, office, startDate, endDate }),
    });
    setLoading(false);
    if (res.ok) {
      setMemberId("");
      setEndDate("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível lançar o cargo.");
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <h2 className="flex items-center gap-1.5 font-heading text-lg font-semibold text-primary">
          <Plus className="h-5 w-5" />
          Lançar cargo
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Membro</label>
            <select required value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputClass}>
              <option value="">Selecione um membro validado</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Organização</label>
            <select
              required
              value={organizationId}
              onChange={(e) => setOrganizationId(e.target.value)}
              className={inputClass}
            >
              <option value="">Selecione</option>
              {organizations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.short_name} — {o.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-text-neutral">Cargo</label>
            <select value={office} onChange={(e) => setOffice(e.target.value)} className={inputClass}>
              <option value="Presidente">Presidente</option>
              <option value="Vice-presidente">Vice-presidente</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">Início</label>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-text-neutral">Fim</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>
        <p className="text-xs text-text-neutral/60">
          A insígnia aparece no perfil enquanto hoje estiver dentro do mandato. Sem data de fim, o
          mandato segue até você informar uma.
        </p>
        <div>
          <Button type="submit" size="sm" disabled={loading}>
            {loading ? "Lançando..." : "Lançar cargo"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </Card>
  );
}

function OrganizationsEditor({ organizations }: { organizations: Organization[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editShort, setEditShort] = useState("");

  const handleAdd = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/organizacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, shortName }),
    });
    if (res.ok) {
      setName("");
      setShortName("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível adicionar.");
    }
  };

  const handleSaveEdit = async (id: string) => {
    setError("");
    const res = await fetch(`/api/admin/organizacoes/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, shortName: editShort }),
    });
    if (res.ok) {
      setEditingId(null);
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível salvar.");
    }
  };

  const handleRemove = async (org: Organization) => {
    if (
      !confirm(
        `Remover ${org.short_name}? Todos os cargos lançados nessa organização (atuais e históricos) também serão apagados.`
      )
    ) {
      return;
    }
    const res = await fetch(`/api/admin/organizacoes/${org.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  return (
    <section>
      <h2 className="mb-3 font-heading text-lg font-semibold text-primary">Organizações</h2>
      <Card className="p-5">
        <ul className="mb-4 flex flex-col gap-2">
          {organizations.map((org) =>
            editingId === org.id ? (
              <li key={org.id} className="flex flex-wrap items-center gap-2">
                <input
                  value={editShort}
                  onChange={(e) => setEditShort(e.target.value)}
                  placeholder="Sigla"
                  className={`${inputClass} sm:w-32`}
                />
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Nome"
                  className={`${inputClass} flex-1`}
                />
                <Button size="sm" onClick={() => handleSaveEdit(org.id)}>
                  Salvar
                </Button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="text-sm font-semibold text-text-neutral/60"
                >
                  Cancelar
                </button>
              </li>
            ) : (
              <li key={org.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-text-neutral">
                  <strong>{org.short_name}</strong> — {org.name}
                </span>
                <span className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(org.id);
                      setEditName(org.name);
                      setEditShort(org.short_name);
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(org)}
                    aria-label={`Remover ${org.short_name}`}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </li>
            )
          )}
        </ul>
        <form onSubmit={handleAdd} className="flex flex-wrap items-center gap-2">
          <input
            required
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="Sigla (ex.: SHB)"
            maxLength={20}
            className={`${inputClass} sm:w-40`}
          />
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome da organização"
            maxLength={80}
            className={`${inputClass} flex-1`}
          />
          <Button type="submit" size="sm">
            Adicionar
          </Button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </Card>
    </section>
  );
}

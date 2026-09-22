"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Power, Trash2, UserPlus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface CongregationUser {
  id: string;
  name: string;
  email: string;
  status: string;
}

export default function CongregationUsersManager({
  slug,
  users,
}: {
  slug: string;
  users: CongregationUser[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/congregacoes/${slug}/responsaveis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    setLoading(false);
    if (res.ok) {
      setName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar o responsável.");
    }
  };

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/admin/congregacoes/${slug}/responsaveis/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  };

  const handleToggleStatus = async (u: CongregationUser) => {
    const nextStatus = u.status === "ativo" ? "inativo" : "ativo";
    await fetch(`/api/admin/congregacoes/${slug}/responsaveis/${u.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: u.name, email: u.email, status: nextStatus }),
    });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <h2 className="font-heading text-lg font-semibold text-primary">
          Novo responsável
        </h2>
        <form onSubmit={handleCreate} className="mt-4 flex flex-col gap-3">
          <input
            required
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <input
            required
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <input
            required
            type="password"
            placeholder="Senha inicial (avise a pessoa por fora)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" disabled={loading}>
            <UserPlus className="h-4 w-4" />
            {loading ? "Criando..." : "Criar responsável"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {users.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhum responsável cadastrado ainda.</p>
        ) : (
          users.map((u) =>
            editingId === u.id ? (
              <EditUserCard
                key={u.id}
                slug={slug}
                user={u}
                onCancel={() => setEditingId(null)}
                onSaved={() => {
                  setEditingId(null);
                  router.refresh();
                }}
              />
            ) : (
              <Card key={u.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-text-neutral">
                    {u.name}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        u.status === "ativo"
                          ? "bg-primary/10 text-primary"
                          : "bg-black/5 text-text-neutral/50"
                      }`}
                    >
                      {u.status === "ativo" ? "Ativo" : "Desativado"}
                    </span>
                  </p>
                  <p className="text-sm text-text-neutral/60">{u.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setEditingId(u.id)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(u)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-text-neutral/70 hover:text-primary"
                  >
                    <Power className="h-4 w-4" />
                    {u.status === "ativo" ? "Desativar" : "Ativar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(u.id)}
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

function EditUserCard({
  slug,
  user,
  onCancel,
  onSaved,
}: {
  slug: string;
  user: CongregationUser;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/congregacoes/${slug}/responsaveis/${user.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, status: user.status }),
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
            Editar responsável
          </h3>
          <button type="button" onClick={onCancel} className="text-text-neutral/50 hover:text-text-neutral">
            <X className="h-4 w-4" />
          </button>
        </div>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-mail"
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
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

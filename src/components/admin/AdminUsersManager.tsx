"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Power, Trash2, UserPlus, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: string;
}

interface AdminUsersManagerProps {
  admins: AdminUser[];
  roles: Record<string, string[]>;
  currentAdminId: string;
}

export default function AdminUsersManager({
  admins,
  roles,
  currentAdminId,
}: AdminUsersManagerProps) {
  const router = useRouter();
  const roleNames = Object.keys(roles);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roleNames[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/administradores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    setLoading(false);
    if (res.ok) {
      setName("");
      setEmail("");
      setPassword("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível criar o administrador.");
    }
  };

  const handleRemove = async (id: string) => {
    const res = await fetch(`/api/admin/administradores/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const handleToggleStatus = async (a: AdminUser) => {
    const nextStatus = a.status === "ativo" ? "inativo" : "ativo";
    await fetch(`/api/admin/administradores/${a.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: a.name, email: a.email, role: a.role, status: nextStatus }),
    });
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-8">
      <Card className="p-6">
        <h2 className="font-heading text-lg font-semibold text-primary">
          Novo administrador
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
            minLength={6}
            className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            {roleNames.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-neutral/60">
            Permissões desta função: {roles[role].join(", ")}
          </p>
          <Button type="submit" disabled={loading}>
            <UserPlus className="h-4 w-4" />
            {loading ? "Criando..." : "Criar administrador"}
          </Button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {admins.map((a) =>
          editingId === a.id ? (
            <EditAdminCard
              key={a.id}
              admin={a}
              roles={roles}
              onCancel={() => setEditingId(null)}
              onSaved={() => {
                setEditingId(null);
                router.refresh();
              }}
            />
          ) : (
            <Card key={a.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="flex items-center gap-2 font-semibold text-text-neutral">
                  {a.name}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      a.status === "ativo"
                        ? "bg-primary/10 text-primary"
                        : "bg-black/5 text-text-neutral/50"
                    }`}
                  >
                    {a.status === "ativo" ? "Ativo" : "Desativado"}
                  </span>
                </p>
                <p className="text-sm text-text-neutral/60">
                  {a.email} · {a.role}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditingId(a.id)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                {a.id !== currentAdminId && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(a)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-text-neutral/70 hover:text-primary"
                    >
                      <Power className="h-4 w-4" />
                      {a.status === "ativo" ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(a.id)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </button>
                  </>
                )}
                {a.id === currentAdminId && (
                  <span className="text-xs font-semibold text-text-neutral/50">Você</span>
                )}
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
}

interface EditAdminCardProps {
  admin: AdminUser;
  roles: Record<string, string[]>;
  onCancel: () => void;
  onSaved: () => void;
}

function EditAdminCard({ admin, roles, onCancel, onSaved }: EditAdminCardProps) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [role, setRole] = useState(admin.role);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/admin/administradores/${admin.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, status: admin.status }),
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
            Editar administrador
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
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full rounded-lg border border-black/10 bg-bg-light px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {Object.keys(roles).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
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

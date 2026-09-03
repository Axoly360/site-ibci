"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Trash2, UserPlus } from "lucide-react";
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
        {admins.map((a) => (
          <Card key={a.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold text-text-neutral">{a.name}</p>
              <p className="text-sm text-text-neutral/60">
                {a.email} · {a.role}
              </p>
            </div>
            {a.id !== currentAdminId ? (
              <button
                type="button"
                onClick={() => handleRemove(a.id)}
                className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </button>
            ) : (
              <span className="text-xs font-semibold text-text-neutral/50">
                Você
              </span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

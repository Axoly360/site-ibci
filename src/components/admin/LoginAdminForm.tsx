"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Send } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LoginAdminForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível entrar.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-3">
      <label htmlFor="admin-login-email" className="sr-only">
        E-mail
      </label>
      <input
        id="admin-login-email"
        type="email"
        required
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <label htmlFor="admin-login-password" className="sr-only">
        Senha
      </label>
      <input
        id="admin-login-password"
        type="password"
        required
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" disabled={loading}>
        <Send className="h-5 w-5" />
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-600">
          <Lock className="h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
      <Link
        href="/esqueci-senha?tipo=admin"
        className="text-center text-sm font-semibold text-secondary hover:underline"
      >
        Esqueci minha senha
      </Link>
    </form>
  );
}

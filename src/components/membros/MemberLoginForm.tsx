"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, Send } from "lucide-react";
import Button from "@/components/ui/Button";

export default function MemberLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/membros/entrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      router.push(data?.validated ? "/central-do-membro/area" : "/central-do-membro");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível entrar.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-3">
      <input
        type="email"
        required
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <input
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
    </form>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, KeyRound } from "lucide-react";
import Button from "@/components/ui/Button";

export default function ChangePasswordForm() {
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const res = await fetch("/api/admin/conta/senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
    if (res.ok) {
      setStatus("done");
      setSenhaAtual("");
      setNovaSenha("");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível trocar a senha.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm flex-col gap-3">
      <input
        type="password"
        required
        placeholder="Senha atual"
        value={senhaAtual}
        onChange={(e) => setSenhaAtual(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <input
        type="password"
        required
        minLength={6}
        placeholder="Nova senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" disabled={status === "loading"}>
        <KeyRound className="h-4 w-4" />
        {status === "loading" ? "Salvando..." : "Trocar senha"}
      </Button>
      {status === "done" && (
        <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
          <CheckCircle2 className="h-4 w-4" />
          Senha atualizada
        </p>
      )}
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

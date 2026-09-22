"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Button from "@/components/ui/Button";

export default function RedefinirSenhaForm({ token }: { token: string }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (novaSenha !== confirmar) {
      setError("As senhas não são iguais.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setError("");
    const res = await fetch("/api/auth/redefinir-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, novaSenha }),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível redefinir a senha.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-primary/10 p-6 text-sm font-semibold text-primary">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        Senha redefinida! Já pode entrar com a nova senha.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="rsf-nova-senha" className="sr-only">
        Nova senha
      </label>
      <input
        id="rsf-nova-senha"
        required
        type="password"
        minLength={8}
        placeholder="Nova senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <label htmlFor="rsf-confirmar-senha" className="sr-only">
        Confirme a nova senha
      </label>
      <input
        id="rsf-confirmar-senha"
        required
        type="password"
        minLength={8}
        placeholder="Confirme a nova senha"
        value={confirmar}
        onChange={(e) => setConfirmar(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" disabled={status === "loading"}>
        <Send className="h-4 w-4" />
        {status === "loading" ? "Salvando..." : "Redefinir senha"}
      </Button>
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

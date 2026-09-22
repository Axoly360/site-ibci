"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Button from "@/components/ui/Button";

export default function EsqueciSenhaForm({ scope }: { scope: "admin" | "membro" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const res = await fetch("/api/auth/esqueci-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, scope }),
    });
    if (res.ok) {
      setStatus("done");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar o e-mail.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <p className="flex items-center gap-2 rounded-2xl bg-primary/10 p-6 text-sm font-semibold text-primary">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        Se esse e-mail tiver cadastro, você vai receber um link para
        redefinir sua senha em instantes. Confira também a caixa de spam.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="esqueci-email" className="sr-only">
        E-mail
      </label>
      <input
        id="esqueci-email"
        required
        type="email"
        placeholder="Seu e-mail de login"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" disabled={status === "loading"}>
        <Send className="h-4 w-4" />
        {status === "loading" ? "Enviando..." : "Enviar link de redefinição"}
      </Button>
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}

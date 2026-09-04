"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import Button from "@/components/ui/Button";

interface LoginFormProps {
  session: { name: string; email: string } | null;
  next?: string;
}

export default function LoginForm({ session, next }: LoginFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  if (session) {
    return (
      <p className="text-center text-text-neutral/80">
        Você já está logado como <strong>{session.email}</strong>.
      </p>
    );
  }

  if (status === "sent") {
    return (
      <p className="flex items-center justify-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-center font-semibold text-primary">
        <Mail className="h-5 w-5 shrink-0" />
        Enviamos um link de confirmação para o seu e-mail. Clique nele para
        entrar.
      </p>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, next }),
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      const data = await res.json().catch(() => null);
      setErrorMessage(data?.error ?? "Não foi possível enviar o e-mail.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3">
      <input
        type="text"
        required
        placeholder="Seu nome completo"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <input
        type="email"
        required
        placeholder="Seu e-mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" disabled={status === "loading"}>
        <Send className="h-5 w-5" />
        {status === "loading" ? "Enviando..." : "Entrar / Cadastrar"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
      <p className="text-xs text-text-neutral/60">
        Sem senha: enviaremos um link de confirmação para o seu e-mail.
      </p>
    </form>
  );
}

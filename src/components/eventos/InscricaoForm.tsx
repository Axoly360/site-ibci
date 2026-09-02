"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, Send } from "lucide-react";
import Button from "@/components/ui/Button";

interface InscricaoFormProps {
  eventSlug: string;
  session: { name: string; email: string } | null;
  alreadyRegistered: boolean;
  soldOut: boolean;
}

export default function InscricaoForm({
  eventSlug,
  session,
  alreadyRegistered,
  soldOut,
}: InscricaoFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "done" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  if (alreadyRegistered || status === "done") {
    return (
      <p className="flex items-center justify-center gap-2 rounded-full bg-primary/10 px-6 py-3 font-semibold text-primary">
        <CheckCircle2 className="h-5 w-5" />
        Inscrição confirmada!
      </p>
    );
  }

  if (soldOut) {
    return (
      <p className="rounded-full bg-black/5 px-6 py-3 text-center font-semibold text-text-neutral/70">
        Vagas esgotadas
      </p>
    );
  }

  if (status === "sent") {
    return (
      <p className="flex items-center justify-center gap-2 rounded-full bg-primary/10 px-6 py-3 text-center font-semibold text-primary">
        <Mail className="h-5 w-5 shrink-0" />
        Enviamos um link de confirmação para o seu e-mail. Clique nele para
        concluir a inscrição.
      </p>
    );
  }

  const handleLoggedInSubmit = async () => {
    setStatus("loading");
    const res = await fetch(`/api/eventos/${eventSlug}/inscrever`, {
      method: "POST",
    });
    if (res.ok) {
      setStatus("done");
    } else {
      const data = await res.json().catch(() => null);
      setErrorMessage(data?.error ?? "Não foi possível concluir a inscrição.");
      setStatus("error");
    }
  };

  const handleGuestSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/solicitar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, eventSlug }),
    });
    if (res.ok) {
      setStatus("sent");
    } else {
      const data = await res.json().catch(() => null);
      setErrorMessage(data?.error ?? "Não foi possível enviar o e-mail.");
      setStatus("error");
    }
  };

  if (session) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button onClick={handleLoggedInSubmit} disabled={status === "loading"}>
          <Send className="h-5 w-5" />
          {status === "loading" ? "Inscrevendo..." : "Inscrever-se"}
        </Button>
        <p className="text-xs text-text-neutral/60">
          Você está logado como {session.email}
        </p>
        {status === "error" && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleGuestSubmit}
      className="mx-auto flex max-w-md flex-col gap-3"
    >
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
        {status === "loading" ? "Enviando..." : "Inscrever-se"}
      </Button>
      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
      <p className="text-xs text-text-neutral/60">
        Enviaremos um link de confirmação para o seu e-mail.
      </p>
    </form>
  );
}

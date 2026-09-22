"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, FileText, MessageCircle, UserRound } from "lucide-react";
import { formatCPF } from "@/lib/masks";

export default function TornarMembroForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const res = await fetch("/api/membros/seja-membro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, cpf, consent }),
    });
    if (res.ok) {
      setStatus("done");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar seus dados.");
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-3xl bg-primary-dark p-10 text-center shadow-xl">
        <CheckCircle2 className="h-10 w-10 text-secondary" />
        <p className="font-heading text-xl font-bold text-white">Dados enviados!</p>
        <p className="text-sm text-white/70">
          A diretoria vai analisar seu cadastro. Você será avisado(a) quando for validado(a).
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg rounded-3xl bg-primary-dark p-8 shadow-xl sm:p-10">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">
          Ficamos felizes em ter você conosco!
        </h1>
        <p className="mt-3 text-sm text-white/70">
          Preencha os dados abaixo para continuarmos nossa jornada juntos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="tmf-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-secondary">
            Nome completo
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <UserRound className="h-4 w-4 shrink-0 text-white/40" />
            <input
              id="tmf-name"
              required
              placeholder="Digite seu nome completo"
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tmf-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-secondary">
              Telefone / WhatsApp
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <MessageCircle className="h-4 w-4 shrink-0 text-white/40" />
              <input
                id="tmf-phone"
                placeholder="(00) 0 0000-0000"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
          </div>
          <div>
            <label htmlFor="tmf-cpf" className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-secondary">
              CPF
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <FileText className="h-4 w-4 shrink-0 text-white/40" />
              <input
                id="tmf-cpf"
                inputMode="numeric"
                maxLength={14}
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCpf(formatCPF(e.target.value))}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 text-xs leading-relaxed text-white/60">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 shrink-0"
          />
          Concordo em disponibilizar os dados supramencionados para tratamento (coleta e
          armazenamento) com finalidade específica de comunicação e acompanhamento de caráter
          religioso/administrativo, tudo nos exatos termos do art. 7º, inciso I, da Lei nº
          13.709/2018 — Lei Geral de Proteção de Dados.
        </label>

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-2 flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3.5 text-sm font-bold text-primary shadow-sm transition-colors hover:bg-secondary-light disabled:opacity-60"
        >
          {status === "loading" ? "Enviando..." : "Enviar Meus Dados"}
          <ArrowRight className="h-4 w-4" />
        </button>
        {error && <p className="text-center text-sm text-red-300">{error}</p>}
      </form>
    </div>
  );
}

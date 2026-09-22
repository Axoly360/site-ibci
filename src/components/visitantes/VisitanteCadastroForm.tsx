"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function VisitanteCadastroForm({ eventSlug }: { eventSlug: string }) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sex, setSex] = useState("");
  const [firstVisit, setFirstVisit] = useState(true);
  const [visitTimes, setVisitTimes] = useState("");
  const [isChristian, setIsChristian] = useState(false);
  const [churchName, setChurchName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Informe seu nome.");
      return;
    }
    if (!whatsapp.trim()) {
      setError("Informe seu WhatsApp.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/visitantes/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        whatsapp,
        sex,
        firstVisit,
        visitTimes,
        isChristian,
        churchName,
        location,
        eventSlug,
      }),
    });
    setLoading(false);

    if (res.ok) {
      setDone(true);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível enviar seu cadastro.");
    }
  };

  if (done) {
    return (
      <Card className="mx-auto max-w-md space-y-2 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="font-heading text-xl font-bold text-primary">
          Que alegria ter você aqui!
        </h2>
        <p className="text-sm text-text-neutral/70">
          Seu cadastro foi recebido. Nossa equipe vai entrar em contato em
          breve.
        </p>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md space-y-4 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="visitante-nome" className="mb-1 block text-sm font-semibold text-text-neutral">
            Nome completo
          </label>
          <input
            id="visitante-nome"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label htmlFor="visitante-whatsapp" className="mb-1 block text-sm font-semibold text-text-neutral">
            WhatsApp
          </label>
          <input
            id="visitante-whatsapp"
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="(81) 90000-0000"
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
          />
        </div>

        <div>
          <label htmlFor="visitante-sexo" className="mb-1 block text-sm font-semibold text-text-neutral">
            Sexo
          </label>
          <select
            id="visitante-sexo"
            value={sex}
            onChange={(e) => setSex(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
          >
            <option value="">Prefiro não informar</option>
            <option value="Feminino">Feminino</option>
            <option value="Masculino">Masculino</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Já visitou a igreja antes?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFirstVisit(true)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                firstVisit
                  ? "border-primary bg-primary text-white"
                  : "border-black/10 text-text-neutral/70"
              }`}
            >
              É minha primeira vez
            </button>
            <button
              type="button"
              onClick={() => setFirstVisit(false)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                !firstVisit
                  ? "border-primary bg-primary text-white"
                  : "border-black/10 text-text-neutral/70"
              }`}
            >
              Já visitei antes
            </button>
          </div>
          {!firstVisit && (
            <input
              type="number"
              min={1}
              value={visitTimes}
              onChange={(e) => setVisitTimes(e.target.value)}
              placeholder="Quantas vezes? (opcional)"
              className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
            />
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Você é cristão(ã) ou frequenta alguma igreja?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsChristian(false)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                !isChristian
                  ? "border-primary bg-primary text-white"
                  : "border-black/10 text-text-neutral/70"
              }`}
            >
              Não
            </button>
            <button
              type="button"
              onClick={() => setIsChristian(true)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                isChristian
                  ? "border-primary bg-primary text-white"
                  : "border-black/10 text-text-neutral/70"
              }`}
            >
              Sim
            </button>
          </div>
          {isChristian && (
            <input
              type="text"
              value={churchName}
              onChange={(e) => setChurchName(e.target.value)}
              placeholder="Qual igreja?"
              className="mt-2 w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
            />
          )}
        </div>

        <div>
          <label htmlFor="visitante-local" className="mb-1 block text-sm font-semibold text-text-neutral">
            Bairro/Cidade
          </label>
          <input
            id="visitante-local"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex.: Ibura, Recife"
            className="w-full rounded-lg border border-black/10 px-3 py-2.5 text-sm"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full justify-center">
          <Send className="h-4 w-4" />
          {loading ? "Enviando..." : "Enviar cadastro"}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="text-center text-xs text-text-neutral/50">
          Seus dados são usados só para contato da nossa equipe de recepção e
          não são compartilhados com terceiros.
        </p>
      </form>
    </Card>
  );
}

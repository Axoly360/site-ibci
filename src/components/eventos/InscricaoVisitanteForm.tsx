"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import Button from "@/components/ui/Button";

export default function InscricaoVisitanteForm({ eventSlug }: { eventSlug: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/eventos/${eventSlug}/inscricao`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/para-voce/eventos/${eventSlug}/inscricao/sucesso?code=${data.code}`);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Não foi possível concluir sua inscrição.");
      setLoading(false);
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
        type="tel"
        required
        placeholder="Seu telefone/WhatsApp"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <input
        type="email"
        placeholder="Seu e-mail (opcional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-text-neutral outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" disabled={loading}>
        <Send className="h-5 w-5" />
        {loading ? "Enviando..." : "Gerar meu QR Code"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-text-neutral/60">
        Você vai receber um QR Code para apresentar na entrada do evento.
      </p>
    </form>
  );
}

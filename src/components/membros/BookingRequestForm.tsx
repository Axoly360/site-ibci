"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatDateBR } from "@/lib/masks";

interface Booking {
  id: string;
  event_type: string;
  desired_date: string | null;
  status: string;
  requested_at: string;
}

const STATUS_LABEL: Record<string, string> = {
  pendente: "Aguardando análise",
  aprovado: "Aprovado",
  recusado: "Não disponível",
};

export default function BookingRequestForm() {
  const [eventType, setEventType] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  const loadBookings = () => {
    fetch("/api/membros/agendamentos")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setBookings(data?.bookings ?? []))
      .catch(() => setBookings([]));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleSubmit = async () => {
    setError("");
    setDone(false);
    if (!eventType) {
      setError("Escolha o tipo de evento.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/membros/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, desiredDate, message }),
    });
    setLoading(false);

    if (res.ok) {
      setEventType("");
      setDesiredDate("");
      setMessage("");
      setDone(true);
      loadBookings();
      setTimeout(() => setDone(false), 3000);
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? `Não foi possível enviar o pedido (${res.status}).`);
    }
  };

  return (
    <Card className="space-y-5 p-6">
      <div>
        <h2 className="font-heading text-lg font-semibold text-primary">
          Agendamento de Casamentos, Cultos de Ação de Graças e etc.
        </h2>
        <p className="mt-1 text-sm text-text-neutral/70">
          Solicite a disponibilidade de data para o seu evento. Nossa equipe
          vai analisar e retornar por aqui.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Tipo de evento
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="">Selecione...</option>
            <option value="Casamento">Casamento</option>
            <option value="Culto de Ação de Graças">Culto de Ação de Graças</option>
            <option value="Batismo">Batismo</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Data desejada
          </label>
          <input
            type="text"
            value={desiredDate}
            onChange={(e) => setDesiredDate(formatDateBR(e.target.value))}
            placeholder="dd/mm/aaaa"
            maxLength={10}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-text-neutral">
            Mensagem (opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Detalhes do evento, horário preferido, etc."
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
        </div>

        <Button onClick={handleSubmit} size="sm" disabled={loading}>
          <Send className="h-4 w-4" />
          {loading ? "Enviando..." : "Solicitar agendamento"}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {done && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Pedido enviado com sucesso
          </p>
        )}
      </div>

      {bookings && bookings.length > 0 && (
        <div className="space-y-2 border-t border-black/10 pt-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-neutral/50">
            Seus pedidos
          </span>
          <ul className="space-y-1.5 text-sm">
            {bookings.map((booking) => (
              <li key={booking.id} className="flex items-center justify-between gap-2">
                <span className="text-text-neutral">
                  {booking.event_type}
                  {booking.desired_date ? ` — ${booking.desired_date}` : ""}
                </span>
                <span className="shrink-0 text-xs font-semibold text-secondary">
                  {STATUS_LABEL[booking.status] ?? booking.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

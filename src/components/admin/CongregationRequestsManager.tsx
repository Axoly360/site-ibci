"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";

export interface CongregationRequestRow {
  id: string;
  category: string;
  description: string;
  estimated_amount: string | null;
  status: string;
  requested_at: string;
  response_note: string | null;
}

function formatCurrency(value: string | null) {
  if (!value) return "—";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export default function CongregationRequestsManager({
  slug,
  requests,
}: {
  slug: string;
  requests: CongregationRequestRow[];
}) {
  const router = useRouter();
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const decidir = async (id: string, decision: "aprovado" | "recusado") => {
    setLoading(true);
    await fetch(`/api/admin/congregacoes/${slug}/solicitacoes/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, responseNote: note }),
    });
    setLoading(false);
    setRespondingId(null);
    setNote("");
    router.refresh();
  };

  const pendentes = requests.filter((r) => r.status === "pendente");
  const decididas = requests.filter((r) => r.status !== "pendente");

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-6">
        <h2 className="mb-4 font-heading text-lg font-semibold text-primary">
          Pendentes ({pendentes.length})
        </h2>
        {pendentes.length === 0 ? (
          <p className="text-sm text-text-neutral/60">Nenhuma solicitação pendente.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {pendentes.map((r) => (
              <div key={r.id} className="rounded-lg border border-black/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-text-neutral">{r.category}</span>
                  <span className="text-xs text-text-neutral/60">{formatDate(r.requested_at)}</span>
                </div>
                <p className="mt-1 text-sm text-text-neutral/80">{r.description}</p>
                {r.estimated_amount && (
                  <p className="mt-1 text-sm font-semibold text-primary">
                    Valor estimado: {formatCurrency(r.estimated_amount)}
                  </p>
                )}

                {respondingId === r.id ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Observação para a congregação (opcional)"
                      className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => decidir(r.id, "aprovado")}
                        className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Confirmar aprovação
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => decidir(r.id, "recusado")}
                        className="flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Confirmar recusa
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRespondingId(null);
                          setNote("");
                        }}
                        className="text-xs font-semibold text-text-neutral/60"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRespondingId(r.id)}
                    className="mt-3 rounded-full bg-secondary px-4 py-1.5 text-xs font-bold text-primary hover:bg-secondary-light"
                  >
                    Responder
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {decididas.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-4 font-heading text-lg font-semibold text-primary">
            Histórico
          </h2>
          <div className="flex flex-col gap-3">
            {decididas.map((r) => (
              <div key={r.id} className="rounded-lg border border-black/5 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-text-neutral">
                    {r.category} — {r.description}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      r.status === "aprovado" ? "text-primary" : "text-red-600"
                    }`}
                  >
                    {r.status === "aprovado" ? "Aprovado" : "Recusado"}
                  </span>
                </div>
                {r.response_note && (
                  <p className="mt-1 text-xs text-text-neutral/60">{r.response_note}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

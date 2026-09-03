"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, X } from "lucide-react";
import Card from "@/components/ui/Card";

export interface MembershipRequestRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  birthdate: string | null;
  address: string | null;
  time_at_church: string | null;
  note: string | null;
  requested_at: string;
  status: string;
}

export default function MembershipQueueManager({
  pendentes,
  recentes,
}: {
  pendentes: MembershipRequestRow[];
  recentes: MembershipRequestRow[];
}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const decide = async (id: string, decision: "aprovado" | "recusado") => {
    setLoadingId(id);
    await fetch(`/api/admin/membros/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setLoadingId(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="font-heading text-lg font-semibold text-primary">
          Aguardando validação ({pendentes.length})
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {pendentes.length === 0 && (
            <p className="text-sm text-text-neutral/60">Nenhum cadastro pendente.</p>
          )}
          {pendentes.map((r) => {
            const open = openId === r.id;
            return (
              <Card key={r.id} className="p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : r.id)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <div>
                    <p className="font-semibold text-text-neutral">{r.name}</p>
                    <p className="text-sm text-text-neutral/60">
                      {r.email} · solicitado em{" "}
                      {new Date(r.requested_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-text-neutral/50 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>

                {open && (
                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-black/5 pt-4 text-sm sm:grid-cols-2">
                    <Field label="Telefone / WhatsApp" value={r.phone} />
                    <Field label="CPF" value={r.cpf} />
                    <Field label="Data de nascimento" value={r.birthdate} />
                    <Field label="Há quanto tempo frequenta a IBCI" value={r.time_at_church} />
                    <div className="sm:col-span-2">
                      <Field label="Endereço" value={r.address} />
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Observação enviada no cadastro" value={r.note} />
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    disabled={loadingId === r.id}
                    onClick={() => decide(r.id, "aprovado")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Aprovar
                  </button>
                  <button
                    type="button"
                    disabled={loadingId === r.id}
                    onClick={() => decide(r.id, "recusado")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Recusar
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold text-primary">
          Decididos recentemente
        </h2>
        <div className="mt-4 flex flex-col gap-2">
          {recentes.length === 0 && (
            <p className="text-sm text-text-neutral/60">Nenhuma decisão ainda.</p>
          )}
          {recentes.map((r) => (
            <Card key={r.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold text-text-neutral">{r.name}</p>
                <p className="text-sm text-text-neutral/60">{r.email}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  r.status === "aprovado"
                    ? "bg-primary/10 text-primary"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {r.status === "aprovado" ? "Aprovado" : "Recusado"}
              </span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-text-neutral/50">
        {label}
      </p>
      <p className="text-text-neutral">{value || "—"}</p>
    </div>
  );
}
